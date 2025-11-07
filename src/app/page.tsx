import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language") || "";

  // Detectar el idioma preferido del navegador
  const preferredLocale = acceptLanguage.includes("es") ? "es" : "en";

  // Redirigir al locale apropiado
  redirect(`/${preferredLocale}`);
}
