import { createClinic } from "../actions";
import { Button } from "@/components/ui/button";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50/50">
      <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/40">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Welcome!</h1>
          <p className="mt-2 text-sm text-gray-500">Let&apos;s set up your first clinic workspace.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="name">
              Clinic Name
            </label>
            <input
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Lumina Aesthetics"
              required
            />
          </div>
          
          <div className="mt-4">
            <Button formAction={createClinic} className="w-full">
              Create Workspace
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

