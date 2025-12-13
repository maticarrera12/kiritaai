"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { updateProfile } from "@/actions/auth-actions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { ProfileUpdateInput, profileUpdateSchema } from "@/lib/schemas";

export interface PersonalInfoFormHandle {
  submit: () => Promise<void>;
  reset: () => void;
}

interface PersonalInfoFormProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
  onDirtyChange?: (dirty: boolean) => void;
}

export const PersonalInfoForm = forwardRef<PersonalInfoFormHandle, PersonalInfoFormProps>(
  ({ user, onDirtyChange }, ref) => {
    const t = useTranslations("settings.profile.personalInfo");
    const router = useRouter();

    const form = useForm<ProfileUpdateInput>({
      resolver: zodResolver(profileUpdateSchema),
      defaultValues: {
        name: user.name || "",
        email: user.email || "",
      },
    });

    const baseValuesRef = useRef<ProfileUpdateInput>({
      name: user.name || "",
      email: user.email || "",
    });

    useEffect(() => {
      onDirtyChange?.(form.formState.isDirty);
    }, [form.formState.isDirty, onDirtyChange]);

    useEffect(() => {
      const nextValues: ProfileUpdateInput = {
        name: user.name || "",
        email: user.email || "",
      };
      baseValuesRef.current = nextValues;

      if (!form.formState.isDirty) {
        form.reset(nextValues);
      }
    }, [form, user.email, user.name]);

    const handleUpdateProfile = async (data: ProfileUpdateInput) => {
      if (!form.formState.isDirty) return;

      const nameChanged = data.name !== user.name;
      const emailChanged = data.email !== user.email;

      // Actualizar el nombre usando la acción del servidor que valida unicidad
      if (nameChanged) {
        const updateResult = await updateProfile(data.name);

        if (updateResult.error) {
          const errorMessage = updateResult.error.message || t("messages.updateFailed");

          // Si el error es sobre username en uso, mostrarlo en el campo
          if (
            errorMessage.toLowerCase().includes("username") ||
            errorMessage.toLowerCase().includes("already taken")
          ) {
            form.setError("name", {
              type: "manual",
              message: t("messages.usernameTaken"),
            });
          } else {
            toast.error(errorMessage);
          }
          return;
        }
      }

      // Si cambió el email, usar changeEmail
      if (emailChanged) {
        const emailResult = await authClient.changeEmail({
          newEmail: data.email,
          callbackURL: "/verify-email-success",
        });

        if (emailResult.error) {
          toast.error(emailResult.error.message || t("messages.emailVerificationFailed"));
          return;
        }
        toast.success(t("messages.emailVerificationSent"));
      } else if (nameChanged) {
        toast.success(t("messages.updateSuccess"));
      }

      baseValuesRef.current = {
        name: data.name,
        email: data.email,
      };

      form.reset(data);
      router.refresh();
    };

    useImperativeHandle(ref, () => ({
      submit: () => form.handleSubmit(handleUpdateProfile)(),
      reset: () => form.reset({ ...baseValuesRef.current }),
    }));

    return (
      <section className="space-y-6">
        <header className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">{t("title")}</h2>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </header>

        <Form {...form}>
          <form className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fullName")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("namePlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("email")}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t("emailPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </section>
    );
  }
);

PersonalInfoForm.displayName = "PersonalInfoForm";
