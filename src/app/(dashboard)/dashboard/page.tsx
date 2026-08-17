export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Overview</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Patients</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Upcoming Appointments</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Active Workspaces</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">1</p>
        </div>
      </div>
      
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
        <h3 className="text-lg font-medium text-gray-900">Welcome to Aesthetic OS</h3>
        <p className="mt-2 text-sm">You have successfully authenticated. Workspace features are coming next.</p>
      </div>
    </div>
  );
}
