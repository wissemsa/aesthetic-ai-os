import { redirect } from "next/navigation";

// Root URL delegates to the protected dashboard.
// The (dashboard) layout enforces authentication and redirects
// to /login or /onboarding as needed before rendering.
export default function RootPage() {
  redirect("/dashboard");
}

