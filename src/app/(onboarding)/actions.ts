"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createClinic(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = formData.get("name") as string;
  if (!name || name.trim() === "") {
    redirect("/onboarding?error=Clinic name is required");
  }

  const clinicId = crypto.randomUUID();

  // Insert the new clinic
  const { error: clinicError } = await supabase
    .from("clinics")
    .insert([{ id: clinicId, name }]);

  if (clinicError) {
    redirect("/onboarding?error=Failed to create clinic");
  }

  // Insert the owner membership
  const { error: memberError } = await supabase
    .from("clinic_members")
    .insert([
      {
        clinic_id: clinicId,
        user_id: user.id,
        role: "owner",
      },
    ]);

  if (memberError) {
    redirect("/onboarding?error=Failed to set clinic owner");
  }

  // Successful creation, redirect to dashboard
  redirect("/dashboard");
}
