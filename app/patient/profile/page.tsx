import { requireRole } from "@/lib/auth"
import { PatientProfileForm } from "@/components/patient-profile-form"

export default async function PatientProfilePage() {
  const user = await requireRole("PATIENT")

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Update Your Profile</h1>
      <PatientProfileForm user={user} />
    </div>
  )
}

