import { auth, assignAdminRole, prisma } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest } from "next/server";

const handler = toNextJsHandler(auth);

async function handleOAuthCallback(
  request: NextRequest,
  method: "GET" | "POST"
) {
  const pathname = request.nextUrl.pathname;

  // Interceptar callbacks de OAuth
  const isOAuthCallback =
    pathname.includes("/callback/github") ||
    pathname.includes("/callback/google");

  if (isOAuthCallback) {
    // Ejecutar el handler de Better Auth primero
    const response = await (method === "GET" ? handler.GET : handler.POST)(
      request
    );

    // Después de que Better Auth procese el callback, verificar y asignar rol
    // Hacer esto de forma asíncrona sin bloquear la respuesta
    if (response.status === 200 || response.status === 302) {
      // Ejecutar de forma asíncrona para no bloquear la respuesta
      Promise.resolve().then(async () => {
        try {
          // Esperar un poco para que Better Auth complete el proceso de creación de usuario
          await new Promise((resolve) => setTimeout(resolve, 200));

          // Intentar obtener la sesión primero
          let session = null;
          try {
            session = await auth.api.getSession({
              headers: request.headers,
            });
          } catch {
            // Si falla, intentar buscar el usuario más reciente creado por OAuth
            // Esto es un fallback si no podemos obtener la sesión inmediatamente
          }

          if (session?.user) {
            // Asignar rol ADMIN si el email está en ADMIN_EMAILS
            await assignAdminRole(session.user.id, session.user.email);
          } else {
            // Fallback: buscar usuarios recientes creados por OAuth (últimos 5 segundos)
            // y verificar si alguno necesita asignación de rol
            const recentUsers = await prisma.user.findMany({
              where: {
                createdAt: {
                  gte: new Date(Date.now() - 5000), // Últimos 5 segundos
                },
                role: {
                  not: "ADMIN", // Solo verificar usuarios que no son admin
                },
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            });

            for (const user of recentUsers) {
              await assignAdminRole(user.id, user.email);
            }
          }
        } catch (error) {
          // Si no podemos obtener la sesión, no hacer nada
          // El usuario aún se autenticará correctamente
          console.error("Error assigning admin role after OAuth:", error);
        }
      });
    }

    return response;
  }

  // Para otras rutas, ejecutar el handler normalmente
  return method === "GET" ? handler.GET(request) : handler.POST(request);
}

export async function GET(request: NextRequest) {
  return handleOAuthCallback(request, "GET");
}

export async function POST(request: NextRequest) {
  return handleOAuthCallback(request, "POST");
}
