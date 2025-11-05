"use server";
import { auth, prisma, assignAdminRole } from "../auth";
import { headers } from "next/headers";
import { signInSchema, signUpSchema } from "../schemas";

export const signUp = async (email: string, password: string, name: string) => {
  const validated = signUpSchema.safeParse({ email, password, name });
  if (!validated.success) {
    return {
      error: { message: validated.error.issues[0].message },
      user: null,
    };
  }

  const result = await auth.api.signUpEmail({
    body: {
      name: validated.data.name,
      email: validated.data.email,
      password: validated.data.password,
      callbackURL: "/",
    },
  });

  if (!result.user || ("error" in result && result.error)) {
    return {
      error: { message: "Sign up failed" },
      user: null,
    };
  }
  // Asignar rol ADMIN si el email está en ADMIN_EMAILS
  await assignAdminRole(result.user.id, result.user.email);

  return { error: null, user: result.user };
};

export const signIn = async (email: string, password: string) => {
  const validated = signInSchema.safeParse({ email, password });

  if (!validated.success) {
    return {
      error: {
        message: validated.error.issues[0].message,
      },
      user: null,
    };
  }

  const result = await auth.api.signInEmail({
    body: {
      email: validated.data.email,
      password: validated.data.password,
      callbackURL: "/",
    },
  });

  // Asignar rol ADMIN si el email está en ADMIN_EMAILS (útil si se agrega después)
  if (result.user) {
    await assignAdminRole(result.user.id, result.user.email);
  }

  return result;
};

export const signOut = async () => {
  const result = await auth.api.signOut({
    headers: await headers(),
  });

  return result;
};
