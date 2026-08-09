import { login, signup } from "../actions";
import { Button } from "@/components/ui/button";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50/50">
      <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/40">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Aesthetic OS</h1>
          <p className="mt-2 text-sm text-gray-500">Sign in to your workspace</p>
        </div>

        {searchParams.error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {searchParams.error}
          </div>
        )}

        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="email">
              Email
            </label>
            <input
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="password">
              Password
            </label>
            <input
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>
          
          <div className="mt-4 flex flex-col gap-3">
            <Button formAction={login} className="w-full">
              Sign In
            </Button>
            <Button formAction={signup} variant="outline" className="w-full">
              Create Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
