import { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signout } from "../(auth)/actions";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if the user is a member of any clinic
  const { data: memberships, error } = await supabase
    .from("clinic_members")
    .select("clinic_id, clinics(name)")
    .eq("user_id", user.id);

  if (error || !memberships || memberships.length === 0) {
    redirect("/onboarding");
  }

  // For now, we'll just use the first clinic as the active one
  // Later we can implement a clinic switcher
  const activeClinic = (memberships[0].clinics as unknown) as { name: string };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 flex-col border-r border-gray-200 bg-white hidden md:flex">
        <div className="flex h-16 items-center px-6 border-b border-gray-100">
          <span className="text-lg font-bold tracking-tight text-gray-900 truncate">
            {activeClinic.name || "Aesthetic OS"}
          </span>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-6">
          <a href="/dashboard" className="flex items-center rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-900">
            Dashboard
          </a>
          <a href="#" className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900">
            Patients
          </a>
          <a href="#" className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900">
            Appointments
          </a>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-200" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
                {user.email}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between border-b border-gray-200 bg-white px-6 md:px-8">
          <div className="flex items-center md:hidden">
            <span className="text-lg font-bold">Aesthetic OS</span>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <form action={signout}>
              <Button variant="ghost" size="sm" type="submit">Sign Out</Button>
            </form>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

