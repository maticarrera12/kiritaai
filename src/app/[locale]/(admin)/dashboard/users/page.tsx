"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { columns, UserColumn } from "./_components/columns";
import { DataTable } from "./_components/data-table";

export default function UsersPage() {
  const fetchUsers = async (): Promise<UserColumn[]> => {
    const res = await fetch("/api/admin/users");
    if (!res.ok) {
      throw new Error("Error fetching users");
    }
    return res.json();
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchUsers,
  });

  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-10 text-red-500">Error cargando usuarios: {(error as Error).message}</div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <div className="text-sm text-muted-foreground">Total: {data?.length || 0} usuarios</div>
      </div>

      <DataTable columns={columns} data={data || []} />
    </div>
  );
}
