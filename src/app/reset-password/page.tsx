import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export default function ResetPasswordPage() {
  return <main className="container grid min-h-screen max-w-6xl place-items-center py-12">
    <section className="w-full max-w-md rounded-[24px] border border-[var(--line)] bg-white p-8 sm:p-10">
      <Link href="/login" className="mb-10 inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted)]"><ArrowLeft size={14} /> Kembali ke halaman masuk</Link>
      <div className="mb-7 grid size-10 place-items-center rounded-xl bg-[var(--brand)] text-white"><Compass size={19} /></div>
      <p className="eyebrow mb-3">Atur kata sandi baru</p><h1 className="text-3xl font-bold tracking-[-.04em]">Mulai kembali dengan aman.</h1>
      <UpdatePasswordForm />
    </section>
  </main>;
}
