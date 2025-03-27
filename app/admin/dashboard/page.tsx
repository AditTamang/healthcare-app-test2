import { requireRole } from "@/lib/auth"
import { AdminDashboard } from "@/components/admin-dashboard"

export default async function AdminDashboardPage() {
  const user = await requireRole("ADMIN")

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <AdminDashboard />
    </div>
  )
}

