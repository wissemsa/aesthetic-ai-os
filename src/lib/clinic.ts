import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface ClinicContext {
  user: {
    id: string;
    email?: string;
  };
  clinicId: string;
  clinic: {
    id: string;
    name: string;
  };
  role: "owner" | "admin" | "staff" | "viewer";
}

/**
 * Derives the active clinic context strictly on the server from the authenticated user's session.
 * Never trust or accept clinic_id directly from the client.
 */
export async function getActiveClinicContext(): Promise<ClinicContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user's clinic memberships
  const { data: memberships, error } = await supabase
    .from("clinic_members")
    .select("clinic_id, role, clinics(id, name)")
    .eq("user_id", user.id);

  if (error || !memberships || memberships.length === 0) {
    redirect("/onboarding");
  }

  // For now, default to the primary clinic (multi-clinic switcher can be plugged in here)
  const primaryMembership = memberships[0];
  const clinic = (primaryMembership.clinics as unknown) as { id: string; name: string };

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    clinicId: primaryMembership.clinic_id,
    clinic: {
      id: clinic?.id || primaryMembership.clinic_id,
      name: clinic?.name || "Aesthetic OS",
    },
    role: primaryMembership.role as ClinicContext["role"],
  };
}
