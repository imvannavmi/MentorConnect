"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerFormSchema } from "@/lib/validation/auth";
import { signUp } from "@/app/actions/auth";
import type { z } from "zod";

type RegisterValues = z.infer<typeof registerFormSchema>;

export function RegisterForm({ initialRole = "mentee", setupRequired = false }: { initialRole?: "mentee" | "mentor"; setupRequired?: boolean }) {
  const router = useRouter();
  const [message, setMessage] = useState<{ type: "error" | "notice"; value: string } | null>(null);
  const form = useForm<RegisterValues>({ resolver: zodResolver(registerFormSchema), defaultValues: { fullName: "", email: "", password: "", confirmPassword: "", role: initialRole } });

  async function onSubmit(values: RegisterValues) {
    setMessage(null);
    const result = await signUp({ fullName: values.fullName, email: values.email, password: values.password, role: values.role });
    if (result.error) { setMessage({ type: "error", value: result.error }); return; }
    if (result.notice) { setMessage({ type: "notice", value: result.notice }); return; }
    if (result.redirectTo) { router.replace(result.redirectTo); router.refresh(); }
  }

  return <form onSubmit={form.handleSubmit(onSubmit)} className="mt-7 space-y-4">
    {setupRequired && <p role="status" className="rounded-xl bg-[#fff6df] p-3 text-xs leading-5 text-[#7c5b16]">Hubungkan Supabase melalui <code>.env.local</code> untuk mengaktifkan akun.</p>}
    <label className="block text-xs font-semibold">Nama lengkap<input autoComplete="name" {...form.register("fullName")} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] px-4 text-sm outline-none focus:border-[var(--brand)]" />{form.formState.errors.fullName && <span className="mt-1 block text-xs text-red-700">{form.formState.errors.fullName.message}</span>}</label>
    <label className="block text-xs font-semibold">Alamat email<input type="email" autoComplete="email" {...form.register("email")} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] px-4 text-sm outline-none focus:border-[var(--brand)]" />{form.formState.errors.email && <span className="mt-1 block text-xs text-red-700">{form.formState.errors.email.message}</span>}</label>
    <label className="block text-xs font-semibold">Saya mendaftar sebagai<select {...form.register("role")} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] bg-white px-4 text-sm"><option value="mentee">Peserta bimbingan yang ingin berkembang</option><option value="mentor">Mentor yang ingin berbagi</option></select></label>
    <label className="block text-xs font-semibold">Kata sandi<input type="password" autoComplete="new-password" {...form.register("password")} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] px-4 text-sm outline-none focus:border-[var(--brand)]" />{form.formState.errors.password && <span className="mt-1 block text-xs text-red-700">{form.formState.errors.password.message}</span>}</label>
    <label className="block text-xs font-semibold">Konfirmasi kata sandi<input type="password" autoComplete="new-password" {...form.register("confirmPassword")} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] px-4 text-sm outline-none focus:border-[var(--brand)]" />{form.formState.errors.confirmPassword && <span className="mt-1 block text-xs text-red-700">{form.formState.errors.confirmPassword.message}</span>}</label>
    {message && <p role={message.type === "error" ? "alert" : "status"} className={`text-xs ${message.type === "error" ? "text-red-700" : "text-[var(--brand)]"}`}>{message.value}</p>}
    <button disabled={form.formState.isSubmitting || setupRequired} className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-50">{form.formState.isSubmitting ? "Membuat akun…" : "Buat akun"}</button>
    <p className="text-center text-xs text-[var(--muted)]">Dengan bergabung, kamu setuju menggunakan MentorConnect dengan saling menghormati.</p>
    <div className="text-center text-xs text-[var(--muted)]">Sudah punya akun? <Link href="/login" className="font-semibold text-[var(--brand)]">Masuk</Link></div>
  </form>;
}
