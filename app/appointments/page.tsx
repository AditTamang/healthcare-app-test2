import { redirect } from "next/navigation"
import { getUserSession } from "@/lib/auth"
import { PatientAppointments } from "@/components/patient-appointments"
import { DoctorAppointments } from "@/components/doctor-appointments"
import { AdminAppointments } from "@/components/admin-appointments"

export default async function AppointmentsPage() {
  const session = await getUserSession()

  if (!session) {
    redirect("/login")
  }

  const { user } = session

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">My Appointments</h1>

      {user.role === "PATIENT" && <PatientAppointments userId={user.id} />}
      {user.role === "DOCTOR" && <DoctorAppointments userId={user.id} />}
      {user.role === "ADMIN" && <AdminAppointments />}
    </div>
  )
}

