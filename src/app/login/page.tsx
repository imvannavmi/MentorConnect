import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ setup?: string; registered?: string; error?: string; passwordUpdated?: string }> }) {
  const params = await searchParams;
  return <main className="container grid min-h-screen max-w-6xl place-items-center py-12">
    <section className="w-full max-w-md rounded-[24px] border border-[var(--line)] bg-white p-8 sm:p-10">
      <Link href="/" className="mb-10 inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted)]"><ArrowLeft size={14} /> Kembali ke beranda</Link>
      <div className="mb-7 grid size-10 place-items-center rounded-xl bg-[var(--brand)] text-white"><Compass size={19} /></div>
      <p className="eyebrow mb-3">Selamat datang kembali</p><h1 className="text-3xl font-bold tracking-[-.04em]">Lanjutkan perjalanan belajarmu.</h1>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Masuk untuk melihat sesi dan perkembanganmu.</p>
      {params.registered && <p role="status" className="mt-4 rounded-xl bg-[#edf4ff] p-3 text-xs leading-5 text-[var(--brand)]">Akun berhasil dibuat. Periksa email untuk konfirmasi, lalu masuk.</p>}
      {params.passwordUpdated && <p role="status" className="mt-4 rounded-xl bg-[#edf4ff] p-3 text-xs leading-5 text-[var(--brand)]">Kata sandi diperbarui. Silakan masuk dengan kata sandi baru.</p>}
      {params.error === "confirmation" && <p role="alert" className="mt-4 rounded-xl bg-[#fff0ec] p-3 text-xs leading-5 text-[#9a3929]">Tautan konfirmasi tidak dapat diverifikasi. Minta tautan baru, lalu coba lagi.</p>}
      <LoginForm setupRequired={params.setup === "required" || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY} />
      <p className="mt-6 text-center text-xs text-[var(--muted)]">Belum punya akun? <Link href="/register" className="font-semibold text-[var(--brand)]">Daftar sekarang</Link></p>
      <p className="mt-3 text-center text-xs text-[var(--muted)]">Belum menerima email konfirmasi? <Link href="/resend-confirmation" className="font-semibold text-[var(--brand)]">Kirim ulang</Link></p>
    </section>
  </main>;
}
