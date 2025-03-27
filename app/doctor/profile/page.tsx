import { requireRole } from "@/lib/auth"
import { getDoctorProfile } from "@/lib/doctor-profile"
import { DoctorProfileForm } from "@/components/doctor-profile-form"

export default async function DoctorProfilePage() {
  const user = await requireRole("DOCTOR")

  // Get the doctor profile if it exists
  const doctorProfile = await getDoctorProfile(user.id)

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">
        {doctorProfile ? "Update Your Profile" : "Create Your Doctor Profile"}
      </h1>
      <DoctorProfileForm userId={user.id} doctorProfile={doctorProfile} />
    </div>
  )
}

