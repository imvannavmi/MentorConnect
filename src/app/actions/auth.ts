"use server";

import { createClient } from "@/lib/supabase/server";
import { emailSchema, loginSchema, registerSchema } from "@/lib/validation/auth";
import { passwordSchema } from "@/lib/validation/auth";
import { redirect } from "next/navigation";

export type AuthResult = { error?: string; notice?: string; redirectTo?: string };

export type SessionRequestResult = { error?: string; notice?: string };

function confirmationEmailError(error: { code?: string; status?: number }, fallback: string) {
  if (error.code === "email_address_not_authorized") {
    return "Supabase belum diatur untuk mengirim ke alamat email ini. Atur SMTP khusus di pengaturan autentikasi Supabase, lalu coba kirim ulang.";
  }
  if (error.code === "over_email_send_rate_limit" || error.status === 429) {
    return "Batas pengiriman email Supabase tercapai. Tunggu hingga kuota tersedia atau atur SMTP khusus, lalu coba lagi.";
  }
  return fallback;
}

export async function signIn(input: unknown): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { error: "Masukkan alamat email dan kata sandi yang valid." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { error: "Email atau kata sandi tidak dikenali." };

  const { data: profile, error: profileError } = await supabase
    .from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  if (profileError || !profile) {
    await supabase.auth.signOut();
    return { error: "Profil akun belum siap. Coba lagi sebentar." };
  }

  if (profile.role === "admin") return { redirectTo: "/dashboard/admin" };
  return { redirectTo: profile.role === "mentor" ? "/dashboard/mentor" : "/dashboard/mentee" };
}

export async function signUp(input: unknown): Promise<AuthResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { error: "Periksa nama, email, kata sandi, dan peran yang dipilih." };

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=${parsed.data.role === "mentor" ? "/dashboard/mentor" : "/dashboard/mentee"}`,
      data: { full_name: parsed.data.fullName, role: parsed.data.role },
    },
  });

  if (error) return { error: confirmationEmailError(error, "Akun belum dapat dibuat. Periksa detail pendaftaran dan coba lagi.") };
  if (data.session && data.user) {
    return { redirectTo: parsed.data.role === "mentor" ? "/dashboard/mentor" : "/dashboard/mentee" };
  }
  return { notice: "Periksa kotak masuk untuk membuka tautan konfirmasi dan menyelesaikan pendaftaran." };
}

export async function requestPasswordReset(input: unknown): Promise<AuthResult> {
  const parsed = emailSchema.safeParse(input);
  if (!parsed.success) return { error: "Masukkan alamat email yang valid." };

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });
  if (error) return { error: "Email pemulihan belum dapat dikirim. Silakan coba lagi." };
  return { notice: "Jika email tersebut terdaftar, tautan pemulihan kata sandi akan segera dikirim." };
}

export async function resendSignupConfirmation(input: unknown): Promise<AuthResult> {
  const value = input as { email?: unknown; role?: unknown };
  const parsed = emailSchema.safeParse(value?.email);
  if (!parsed.success) return { error: "Masukkan alamat email yang valid." };
  const role = value.role === "mentor" ? "mentor" : "mentee";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data,
    options: { emailRedirectTo: `${siteUrl}/auth/callback?next=/dashboard/${role}` },
  });
  if (error) return { error: confirmationEmailError(error, "Email konfirmasi belum dapat dikirim ulang. Periksa email dan coba lagi sebentar.") };
  return { notice: "Jika akun tersebut menunggu konfirmasi, tautan baru sudah dikirim. Periksa kotak masuk dan folder spam." };
}

export async function updatePassword(input: unknown): Promise<AuthResult> {
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) return { error: "Gunakan kata sandi dengan minimal 10 karakter." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tautan pemulihan tidak valid atau sudah kedaluwarsa. Minta tautan baru." };
  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) return { error: "Kata sandi belum dapat diperbarui. Silakan coba lagi." };
  return { notice: "Kata sandi berhasil diperbarui. Kamu sekarang bisa masuk." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
