import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MentorProfileForm } from "@/components/profiles/mentor-profile-form";

export default async function MentorProfilePage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return <main className="container min-h-screen py-16"><p className="text-sm text-[var(--muted)]">Hubungkan Supabase melalui <code>.env.local</code> untuk mengelola profil mentor.</p></main>;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <main className="container py-16"><Link href="/login">Masuk untuk melanjutkan</Link></main>;
  const [profileResult, mentorResult, skillsResult, categoriesResult, mentorSkillsResult, mentorCategoriesResult] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase.from("mentor_profiles").select("professional_title, bio, experience_years, portfolio_url, hourly_rate, currency, is_published").eq("user_id", user.id).maybeSingle(),
    supabase.from("skills").select("id, name").order("name"),
    supabase.from("mentoring_categories").select("id, name").order("name"),
    supabase.from("mentor_skills").select("skill_id").eq("mentor_id", user.id),
    supabase.from("mentor_categories").select("category_id").eq("mentor_id", user.id),
  ]);
  if (!profileResult.data || !mentorResult.data) return <main className="container py-16"><p className="text-sm text-[var(--muted)]">Profil mentor sedang disiapkan. Muat ulang beberapa saat lagi.</p></main>;

  const initial = {
    fullName: profileResult.data.full_name,
    professionalTitle: mentorResult.data.professional_title,
    bio: mentorResult.data.bio,
    experienceYears: mentorResult.data.experience_years,
    portfolioUrl: mentorResult.data.portfolio_url ?? "",
    hourlyRate: mentorResult.data.hourly_rate,
    currency: mentorResult.data.currency.trim(),
    isPublished: mentorResult.data.is_published,
    skillIds: (mentorSkillsResult.data ?? []).map((item) => item.skill_id),
    categoryIds: (mentorCategoriesResult.data ?? []).map((item) => item.category_id),
  };
  return <main className="container min-h-screen py-8 sm:py-12">
    <Link href="/dashboard/mentor" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted)]"><ArrowLeft size={14} /> Dasbor mentor</Link>
    <div className="mt-8 max-w-4xl"><p className="eyebrow">Profil mentor</p><h1 className="mt-2 text-3xl font-bold tracking-[-.04em] sm:text-4xl">Ceritakan pengalaman yang bisa kamu bagikan.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">Profil yang jelas membantu peserta bimbingan memahami keahlian dan pendekatanmu.</p></div>
    <section className="mt-7 max-w-4xl rounded-xl border border-[var(--line)] bg-white p-5 sm:p-8"><MentorProfileForm initial={initial} skills={skillsResult.data ?? []} categories={categoriesResult.data ?? []} /></section>
  </main>;
}
