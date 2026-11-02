"use server";

import { createClient } from "@/lib/supabase/server";
import { sessionRequestSchema } from "@/lib/validation/auth";
import { notificationReadSchema, reviewSchema, sessionDecisionSchema, sessionResponseSchema } from "@/lib/validation/auth";
import type { SessionRequestResult } from "@/app/actions/auth";
import { revalidatePath } from "next/cache";
import { hasMentorSessionConflict } from "@/lib/sessions/availability";

export async function requestSession(input: unknown): Promise<SessionRequestResult> {
  const parsed = sessionRequestSchema.safeParse(input);
  if (!parsed.success) return { error: "Periksa kembali topik, tanggal, dan waktu sesi." };
  const startsAt = new Date(parsed.data.startsAt);
  const endsAt = new Date(parsed.data.endsAt);
  const durationMinutes = (endsAt.getTime() - startsAt.getTime()) / 60_000;
  if (startsAt.getTime() <= Date.now() || durationMinutes < 30 || durationMinutes > 120) {
    return { error: "Pilih waktu mendatang dengan durasi sesi 30–120 menit." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Masuk sebagai peserta bimbingan untuk mengajukan sesi." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "mentee") return { error: "Hanya peserta bimbingan yang dapat mengajukan sesi pendampingan." };

  const { data: mentor } = await supabase.from("mentor_profiles")
    .select("user_id").eq("user_id", parsed.data.mentorId).eq("is_published", true).maybeSingle();
  if (!mentor) return { error: "Mentor ini belum menerima permintaan sesi." };

  const conflict = await hasMentorSessionConflict(supabase, mentor.user_id, startsAt, endsAt);
  if (conflict.unavailable) return { error: "Jadwal mentor belum dapat diperiksa. Silakan coba lagi." };
  if (conflict.conflict) return { error: "Mentor sudah memiliki sesi pada waktu tersebut. Silakan pilih waktu lain." };

  const { error } = await supabase.from("mentoring_sessions").insert({
    mentor_id: mentor.user_id,
    mentee_id: user.id,
    topic: parsed.data.topic,
    message: parsed.data.message || null,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    timezone: "UTC",
    status: "pending",
  });
  if (error?.code === "23P01") return { error: "Waktu tersebut baru saja dipesan. Pilih waktu lain." };
  if (error) return { error: "Permintaan belum dapat dikirim. Silakan coba lagi." };

  revalidatePath("/dashboard/mentee");
  revalidatePath("/dashboard/mentor");
  revalidatePath(`/mentors/${mentor.user_id}`);
  return { notice: "Permintaan terkirim. Mentor akan memberi kabar setelah menanggapi." };
}

export async function respondToSession(input: unknown): Promise<SessionRequestResult> {
  const parsed = sessionResponseSchema.safeParse(input);
  if (!parsed.success) return { error: "Periksa detail tanggapan lalu coba lagi." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Masuk sebagai mentor untuk menanggapi permintaan." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "mentor") return { error: "Hanya mentor yang dituju yang dapat menanggapi permintaan ini." };

  const { data: session } = await supabase.from("mentoring_sessions")
    .select("id, starts_at, ends_at")
    .eq("id", parsed.data.sessionId).eq("mentor_id", user.id).eq("status", "pending").maybeSingle();
  if (!session) return { error: "Permintaan ini tidak lagi menunggu tanggapan." };

  let update: Record<string, string>;
  if (parsed.data.action === "approve") {
    update = { status: "approved" };
    if (parsed.data.responseNote) update.response_note = parsed.data.responseNote;
    if (parsed.data.meetingUrl) update.meeting_url = parsed.data.meetingUrl;
    if (parsed.data.materialUrl) update.material_url = parsed.data.materialUrl;
  } else if (parsed.data.action === "reject") {
    update = { status: "rejected", response_note: parsed.data.responseNote ?? "" };
  } else {
    const proposedStart = new Date(parsed.data.proposedStartsAt ?? "");
    const oldStart = new Date(session.starts_at);
    const oldEnd = new Date(session.ends_at);
    const proposedEnd = new Date(proposedStart.getTime() + oldEnd.getTime() - oldStart.getTime());
    if (proposedStart.getTime() <= Date.now()) return { error: "Pilih waktu usulan di masa mendatang." };
    const conflict = await hasMentorSessionConflict(supabase, user.id, proposedStart, proposedEnd, session.id);
    if (conflict.unavailable) return { error: "Jadwal sesi belum dapat diperiksa. Silakan coba lagi." };
    if (conflict.conflict) return { error: "Kamu sudah memiliki sesi lain pada waktu usulan tersebut. Pilih waktu lain." };
    update = {
      status: "reschedule_requested",
      proposed_starts_at: proposedStart.toISOString(),
      proposed_ends_at: proposedEnd.toISOString(),
      response_note: parsed.data.responseNote ?? "",
    };
  }

  const { error } = await supabase.from("mentoring_sessions").update(update)
    .eq("id", session.id).eq("mentor_id", user.id).eq("status", "pending");
  if (error?.code === "23P01") return { error: "Waktu usulan bentrok dengan sesi lain." };
  if (error) return { error: "Permintaan belum dapat diperbarui. Mungkin statusnya sudah berubah." };
  revalidatePath("/dashboard/mentor");
  revalidatePath("/dashboard/mentee");
  return { notice: parsed.data.action === "approve" ? "Sesi disetujui." : parsed.data.action === "reject" ? "Permintaan ditolak." : "Usulan waktu baru telah dikirim kepada peserta bimbingan." };
}

export async function decideSession(input: unknown): Promise<SessionRequestResult> {
  const parsed = sessionDecisionSchema.safeParse(input);
  if (!parsed.success) return { error: "Tindakan sesi tidak valid." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Masuk untuk mengelola sesi." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "mentee") return { error: "Hanya peserta bimbingan yang dapat mengonfirmasi sesi ini." };

  const allowed = parsed.data.action === "confirm" ? ["approved", "reschedule_requested"] : ["pending", "approved", "reschedule_requested", "confirmed"];
  const { error, data } = await supabase.from("mentoring_sessions")
    .update({ status: parsed.data.action === "confirm" ? "confirmed" : "cancelled" })
    .eq("id", parsed.data.sessionId).eq("mentee_id", user.id).in("status", allowed).select("id");
  if (error?.code === "23P01") return { error: "Waktu usulan bentrok dengan sesi lain." };
  if (error) return { error: "Sesi belum dapat diperbarui. Silakan coba lagi." };
  if (!data?.length) return { error: "Sesi ini tidak dapat diperbarui lagi." };
  revalidatePath("/dashboard/mentee");
  revalidatePath("/dashboard/mentor");
  return { notice: parsed.data.action === "confirm" ? "Sesi dikonfirmasi." : "Sesi dibatalkan." };
}

export async function completeSession(sessionId: unknown): Promise<SessionRequestResult> {
  if (typeof sessionId !== "string" || !/^[0-9a-f-]{36}$/i.test(sessionId)) return { error: "ID sesi tidak valid." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Masuk untuk memperbarui sesi." };
  const { data: session } = await supabase.from("mentoring_sessions")
    .select("id, ends_at, mentor_id, mentee_id, status")
    .eq("id", sessionId).maybeSingle();
  if (!session || ![session.mentor_id, session.mentee_id].includes(user.id)) return { error: "Kamu tidak dapat memperbarui sesi ini." };
  if (session.status !== "confirmed" || new Date(session.ends_at).getTime() > Date.now()) return { error: "Sesi yang telah dikonfirmasi hanya dapat ditandai selesai setelah waktunya berakhir." };

  const { error } = await supabase.from("mentoring_sessions").update({ status: "completed" })
    .eq("id", sessionId).eq("status", "confirmed");
  if (error) return { error: "Sesi belum dapat ditandai selesai. Silakan coba lagi." };
  revalidatePath("/dashboard/mentee");
  revalidatePath("/dashboard/mentor");
  return { notice: "Sesi ditandai selesai." };
}

export async function submitReview(input: unknown): Promise<SessionRequestResult> {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { error: "Berikan penilaian dan ulasan singkat." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Masuk sebagai peserta bimbingan yang mengikuti sesi ini." };
  const { data: session } = await supabase.from("mentoring_sessions")
    .select("id, mentor_id, mentee_id, status")
    .eq("id", parsed.data.sessionId).eq("mentee_id", user.id).eq("status", "completed").maybeSingle();
  if (!session) return { error: "Hanya peserta bimbingan yang dapat mengulas sesi yang telah selesai." };

  const { error } = await supabase.from("reviews").insert({
    session_id: session.id,
    mentor_id: session.mentor_id,
    mentee_id: user.id,
    rating: parsed.data.rating,
    body: parsed.data.body,
  });
  if (error?.code === "23505") return { error: "Kamu sudah mengirim ulasan untuk sesi ini." };
  if (error) return { error: "Ulasan belum dapat disimpan. Silakan coba lagi." };
  revalidatePath("/dashboard/mentee");
  revalidatePath(`/mentors/${session.mentor_id}`);
  return { notice: "Terima kasih sudah membagikan ulasan." };
}

export async function markNotificationRead(input: unknown): Promise<SessionRequestResult> {
  const parsed = notificationReadSchema.safeParse(input);
  if (!parsed.success) return { error: "Notifikasi tidak valid." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Masuk untuk mengelola notifikasi." };
  const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() })
    .eq("id", parsed.data.id).eq("recipient_id", user.id).is("read_at", null);
  if (error) return { error: "Notifikasi belum dapat ditandai sudah dibaca." };
  revalidatePath("/dashboard/mentee");
  revalidatePath("/dashboard/mentor");
  return { notice: "Notifikasi ditandai sudah dibaca." };
}
