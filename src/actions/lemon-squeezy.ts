"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export async function getCheckoutUrl(variantId: string, redirectUrl?: string, locale?: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) throw new Error("Unauthorized");
  const user = session.user;

  // Usamos process.env ya que confirmamos que las credenciales son correctas
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;

  if (!apiKey || !storeId) throw new Error("Missing configuration");

  // Construir la URL de redirección
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const finalRedirectUrl =
    redirectUrl ||
    (locale ? `${baseUrl}/${locale}/payment?success=true` : `${baseUrl}/payment?success=true`);

  // ⚠️ CAMBIO CLAVE: Quitamos 'embed' y 'media'. Solo enviamos redirect_url.
  const checkoutOptions = {
    redirect_url: finalRedirectUrl,
  };

  const payload = {
    data: {
      type: "checkouts",
      attributes: {
        checkout_data: {
          email: user.email,
          name: user.name,
          custom: {
            user_id: user.id.toString(),
          },
        },
        // ❌ COMENTA O BORRA ESTO TEMPORALMENTE
        // checkout_options: checkoutOptions,
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

  if (result.errors) {
    // Si falla, mostramos el error crudo para debugging
    console.error("LS Error Completo:", JSON.stringify(result, null, 2));
    throw new Error(result.errors[0].detail);
  }

  return result.data.attributes.url;
}
