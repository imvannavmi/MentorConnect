"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordSchema } from "@/lib/validation/auth";
import { updatePassword } from "@/app/actions/auth";
import { z } from "zod";

const updatePasswordFormSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi."),
}).refine((value) => value.password === value.confirmPassword, {
  path: ["confirmPassword"],
  message: "Kata sandi tidak sama.",
});

type UpdatePasswordValues = z.infer<typeof updatePasswordFormSchema>;

export function UpdatePasswordForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const form = useForm<UpdatePasswordValues>({
    resolver: zodResolver(updatePasswordFormSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: UpdatePasswordValues) {
    const result = await updatePassword(values.password);
    if (result.error) { setMessage(result.error); return; }
    router.replace("/login?passwordUpdated=1");
    router.refresh();
  }

  return <form onSubmit={form.handleSubmit(onSubmit)} className="mt-7 space-y-4">
    <label className="block text-xs font-semibold">Kata sandi baru<input type="password" autoComplete="new-password" {...form.register("password")} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] px-4 text-sm outline-none focus:border-[var(--brand)]" />{form.formState.errors.password && <span className="mt-1 block text-xs text-red-700">Gunakan minimal 10 karakter.</span>}</label>
    <label className="block text-xs font-semibold">Konfirmasi kata sandi<input type="password" autoComplete="new-password" {...form.register("confirmPassword")} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] px-4 text-sm outline-none focus:border-[var(--brand)]" />{form.formState.errors.confirmPassword && <span className="mt-1 block text-xs text-red-700">{form.formState.errors.confirmPassword.message}</span>}</label>
    {message && <p role="status" className="text-xs text-[var(--brand)]">{message}</p>}
    <button disabled={form.formState.isSubmitting} className="button-primary w-full disabled:opacity-50">{form.formState.isSubmitting ? "Memperbarui…" : "Perbarui kata sandi"}</button>
  </form>;
}
