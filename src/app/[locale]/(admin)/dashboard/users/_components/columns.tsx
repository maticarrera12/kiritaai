"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

// Definimos el tipo basándonos en tu Prisma Schema (simplificado para la tabla)
export type UserColumn = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  plan: "FREE" | "PRO" | "BUSINESS";
  status: "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING" | "PAUSED";
  credits: number;
  image: string | null;
};

function ActionsCell({ user }: { user: UserColumn }) {
  const router = useRouter();

  const handleImpersonate = async () => {
    try {
      const response = await authClient.admin.impersonateUser({ userId: user.id });

      if (response.data?.session) {
        toast.success(`Impersonated to ${user.name}`);
        router.refresh();
        router.push("/app");
      } else {
        toast.error("Failed to impersonate user");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error("Error impersonating user: " + errorMessage);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
          Copiar ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        {/* Acciones Placeholder */}
        <DropdownMenuItem onClick={() => toast.info("Editar próximamente")}>
          <Pencil className="mr-2 h-4 w-4" /> Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => toast.info("Borrar próximamente")}
          className="text-red-600 focus:text-red-600"
        >
          <Trash className="mr-2 h-4 w-4" /> Borrar
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Acción Real de Impersonate */}
        <DropdownMenuItem
          onClick={handleImpersonate}
          className="bg-indigo-50 text-indigo-700 focus:bg-indigo-100 focus:text-indigo-800 cursor-pointer"
        >
          <LogIn className="mr-2 h-4 w-4" />
          Impersonar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<UserColumn>[] = [
  {
    accessorKey: "name",
    header: "Usuario",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{user.name}</span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Rol",
    cell: ({ row }) => {
      const role = row.original.role;
      return <Badge variant={role === "admin" ? "default" : "secondary"}>{role}</Badge>;
    },
  },
  {
    accessorKey: "plan",
    header: "Plan",
    cell: ({ row }) => {
      const plan = row.original.plan;
      // Colores condicionales según el plan
      const color =
        plan === "BUSINESS"
          ? "bg-purple-100 text-purple-800 hover:bg-purple-100"
          : plan === "PRO"
            ? "bg-fuchsia-100 text-fuchsia-800 hover:bg-fuchsia-100"
            : "bg-gray-100 text-gray-800 hover:bg-gray-100";
      return <Badge className={color}>{plan}</Badge>;
    },
  },
  {
    accessorKey: "credits",
    header: "Créditos",
    cell: ({ row }) => <div className="font-mono">{row.original.credits}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell user={row.original} />,
  },
];
