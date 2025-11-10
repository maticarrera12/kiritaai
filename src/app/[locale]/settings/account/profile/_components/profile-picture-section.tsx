"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ProfilePictureSectionProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  plan: string;
}

export function ProfilePictureSection({ user, plan }: ProfilePictureSectionProps) {
  const t = useTranslations("settings.profile.profilePicture");
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // --- MUTATION: Upload Avatar ---
  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      /* eslint-env browser */
      // eslint-disable-next-line no-undef
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to upload image");
      return json.url as string;
    },
    onSuccess: async (url) => {
      toast.success("Profile picture updated!");
      setPreview(url);
      // 🔁 Refresca la sesión global (para que aparezca la nueva imagen)
      await queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Upload failed");
      setPreview(null);
    },
  });

  // --- HANDLE FILE SELECTION ---
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamaño y tipo
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2 MB");
      return;
    }

    // Previsualización instantánea
    const previewURL = URL.createObjectURL(file);
    setPreview(previewURL);

    uploadAvatar.mutate(file);
  };

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{t("title")}</h2>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </header>

      <div className="flex items-center gap-6">
        <div className="relative cursor-pointer group">
          <input
            type="file"
            ref={inputRef}
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
          />

          <Avatar className="h-24 w-24">
            <AvatarImage src={preview || user.image || ""} alt={user.name || "User"} />
            <AvatarFallback className="text-2xl">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>

          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
            {uploadAvatar.isPending ? (
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            ) : (
              <Pencil className="h-6 w-6 text-white" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm capitalize">
              {plan} {t("plan")}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {t("member")}
            </Badge>
          </div>
          {uploadAvatar.isPending && (
            <p className="text-sm text-muted-foreground">Uploading image...</p>
          )}
        </div>
      </div>
    </section>
  );
}
