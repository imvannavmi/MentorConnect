import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MenteeProfileForm } from "@/components/profiles/mentee-profile-form";

export default async function MenteeProfilePage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return <main className="container min-h-screen py-16"><p className="text-sm text-[var(--muted)]">Hubungkan Supabase melalui <code>.env.local</code> untuk mengelola profil.</p></main>;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <main className="container py-16"><Link href="/login">Masuk untuk melanjutkan</Link></main>;
  const [profile, mentee] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase.from("mentee_profiles").select("bio, learning_interests, social_links").eq("user_id", user.id).maybeSingle(),
  ]);
  if (!profile.data || !mentee.data) return <main className="container py-16"><p className="text-sm text-[var(--muted)]">Profil sedang disiapkan. Muat ulang beberapa saat lagi.</p></main>;
  const links = mentee.data.social_links as Record<string, string>;
  return <main className="container min-h-screen py-8 sm:py-12">
    <Link href="/dashboard/mentee" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted)]"><ArrowLeft size={14} /> Dasbor peserta</Link>
    <div className="mt-8 max-w-3xl"><p className="eyebrow">Profil peserta</p><h1 className="mt-2 text-3xl font-bold tracking-[-.04em] sm:text-4xl">Ceritakan dukungan yang kamu cari.</h1><p className="mt-3 text-sm leading-6 text-[var(--muted)]">Bagikan minat dan konteks singkat agar mentor memahami tujuanmu.</p></div>
    <section className="mt-7 max-w-3xl rounded-xl border border-[var(--line)] bg-white p-5 sm:p-8"><MenteeProfileForm initial={{ fullName: profile.data.full_name, bio: mentee.data.bio, learningInterests: mentee.data.learning_interests ?? [], socialLinks: { linkedin: links.linkedin ?? "", github: links.github ?? "", website: links.website ?? "" } }} /></section>
  </main>;
}
