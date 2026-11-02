"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validation/auth";
import { signIn } from "@/app/actions/auth";
import type { z } from "zod";

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({ setupRequired = false }: { setupRequired?: boolean }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  async function onSubmit(values: LoginValues) {
    setMessage("");
    const result = await signIn(values);
    if (result.error) { setMessage(result.error); return; }
    if (result.redirectTo) { router.replace(result.redirectTo); router.refresh(); }
  }

  return <form onSubmit={form.handleSubmit(onSubmit)} className="mt-7 space-y-4">
    {setupRequired && <p role="status" className="rounded-xl bg-[#fff6df] p-3 text-xs leading-5 text-[#7c5b16]">Hubungkan Supabase melalui <code>.env.local</code> untuk mengaktifkan akun.</p>}
    <label className="block text-xs font-semibold">Alamat email<input type="email" autoComplete="email" {...form.register("email")} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] px-4 text-sm outline-none focus:border-[var(--brand)]" />{form.formState.errors.email && <span className="mt-1 block text-xs text-red-700">{form.formState.errors.email.message}</span>}</label>
    <label className="block text-xs font-semibold">Kata sandi<input type="password" autoComplete="current-password" {...form.register("password")} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] px-4 text-sm outline-none focus:border-[var(--brand)]" />{form.formState.errors.password && <span className="mt-1 block text-xs text-red-700">{form.formState.errors.password.message}</span>}</label>
    <div className="text-right"><Link href="/forgot-password" className="text-xs font-semibold text-[var(--brand)]">Lupa kata sandi?</Link></div>
    {message && <p role="alert" className="text-xs text-red-700">{message}</p>}
    <button disabled={form.formState.isSubmitting || setupRequired} className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-50">{form.formState.isSubmitting ? "Memproses…" : "Masuk"}</button>
  </form>;
}
