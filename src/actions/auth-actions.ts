"use server";
import { headers } from "next/headers";

import { auth, assignAdminRole } from "../lib/auth";
import { prisma } from "../lib/prisma";
import { profileUpdateSchema, signInSchema, signUpSchema } from "../lib/schemas";

export const signUp = async (email: string, password: string, name: string) => {
  const validated = signUpSchema.safeParse({ email, password, name });
  if (!validated.success) {
    return {
      error: { message: validated.error.issues[0].message },
      user: null,
    };
  }

  // Verificar si el username ya está en uso
  const existingUser = await prisma.user.findUnique({
    where: { name: validated.data.name },
  });

  if (existingUser) {
    return {
      error: { message: "This username is already taken. Please choose another one." },
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
  try {
    await assignAdminRole(result.user.id, result.user.email);
  } catch (error) {
    const message =
      error instanceof Error && error.message ? error.message : "Failed to assign admin role.";

    return {
      error: { message },
      user: result.user,
    };
  }

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
    try {
      await assignAdminRole(result.user.id, result.user.email);
    } catch (error) {
      const message =
        error instanceof Error && error.message ? error.message : "Failed to assign admin role.";

      return {
        ...result,
        error: { message },
      };
    }
  }

  return result;
};

export const signOut = async () => {
  const result = await auth.api.signOut({
    headers: await headers(),
  });

  return result;
};

export const updateProfile = async (name: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      error: { message: "Unauthorized" },
      user: null,
    };
  }

  // Validar el nombre (el email se valida pero no se actualiza aquí)
  const validated = profileUpdateSchema.safeParse({ name, email: session.user.email });
  if (!validated.success) {
    return {
      error: { message: validated.error.issues[0].message },
      user: null,
    };
  }

  // Verificar si el username ya está en uso por otro usuario
  if (validated.data.name !== session.user.name) {
    const existingUser = await prisma.user.findUnique({
      where: { name: validated.data.name },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return {
        error: { message: "This username is already taken. Please choose another one." },
        user: null,
      };
    }
  }

  // Actualizar el usuario usando better-auth
  const result = await auth.api.updateUser({
    body: {
      name: validated.data.name,
    },
    headers: await headers(),
  });

  if (!result.user || ("error" in result && result.error)) {
    return {
      error: { message: result.error?.message || "Failed to update profile" },
      user: null,
    };
  }

  return { error: null, user: result.user };
};
