import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
const dayNumbers: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function getLocalSchedule(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (key: string) => parts.find((part) => part.type === key)?.value ?? "";
  return {
    weekday: dayNumbers[value("weekday")],
    date: `${value("year")}-${value("month")}-${value("day")}`,
    minutes: Number(value("hour")) * 60 + Number(value("minute")),
  };
}

function timeMinutes(value: string) {
  const [hours = "0", minutes = "0"] = value.split(":");
  return Number(hours) * 60 + Number(minutes);
}

export async function isWithinMentorAvailability(
  supabase: SupabaseServerClient,
  mentorId: string,
  startsAt: Date,
  endsAt: Date,
) {
  const { data: slots, error } = await supabase.from("mentor_availability")
    .select("weekday, starts_at, ends_at, timezone, effective_from, effective_until")
    .eq("mentor_id", mentorId).eq("is_active", true);
  if (error) return { ok: false, unavailable: true };

  const ok = (slots ?? []).some((slot) => {
    try {
      const localStart = getLocalSchedule(startsAt, slot.timezone);
      const localEnd = getLocalSchedule(endsAt, slot.timezone);
      return slot.weekday === localStart.weekday
        && localStart.date === localEnd.date
        && (!slot.effective_from || localStart.date >= slot.effective_from)
        && (!slot.effective_until || localStart.date <= slot.effective_until)
        && localStart.minutes >= timeMinutes(slot.starts_at)
        && localEnd.minutes <= timeMinutes(slot.ends_at);
    } catch {
      return false;
    }
  });
  return { ok, unavailable: false };
}

/** Checks booked/requested session windows, including another session's pending reschedule proposal. */
export async function hasMentorSessionConflict(
  supabase: SupabaseServerClient,
  mentorId: string,
  startsAt: Date,
  endsAt: Date,
  excludeSessionId?: string,
) {
  let query = supabase.from("mentoring_sessions")
    .select("id, starts_at, ends_at, proposed_starts_at, proposed_ends_at, status")
    .eq("mentor_id", mentorId)
    .in("status", ["pending", "approved", "reschedule_requested", "confirmed"]);
  if (excludeSessionId) query = query.neq("id", excludeSessionId);

  const { data: sessions, error } = await query;
  if (error) return { conflict: false, unavailable: true };

  const overlaps = (otherStart: string | null, otherEnd: string | null) => {
    if (!otherStart || !otherEnd) return false;
    return startsAt.getTime() < new Date(otherEnd).getTime()
      && endsAt.getTime() > new Date(otherStart).getTime();
  };

  const conflict = (sessions ?? []).some((session) =>
    overlaps(session.starts_at, session.ends_at)
      || (session.status === "reschedule_requested"
        && overlaps(session.proposed_starts_at, session.proposed_ends_at)),
  );
  return { conflict, unavailable: false };
}
