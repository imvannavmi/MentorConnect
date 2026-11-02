"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/validation/auth";
import { requestPasswordReset } from "@/app/actions/auth";
import type { z } from "zod";

type ResetRequestValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm({ setupRequired = false }: { setupRequired?: boolean }) {
  const [message, setMessage] = useState<{ error?: string; notice?: string } | null>(null);
  const form = useForm<ResetRequestValues>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: "" } });

  async function onSubmit(values: ResetRequestValues) {
    setMessage(await requestPasswordReset(values.email));
  }

  return <form onSubmit={form.handleSubmit(onSubmit)} className="mt-7 space-y-4">
    {setupRequired && <p role="status" className="rounded-xl bg-[#fff6df] p-3 text-xs leading-5 text-[#7c5b16]">Hubungkan Supabase melalui <code>.env.local</code> untuk mengaktifkan pemulihan kata sandi.</p>}
    <label className="block text-xs font-semibold">Alamat email<input type="email" autoComplete="email" {...form.register("email")} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] px-4 text-sm outline-none focus:border-[var(--brand)]" />{form.formState.errors.email && <span className="mt-1 block text-xs text-red-700">Masukkan alamat email yang valid.</span>}</label>
    {message?.error && <p role="alert" className="text-xs text-red-700">{message.error}</p>}
    {message?.notice && <p role="status" className="rounded-xl bg-[#edf4ff] p-3 text-xs leading-5 text-[var(--brand)]">{message.notice}</p>}
    <button disabled={form.formState.isSubmitting || setupRequired} className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-50">{form.formState.isSubmitting ? "Mengirim…" : "Kirim tautan pemulihan"}</button>
  </form>;
}
