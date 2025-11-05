// app/api/generate/logo/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CreditService } from "@/lib/credits";
import { CREDIT_COSTS, PLAN_FEATURES } from "@/lib/credits/constants";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/storage";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 2. Parse request
    const { prompt, projectId, style, quality } = await req.json();

    // 3. Get user's plan to determine quality
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, credits: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const planFeatures = PLAN_FEATURES[user.plan];
    const creditCost = CREDIT_COSTS.LOGO_GENERATION;

    // 4. Check credits
    const hasEnoughCredits = await CreditService.hasCredits(userId, creditCost);
    if (!hasEnoughCredits) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          required: creditCost,
          available: user.credits,
        },
        { status: 402 } // Payment Required
      );
    }

    // 5. Create pending asset
    const asset = await prisma.brandAsset.create({
      data: {
        userId,
        projectId,
        type: "LOGO",
        status: "PROCESSING",
        prompt,
        creditsUsed: creditCost,
        model: "dall-e-3",
        data: { style, requestedQuality: quality },
      },
    });

    try {
      // 6. Deduct credits BEFORE generation
      const deductResult = await CreditService.deduct({
        userId,
        amount: creditCost,
        reason: "logo_generation",
        description: `Generated logo: ${prompt.substring(0, 50)}...`,
        assetId: asset.id,
        metadata: { prompt, style, quality: planFeatures.logoQuality },
      });

      if (!deductResult.success) {
        throw new Error(deductResult.error || "Failed to deduct credits");
      }

      // 7. Generate with DALL-E
      const startTime = Date.now();

      const image = await openai.images.generate({
        model: "dall-e-3",
        prompt: buildLogoPrompt(prompt, style),
        n: 1,
        size: "1024x1024",
        quality: planFeatures.logoQuality, // 'standard' or 'hd' based on plan
      });

      const generationTime = Date.now() - startTime;

      if (!image.data?.[0]?.url) {
        throw new Error("No image generated");
      }

      // 8. Download and upload to storage
      const response = await fetch(image.data[0].url);
      const blob = await response.blob();
      const file = new File([blob], "logo.png", { type: "image/png" });

      const uploadResult = await uploadImage(file, userId, "logo");

      // 9. Update asset as completed
      const completedAsset = await prisma.brandAsset.update({
        where: { id: asset.id },
        data: {
          status: "COMPLETED",
          url: uploadResult.url,
          storagePath: uploadResult.path,
          fileSize: uploadResult.size,
          mimeType: "image/png",
          generationTime,
          data: {
            ...(asset.data as Record<string, unknown>),
            revisedPrompt: image.data[0].revised_prompt,
          },
        },
        include: {
          project: {
            select: { name: true },
          },
        },
      });

      // 10. Return success
      return NextResponse.json({
        success: true,
        asset: completedAsset,
        creditsUsed: creditCost,
        remainingCredits: deductResult.newBalance,
      });
    } catch (error) {
      console.error("Logo generation failed:", error);

      // Refund credits on failure
      await CreditService.refund({
        userId,
        amount: creditCost,
        reason: "generation_failed",
        assetId: asset.id,
      });

      // Update asset as failed
      await prisma.brandAsset.update({
        where: { id: asset.id },
        data: {
          status: "FAILED",
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        },
      });

      return NextResponse.json(
        {
          error: "Generation failed",
          message: error instanceof Error ? error.message : "Unknown error",
          creditsRefunded: true,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function buildLogoPrompt(userPrompt: string, style: string): string {
  return `Professional logo design: ${userPrompt}
    Style: ${style}
    Requirements:
    - Clean, scalable vector-style design
    - Simple and memorable
    - Centered composition
    - No text or letters
    - Suitable for light and dark backgrounds`;
}
