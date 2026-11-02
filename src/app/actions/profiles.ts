"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { availabilityIdSchema, availabilitySchema, menteeProfileSchema, mentorProfileSchema } from "@/lib/validation/auth";
import type { SessionRequestResult } from "@/app/actions/auth";

export async function saveMentorProfile(input: unknown): Promise<SessionRequestResult> {
  const parsed = mentorProfileSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Periksa kembali detail profil." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Masuk untuk memperbarui profil mentor." };
  const { data: role } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (role?.role !== "mentor") return { error: "Hanya mentor yang dapat memperbarui profil ini." };

  const { error } = await supabase.rpc("save_mentor_profile", {
    p_full_name: parsed.data.fullName,
    p_professional_title: parsed.data.professionalTitle,
    p_bio: parsed.data.bio,
    p_experience_years: parsed.data.experienceYears,
    p_portfolio_url: parsed.data.portfolioUrl,
    p_hourly_rate: parsed.data.hourlyRate,
    p_currency: parsed.data.currency,
    p_is_published: parsed.data.isPublished,
    p_skill_ids: parsed.data.skillIds,
    p_category_ids: parsed.data.categoryIds,
  });
  if (error) return { error: error.message.includes("before publishing") ? "Lengkapi bio, pilih minimal satu keahlian dan satu kategori sebelum menerbitkan profil." : "Profil belum dapat disimpan. Periksa isian lalu coba lagi." };
  revalidatePath("/dashboard/mentor");
  revalidatePath("/dashboard/mentor/profile");
  revalidatePath("/mentors");
  return { notice: parsed.data.isPublished ? "Profil tersimpan dan sudah tampil di pencarian mentor." : "Profil mentor tersimpan sebagai draf." };
}

export async function saveMenteeProfile(input: unknown): Promise<SessionRequestResult> {
  const parsed = menteeProfileSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Periksa kembali detail profil." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Masuk untuk memperbarui profil." };
  const { data: role } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (role?.role !== "mentee") return { error: "Hanya mentee yang dapat memperbarui profil ini." };
  const socialLinks = Object.fromEntries(Object.entries(parsed.data.socialLinks).filter(([, url]) => url));
  const { error } = await supabase.rpc("save_mentee_profile", {
    p_full_name: parsed.data.fullName,
    p_bio: parsed.data.bio,
    p_learning_interests: parsed.data.learningInterests,
    p_social_links: socialLinks,
  });
  if (error) return { error: "Profil belum dapat disimpan. Periksa isian lalu coba lagi." };
  revalidatePath("/dashboard/mentee");
  revalidatePath("/dashboard/mentee/profile");
  return { notice: "Profil berhasil diperbarui." };
}

export async function addAvailability(input: unknown): Promise<SessionRequestResult> {
  const parsed = availabilitySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Periksa kembali waktu ketersediaan." };
  try { new Intl.DateTimeFormat("en", { timeZone: parsed.data.timezone }); }
  catch { return { error: "Pilih zona waktu yang valid." }; }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Masuk sebagai mentor untuk mengatur ketersediaan." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "mentor") return { error: "Hanya mentor yang dapat mengatur ketersediaan." };
  const { error } = await supabase.from("mentor_availability").insert({
    mentor_id: user.id,
    weekday: parsed.data.weekday,
    starts_at: `${parsed.data.startsAt}:00`,
    ends_at: `${parsed.data.endsAt}:00`,
    timezone: parsed.data.timezone,
  });
  if (error?.code === "23505") return { error: "Waktu mingguan tersebut sudah terdaftar." };
  if (error) return { error: "Waktu belum dapat disimpan. Silakan coba lagi." };
  revalidatePath("/dashboard/mentor/availability");
  revalidatePath("/mentors");
  return { notice: "Jadwal mingguan berhasil ditambahkan." };
}

export async function removeAvailability(input: unknown): Promise<SessionRequestResult> {
  const parsed = availabilityIdSchema.safeParse(input);
  if (!parsed.success) return { error: "Data ketersediaan tidak valid." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Masuk sebagai mentor untuk mengatur ketersediaan." };
  const { error } = await supabase.from("mentor_availability").delete()
    .eq("id", parsed.data.id).eq("mentor_id", user.id);
  if (error) return { error: "Jadwal belum dapat dihapus." };
  revalidatePath("/dashboard/mentor/availability");
  revalidatePath("/mentors");
  return { notice: "Jadwal berhasil dihapus." };
}
