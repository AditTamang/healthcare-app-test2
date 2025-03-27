import { requireRole } from "@/lib/auth"
import { HealthPackageForm } from "@/components/health-package-form"

export default async function NewHealthPackagePage() {
  const user = await requireRole("ADMIN")

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Create New Health Package</h1>
      <HealthPackageForm />
    </div>
  )
}

