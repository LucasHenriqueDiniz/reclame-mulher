import { getSession } from "@/lib/auth/session";
import { ProfilesRepo } from "@/server/repos/profiles";
import { SettingsContent } from "./_components/settings-content";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) return null;

  const profile = await ProfilesRepo.findById(session.userId);

  return (
    <SettingsContent
      email={session.email}
      profileName={profile?.name ?? ""}
      profileCity={profile?.city ?? null}
      profileState={profile?.state ?? null}
      profilePhone={profile?.phone ?? null}
      profileAddress={profile?.address ?? null}
      avatarUrl={profile?.avatarUrl ?? null}
    />
  );
}
