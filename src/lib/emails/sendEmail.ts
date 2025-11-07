import { render } from "@react-email/render";
import { ReactElement } from "react";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
  text,
  react,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  react?: ReactElement;
}) {
  // Validar que las variables de entorno existen
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured in environment variables");
  }

  if (!process.env.RESEND_FROM_EMAIL) {
    throw new Error("RESEND_FROM_EMAIL is not configured in environment variables");
  }

  // Si se proporciona un componente React, renderizarlo
  const htmlContent = react ? await render(react) : html;
  const textContent = react ? await render(react, { plainText: true }) : text;

  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject,
    html: htmlContent!,
    text: textContent,
  });
}
