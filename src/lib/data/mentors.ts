import { createClient } from "@/lib/supabase/server";

export type MentorSummary = {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatarUrl: string | null;
  experienceYears: number | null;
  portfolioUrl: string | null;
  hourlyRate: number | null;
  currency: string;
  skills: string[];
  categories: string[];
  hasAvailability: boolean;
  rating: number | null;
  reviewCount: number;
};

export async function getMentors(): Promise<MentorSummary[]> {
  const supabase = await createClient();
  const { data: profiles, error } = await supabase
    .from("mentor_profiles")
    .select("user_id, professional_title, bio, experience_years, portfolio_url, hourly_rate, currency")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error || !profiles?.length) return [];

  const ids = profiles.map((profile) => profile.user_id);
  const [users, skillLinks, categoryLinks, reviewRows, skills, categories, availability] = await Promise.all([
    supabase.from("profiles").select("id, full_name, avatar_url").in("id", ids),
    supabase.from("mentor_skills").select("mentor_id, skill_id").in("mentor_id", ids),
    supabase.from("mentor_categories").select("mentor_id, category_id").in("mentor_id", ids),
    supabase.from("reviews").select("mentor_id, rating").in("mentor_id", ids),
    supabase.from("skills").select("id, name"),
    supabase.from("mentoring_categories").select("id, name"),
    supabase.from("mentor_availability").select("mentor_id").in("mentor_id", ids).eq("is_active", true),
  ]);

  const userById = new Map((users.data ?? []).map((user) => [user.id, user]));
  const skillNames = new Map((skills.data ?? []).map((skill) => [skill.id, skill.name]));
  const categoryNames = new Map((categories.data ?? []).map((category) => [category.id, category.name]));
  const availableMentors = new Set((availability.data ?? []).map((slot) => slot.mentor_id));
  return profiles.flatMap((profile) => {
    const user = userById.get(profile.user_id);
    if (!user) return [];
    const reviews = (reviewRows.data ?? []).filter((review) => review.mentor_id === profile.user_id);
    const skills = (skillLinks.data ?? [])
      .filter((link) => link.mentor_id === profile.user_id)
      .map((link) => skillNames.get(link.skill_id))
      .filter((name): name is string => Boolean(name));
    const categories = (categoryLinks.data ?? [])
      .filter((link) => link.mentor_id === profile.user_id)
      .map((link) => categoryNames.get(link.category_id))
      .filter((name): name is string => Boolean(name));
    return [{
      id: profile.user_id,
      name: user.full_name,
      title: profile.professional_title,
      bio: profile.bio,
      avatarUrl: user.avatar_url,
      experienceYears: profile.experience_years,
      portfolioUrl: profile.portfolio_url,
      hourlyRate: profile.hourly_rate,
      currency: profile.currency,
      skills,
      categories,
      hasAvailability: availableMentors.has(profile.user_id),
      rating: reviews.length ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length : null,
      reviewCount: reviews.length,
    }];
  });
}

export async function getMentor(id: string) {
  const mentors = await getMentors();
  return mentors.find((mentor) => mentor.id === id) ?? null;
}
