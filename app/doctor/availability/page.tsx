import { redirect } from "next/navigation"
import { requireRole } from "@/lib/auth"
import { getDoctorProfile } from "@/lib/doctor-profile"
import { getAvailabilities } from "@/lib/availability"
import { AvailabilityForm } from "@/components/availability-form"
import { AvailabilityList } from "@/components/availability-list"

export default async function DoctorAvailabilityPage() {
  const user = await requireRole("DOCTOR")

  // Get the doctor profile
  const doctorProfile = await getDoctorProfile(user.id)

  if (!doctorProfile) {
    redirect("/doctor/profile")
  }

  // Get the doctor's availabilities
  const availabilities = await getAvailabilities(doctorProfile.id)

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Manage Your Availability</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">Add New Availability</h2>
          <AvailabilityForm doctorProfileId={doctorProfile.id} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Your Availabilities</h2>
          <AvailabilityList availabilities={availabilities} doctorProfileId={doctorProfile.id} />
        </div>
      </div>
    </div>
  )
}

