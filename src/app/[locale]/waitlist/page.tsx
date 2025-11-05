"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { waitlistSchema } from "@/lib/schemas/waitlist.schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { toast } from "sonner";
import { Copy, Check, Share2, Users, Sparkles, RefreshCw } from "lucide-react";

type WaitlistForm = z.infer<typeof waitlistSchema>;

export default function WaitlistPage() {
  const searchParams = useSearchParams();
  const referralParam = searchParams.get("ref");

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [position, setPosition] = useState<number | null>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showLookup, setShowLookup] = useState(false);
  const [lookupValue, setLookupValue] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);

  const form = useForm<WaitlistForm>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      email: "",
      name: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: WaitlistForm) {
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          referral: referralParam || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      setReferralCode(result.referralCode);
      setPosition(result.position || null);
      setIsSubmitted(true);

      // Guardar en localStorage para recuperación futura
      localStorage.setItem("waitlist_referral_code", result.referralCode);

      toast.success(result.message || "Successfully joined!");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to join waitlist"
      );
    }
  }

  const handleCopyReferralLink = () => {
    const baseURL = window.location.origin;
    const referralUrl = `${baseURL}/waitlist?ref=${referralCode}`;
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const baseURL = window.location.origin;
    const referralUrl = `${baseURL}/waitlist?ref=${referralCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join the Waitlist",
          text: "Join me on the waitlist for this amazing app!",
          url: referralUrl,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      handleCopyReferralLink();
    }
  };

  const refreshStats = async () => {
    if (!referralCode) return;

    try {
      const response = await fetch(`/api/waitlist/stats?code=${referralCode}`);
      if (response.ok) {
        const data = await response.json();
        setPosition(data.position);
        setReferralCount(data.referralCount);
      }
    } catch (error) {
      console.error("Failed to refresh stats:", error);
    }
  };

  const handleLookup = async () => {
    if (!lookupValue.trim()) {
      toast.error("Please enter your email or referral code");
      return;
    }

    setIsLookingUp(true);

    try {
      // Intentar buscar por código primero
      let response = await fetch(`/api/waitlist/stats?code=${lookupValue}`);

      // Si falla, intentar buscar por email
      if (!response.ok) {
        response = await fetch(
          `/api/waitlist/lookup?email=${encodeURIComponent(lookupValue)}`
        );
      }

      if (!response.ok) {
        throw new Error("Not found. Please check your email or referral code.");
      }

      const data = await response.json();

      // Recuperar información
      setReferralCode(data.referralCode || lookupValue);
      setPosition(data.position);
      setReferralCount(data.referralCount);
      setIsSubmitted(true);

      // Guardar en localStorage
      localStorage.setItem(
        "waitlist_referral_code",
        data.referralCode || lookupValue
      );

      setShowLookup(false);
      toast.success("Welcome back!");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to find your waitlist entry"
      );
    } finally {
      setIsLookingUp(false);
    }
  };

  // Cargar desde localStorage al montar
  useEffect(() => {
    const savedCode = localStorage.getItem("waitlist_referral_code");
    // Solo cargar si NO hay un referralParam nuevo (para permitir usar otro link)
    if (savedCode && !referralParam) {
      setReferralCode(savedCode);
      setIsSubmitted(true);
    }
  }, [referralParam]);

  // Cargar estadísticas iniciales cuando el componente monta con un referralCode
  useEffect(() => {
    if (isSubmitted && referralCode) {
      refreshStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitted, referralCode]);

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <div className="max-w-2xl w-full space-y-8">
          {/* Success Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              You&apos;re on the list! 🎉
            </h1>
            <div className="flex items-center justify-center gap-6">
              {position && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">
                    Position
                  </p>
                  <p className="text-3xl font-bold text-primary">#{position}</p>
                </div>
              )}
              <div className="text-center">
                <p className="text-sm text-muted-foreground uppercase tracking-wide">
                  Referrals
                </p>
                <p className="text-3xl font-bold text-primary">
                  {referralCount}
                </p>
              </div>
            </div>
          </div>

          {/* Referral Card */}
          <div className="bg-card rounded-2xl border border-border p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  Skip the Line
                </h2>
                <button
                  onClick={refreshStats}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  title="Refresh stats"
                >
                  <RefreshCw className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <p className="text-muted-foreground">
                Share your referral link and move up faster!
              </p>
            </div>

            {/* Referral Code Display */}
            <div className="bg-muted/50 rounded-xl p-6 space-y-3">
              <p className="text-sm text-muted-foreground text-center uppercase tracking-wider">
                Your Referral Code
              </p>
              <p className="text-4xl font-bold text-center text-primary font-mono tracking-wider">
                {referralCode}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleCopyReferralLink}
                variant="outline"
                className="flex-1 h-12"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
              <Button
                onClick={handleShare}
                className="flex-1 h-12 bg-primary hover:bg-primary/90"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Info */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-center text-foreground">
                <strong>Pro tip:</strong> For every friend who joins using your
                link, you&apos;ll both move up in the queue! 🚀
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Check your email for your welcome message and referral link.
            </p>
            <p className="text-sm text-muted-foreground">
              We&apos;ll notify you when it&apos;s your turn!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Join the Waitlist
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Be among the first to experience the future of{" "}
            <span className="text-primary font-semibold">
              AI-powered brand creation
            </span>
          </p>
        </div>

        {/* Referral Notice */}
        {referralParam && (
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-center">
            <p className="text-sm text-primary font-medium">
              🎉 You&apos;ve been referred! You&apos;ll start with a boost in
              the queue.
            </p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        className="h-12 bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">
                      Name{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Your name"
                        className="h-12 bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
              >
                <LoadingSwap isLoading={isSubmitting}>
                  Join the Waitlist
                </LoadingSwap>
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Get early access and exclusive updates
            </p>
            <button
              onClick={() => setShowLookup(true)}
              className="text-sm text-primary hover:underline font-medium"
            >
              Already joined? Check your status →
            </button>
          </div>
        </div>

        {/* Lookup Modal */}
        {showLookup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-2xl border border-border p-8 max-w-md w-full shadow-xl">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    Check Your Status
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your email or referral code
                  </p>
                </div>

                <Input
                  type="text"
                  placeholder="email@example.com or ABC12345"
                  value={lookupValue}
                  onChange={(e) => setLookupValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleLookup()}
                  className="h-12 bg-background"
                  disabled={isLookingUp}
                />

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowLookup(false)}
                    className="flex-1 h-12"
                    disabled={isLookingUp}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleLookup}
                    className="flex-1 h-12 bg-primary hover:bg-primary/90"
                    disabled={isLookingUp}
                  >
                    <LoadingSwap isLoading={isLookingUp}>
                      Check Status
                    </LoadingSwap>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Early Access</h3>
            <p className="text-sm text-muted-foreground">
              Be first to try new features
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">
              Exclusive Community
            </h3>
            <p className="text-sm text-muted-foreground">
              Connect with early adopters
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Share2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Referral Rewards</h3>
            <p className="text-sm text-muted-foreground">
              Skip ahead by inviting friends
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
