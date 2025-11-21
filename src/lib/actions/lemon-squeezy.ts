"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export async function getCheckoutUrl(variantId: string, redirectUrl?: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const user = session.user;

  // Configuración de Lemon Squeezy API
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;

  if (!apiKey || !storeId) {
    throw new Error("Missing Lemon Squeezy configuration");
  }

  const payload = {
    data: {
      type: "checkouts",
      attributes: {
        checkout_data: {
          email: user.email,
          name: user.name,
          custom: {
            user_id: user.id, // CRÍTICO: Esto conecta el pago con tu DB
          },
        },
        checkout_options: {
          dark: true, // Opcional: modo oscuro
          redirect_url: redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment?success=true`,
        },
      },
      relationships: {
        store: {
          data: {
            type: "stores",
            id: storeId.toString(),
          },
        },
        variant: {
          data: {
            type: "variants",
            id: variantId.toString(),
          },
        },
      },
    },
  };

  const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!result.data) {
    console.error("Lemon Squeezy Error:", result);
    throw new Error("Failed to create checkout");
  }

  return result.data.attributes.url;
}
