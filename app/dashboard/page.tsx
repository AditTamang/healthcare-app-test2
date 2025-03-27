import { redirect } from "next/navigation"
import { getUserSession } from "@/lib/auth"
import { PatientDashboard } from "@/components/patient-dashboard"
import { DoctorDashboard } from "@/components/doctor-dashboard"
import { AdminDashboard } from "@/components/admin-dashboard"

export default async function DashboardPage() {
  const session = await getUserSession()

  if (!session) {
    redirect("/login")
  }

  const { user } = session

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {user.role === "PATIENT" && <PatientDashboard userId={user.id} />}
      {user.role === "DOCTOR" && <DoctorDashboard userId={user.id} />}
      {user.role === "ADMIN" && <AdminDashboard />}
    </div>
  )
}

