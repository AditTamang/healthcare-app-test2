import Link from "next/link"
import { requireRole } from "@/lib/auth"
import { getAllHealthPackages } from "@/lib/admin"
import { Button } from "@/components/ui/button"
import { HealthPackageList } from "@/components/health-package-list"
import { Plus } from "lucide-react"

export default async function AdminHealthPackagesPage() {
  const user = await requireRole("ADMIN")

  // Get all health packages
  const healthPackages = await getAllHealthPackages()

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Health Packages</h1>
        <Button asChild>
          <Link href="/admin/health-packages/new">
            <Plus className="h-4 w-4 mr-2" />
            Add New Package
          </Link>
        </Button>
      </div>

      <HealthPackageList healthPackages={healthPackages} />
    </div>
  )
}

