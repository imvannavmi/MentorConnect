import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return <main className="container grid min-h-screen max-w-6xl place-items-center py-12">
    <section className="w-full max-w-md rounded-[24px] border border-[var(--line)] bg-white p-8 sm:p-10">
      <Link href="/login" className="mb-10 inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted)]"><ArrowLeft size={14} /> Kembali ke halaman masuk</Link>
      <div className="mb-7 grid size-10 place-items-center rounded-xl bg-[var(--brand)] text-white"><Compass size={19} /></div>
      <p className="eyebrow mb-3">Pemulihan kata sandi</p><h1 className="text-3xl font-bold tracking-[-.04em]">Pulihkan akses akunmu.</h1>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Masukkan email dan kami akan mengirimkan tautan pemulihan jika akun terdaftar.</p>
      <ForgotPasswordForm setupRequired={!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY} />
    </section>
  </main>;
}
