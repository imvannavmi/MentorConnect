import { createClient } from "@/lib/supabase/server";

export type DashboardRole = "mentee" | "mentor";
export type DashboardSession = {
  id: string;
  mentor_id: string;
  mentee_id: string;
  topic: string;
  message: string | null;
  starts_at: string;
  ends_at: string;
  proposed_starts_at: string | null;
  proposed_ends_at: string | null;
  response_note: string | null;
  meeting_url: string | null;
  material_url: string | null;
  status: string;
  counterpartName: string;
  hasReview: boolean;
};

export async function getDashboardData(role: DashboardRole) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("id, role, full_name").eq("id", user.id).eq("role", role).maybeSingle();
  if (!profile) return null;

  const ownerColumn = role === "mentor" ? "mentor_id" : "mentee_id";
  const otherColumn = role === "mentor" ? "mentee_id" : "mentor_id";
  const { data: rows, error } = await supabase.from("mentoring_sessions")
    .select("id, mentor_id, mentee_id, topic, message, starts_at, ends_at, proposed_starts_at, proposed_ends_at, response_note, meeting_url, material_url, status")
    .eq(ownerColumn, user.id).order("starts_at", { ascending: true }).limit(200);
  if (error) return {
    user: profile,
    sessions: [], upcoming: [], pending: [], completed: [], notifications: [], reviews: [],
    stats: { completedSessions: 0, upcomingSessions: 0, pendingRequests: 0, activeMentees: 0, averageRating: 0 },
    loadError: true,
  };
  const sessions = rows ?? [];
  const ids = [...new Set(sessions.map((session) => session[otherColumn]))];
  const [otherProfiles, reviewRows, notificationRows] = await Promise.all([
    ids.length ? supabase.from("profiles").select("id, full_name").in("id", ids) : Promise.resolve({ data: [] }),
    role === "mentee"
      ? supabase.from("reviews").select("session_id").eq("mentee_id", user.id)
      : supabase.from("reviews").select("id, rating, body, created_at, mentee_id").eq("mentor_id", user.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("notifications").select("id, type, title, body, read_at, created_at, session_id").eq("recipient_id", user.id).order("created_at", { ascending: false }).limit(8),
  ]);
  const names = new Map((otherProfiles.data ?? []).map((item) => [item.id, item.full_name]));
  const reviewed = new Set(role === "mentee" ? (reviewRows.data as Array<{ session_id: string }> | null ?? []).map((item) => item.session_id) : []);
  const decoratedSessions: DashboardSession[] = sessions.map((session) => ({
    ...session,
    counterpartName: names.get(session[otherColumn]) ?? (role === "mentor" ? "Peserta bimbingan" : "Mentor"),
    hasReview: reviewed.has(session.id),
  }));
  const now = Date.now();
  const upcoming = decoratedSessions.filter((session) =>
    ["approved", "confirmed", "reschedule_requested"].includes(session.status)
      && new Date(session.starts_at).getTime() > now,
  );
  const pending = decoratedSessions.filter((session) => session.status === "pending");
  const completed = decoratedSessions.filter((session) => session.status === "completed");
  const reviews = role === "mentor" ? (reviewRows.data as Array<{ id: string; rating: number; body: string; created_at: string }> | null ?? []) : [];
  const averageRating = reviews.length ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length : 0;

  return {
    user: profile,
    sessions: decoratedSessions,
    upcoming,
    pending,
    completed,
    notifications: notificationRows.data ?? [],
    reviews,
    stats: {
      completedSessions: completed.length,
      upcomingSessions: upcoming.length,
      pendingRequests: pending.length,
      activeMentees: new Set(decoratedSessions.filter((session) => !["cancelled", "rejected"].includes(session.status)).map((session) => session.mentee_id)).size,
      averageRating,
    },
    loadError: false,
  };
}
