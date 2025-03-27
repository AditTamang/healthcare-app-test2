import { redirect } from "next/navigation"
import { getUserSession } from "@/lib/auth"
import { getAppointment } from "@/lib/appointments"
import { AppointmentDetails } from "@/components/appointment-details"

export default async function AppointmentDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getUserSession()

  if (!session) {
    redirect("/login")
  }

  const { user } = session
  const appointment = await getAppointment(params.id)

  if (!appointment) {
    redirect("/appointments")
  }

  // Check if user has access to this appointment
  const isPatient = user.id === appointment.patientId
  const isDoctor = user.id === appointment.doctorId
  const isAdmin = user.role === "ADMIN"

  if (!isPatient && !isDoctor && !isAdmin) {
    redirect("/unauthorized")
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Appointment Details</h1>
      <AppointmentDetails appointment={appointment} userRole={user.role} userId={user.id} />
    </div>
  )
}

