"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllDoctors, approveDoctorProfile } from "@/lib/admin"
import { getHealthPackages } from "@/lib/health-packages"
import type { DoctorProfile, HealthPackage, User } from "@prisma/client"
import { Check, X, Edit, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type DoctorWithUser = DoctorProfile & {
  user: User
}

export function AdminDashboard() {
  const [doctors, setDoctors] = useState<DoctorWithUser[]>([])
  const [pendingDoctors, setPendingDoctors] = useState<DoctorWithUser[]>([])
  const [healthPackages, setHealthPackages] = useState<HealthPackage[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allDoctors = await getAllDoctors()
        const allPackages = await getHealthPackages()

        setDoctors(allDoctors.filter((doctor) => doctor.isApproved))
        setPendingDoctors(allDoctors.filter((doctor) => !doctor.isApproved))
        setHealthPackages(allPackages)
      } catch (error) {
        console.error("Failed to fetch admin data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleApproveDoctor = async (id: string) => {
    try {
      const result = await approveDoctorProfile(id)

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
        description: "Doctor profile approved successfully",
      })

      // Update local state
      const updatedDoctor = pendingDoctors.find((doctor) => doctor.id === id)
      if (updatedDoctor) {
        setPendingDoctors(pendingDoctors.filter((doctor) => doctor.id !== id))
        setDoctors([...doctors, { ...updatedDoctor, isApproved: true }])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve doctor profile",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-1/4 animate-pulse"></div>
        <div className="h-32 bg-muted rounded w-full animate-pulse"></div>
        <div className="h-8 bg-muted rounded w-1/3 animate-pulse"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/health-packages/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Health Package
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>Quick stats about the healthcare system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium text-lg">{doctors.length}</h3>
              <p className="text-muted-foreground">Approved Doctors</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium text-lg">{pendingDoctors.length}</h3>
              <p className="text-muted-foreground">Pending Approvals</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium text-lg">{healthPackages.length}</h3>
              <p className="text-muted-foreground">Health Packages</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
          <TabsTrigger value="packages">Health Packages</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-6">
          {pendingDoctors.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingDoctors.map((doctor) => (
                <Card key={doctor.id}>
                  <CardHeader className="pb-2">
                    <CardTitle>{doctor.user.name}</CardTitle>
                    <CardDescription>{doctor.specialty}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="mb-2">
                      <span className="text-sm font-medium">Email:</span>
                      <span className="text-sm ml-2">{doctor.user.email}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-sm font-medium">Bio:</span>
                      <p className="text-sm text-muted-foreground">{doctor.bio || "No bio provided"}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleApproveDoctor(doctor.id)}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">No pending approvals</h3>
              <p className="text-muted-foreground">All doctor profiles have been reviewed.</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="packages" className="mt-6">
          {healthPackages.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {healthPackages.map((pkg) => (
                <Card key={pkg.id}>
                  <CardHeader className="pb-2">
                    <CardTitle>{pkg.name}</CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="mb-2">
                      <span className="text-sm font-medium">Price:</span>
                      <span className="text-sm ml-2">${pkg.price.toFixed(2)}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-sm font-medium">Duration:</span>
                      <span className="text-sm ml-2">{pkg.duration} minutes</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/admin/health-packages/${pkg.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Package
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">No health packages</h3>
              <p className="text-muted-foreground mb-4">Create health packages for patients to choose from.</p>
              <Button asChild>
                <Link href="/admin/health-packages/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Health Package
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

