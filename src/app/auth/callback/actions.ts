"use server";

// OAuth callbacks are not supported — authentication is handled via email/password.
export async function syncProfileFromOAuth() {
  return { success: true };
}
