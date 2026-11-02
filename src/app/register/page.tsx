import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const params = await searchParams;
  const initialRole = params.role === "mentor" ? "mentor" : "mentee";
  return <main className="container grid min-h-screen max-w-6xl place-items-center py-12">
    <section className="w-full max-w-md rounded-[24px] border border-[var(--line)] bg-white p-8 sm:p-10">
      <Link href="/" className="mb-10 inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted)]"><ArrowLeft size={14} /> Kembali ke beranda</Link>
      <div className="mb-7 grid size-10 place-items-center rounded-xl bg-[var(--brand)] text-white"><Compass size={19} /></div>
      <p className="eyebrow mb-3">Mulai perjalananmu</p><h1 className="text-3xl font-bold tracking-[-.04em]">Buka ruang untuk berkembang.</h1>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Pilih peran yang sesuai dengan tujuanmu di MentorConnect.</p>
      <RegisterForm initialRole={initialRole} setupRequired={!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY} />
    </section>
  </main>;
}
