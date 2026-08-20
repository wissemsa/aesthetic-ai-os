import { ReactNode } from "react";
import { getActiveClinicContext } from "@/lib/clinic";
import { Button } from "@/components/ui/button";
import { signout } from "../(auth)/actions";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Target,
  Calendar,
  MessageSquare,
  Sparkles,
  LogOut,
} from "lucide-react";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const ctx = await getActiveClinicContext();

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-64 flex-col border-r border-zinc-200/80 bg-white hidden md:flex dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex h-16 items-center px-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold tracking-tight text-zinc-900 truncate dark:text-zinc-50">
              {ctx.clinic.name}
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 transition"
          >
            <LayoutDashboard className="h-4 w-4 text-zinc-400" />
            Dashboard
          </Link>
          <Link
            href="/patients"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 transition"
          >
            <Users className="h-4 w-4 text-zinc-400" />
            Patients
          </Link>
          <Link
            href="/leads"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 transition"
          >
            <Target className="h-4 w-4 text-zinc-400" />
            Leads & Pipeline
          </Link>
          <Link
            href="/appointments"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 transition"
          >
            <Calendar className="h-4 w-4 text-zinc-400" />
            Appointments
          </Link>
          <Link
            href="/conversations"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 transition"
          >
            <MessageSquare className="h-4 w-4 text-zinc-400" />
            Messages
          </Link>
        </nav>

        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {ctx.user.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-zinc-900 truncate max-w-[110px] dark:text-zinc-100">
                  {ctx.user.email}
                </span>
                <span className="text-[10px] text-zinc-400 capitalize">
                  {ctx.role}
                </span>
              </div>
            </div>
            <form action={signout}>
              <button
                type="submit"
                title="Sign Out"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between border-b border-zinc-200/80 bg-white px-6 md:px-8 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 md:hidden">
            <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {ctx.clinic.name}
            </span>
          </div>
          <div className="ml-auto flex items-center space-x-3">
            <form action={signout} className="md:hidden">
              <Button variant="ghost" size="sm" type="submit">
                Sign Out
              </Button>
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


