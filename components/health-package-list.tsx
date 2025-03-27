"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { HealthPackage } from "@prisma/client"
import { Edit, Trash2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { deleteHealthPackage } from "@/lib/health-packages"

export function HealthPackageList({
  healthPackages,
}: {
  healthPackages: HealthPackage[]
}) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this health package?")) {
      return
    }

    setIsLoading(id)

    try {
      const result = await deleteHealthPackage(id)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Health package deleted successfully",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete health package",
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  if (healthPackages.length === 0) {
    return (
      <div className="text-center p-10 bg-muted rounded-lg">
        <h3 className="text-lg font-medium mb-2">No health packages</h3>
        <p className="text-muted-foreground mb-4">Create health packages for patients to choose from.</p>
        <Button asChild>
          <Link href="/admin/health-packages/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Health Package
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {healthPackages.map((pkg) => (
        <Card key={pkg.id}>
          <CardHeader>
            <CardTitle>{pkg.name}</CardTitle>
            <div className="text-2xl font-bold">${pkg.price.toFixed(2)}</div>
          </CardHeader>
          <CardContent>
            <p className="mb-2">{pkg.description}</p>
            <p className="text-sm text-muted-foreground">Duration: {pkg.duration} minutes</p>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline" className="flex-1" asChild>
              <Link href={`/admin/health-packages/${pkg.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => handleDelete(pkg.id)}
              disabled={isLoading === pkg.id}
            >
              {isLoading === pkg.id ? (
                "Deleting..."
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

