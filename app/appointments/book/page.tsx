import { redirect } from "next/navigation"
import { getUserSession } from "@/lib/auth"
import { BookAppointmentForm } from "@/components/book-appointment-form"

export default async function BookAppointmentPage() {
  const session = await getUserSession()

  if (!session) {
    redirect("/login")
  }

  const { user } = session

  // Only patients can book appointments
  if (user.role !== "PATIENT") {
    redirect("/unauthorized")
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Book an Appointment</h1>
      <BookAppointmentForm patientId={user.id} />
    </div>
  )
}

