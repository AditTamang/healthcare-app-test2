import { redirect } from "next/navigation"
import { requireRole } from "@/lib/auth"
import { getHealthPackage } from "@/lib/health-packages"
import { HealthPackageForm } from "@/components/health-package-form"

export default async function EditHealthPackagePage({
  params,
}: {
  params: { id: string }
}) {
  const user = await requireRole("ADMIN")

  // Get the health package
  const healthPackage = await getHealthPackage(params.id)

  if (!healthPackage) {
    redirect("/admin/health-packages")
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Edit Health Package</h1>
      <HealthPackageForm healthPackage={healthPackage} />
    </div>
  )
}

