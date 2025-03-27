"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getDoctorProfile } from "@/lib/doctor-profile"
import { getDoctorAppointments } from "@/lib/appointments"
import { AppointmentCard } from "@/components/appointment-card"
import type { Appointment, DoctorProfile, User } from "@prisma/client"
import { Plus } from "lucide-react"

type AppointmentWithPatient = Appointment & {
  patient: User
  doctorProfile: DoctorProfile & {
    user: User
  }
}

export function DoctorAppointments({ userId }: { userId: string }) {
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null)
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await getDoctorProfile(userId)
        setDoctorProfile(profile)

        if (profile) {
          const appointmentsData = await getDoctorAppointments(profile.id)
          setAppointments(appointmentsData)
        }
      } catch (error) {
        console.error("Failed to fetch doctor data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  const pendingAppointments = appointments.filter((appointment) => appointment.status === "PENDING")

  const upcomingAppointments = appointments.filter(
    (appointment) => appointment.status === "APPROVED" && new Date(appointment.date) >= new Date(),
  )

  const pastAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "COMPLETED" ||
      appointment.status === "REJECTED" ||
      appointment.status === "CANCELED" ||
      (appointment.status === "APPROVED" && new Date(appointment.date) < new Date()),
  )

  if (!doctorProfile) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium mb-2">Doctor profile not found</h3>
        <p className="text-muted-foreground mb-4">Please complete your doctor profile to continue.</p>
        <Button asChild>
          <Link href="/doctor/profile">Create Profile</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Your Appointments</h2>
        <Button asChild>
          <Link href="/doctor/availability">
            <Plus className="h-4 w-4 mr-2" />
            Add Availability
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full md:w-[600px] grid-cols-3">
          <TabsTrigger value="pending">Pending ({pendingAppointments.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-6">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          ) : pendingAppointments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} userRole="DOCTOR" />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">No pending appointments</h3>
              <p className="text-muted-foreground">You'll see pending appointment requests here.</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="upcoming" className="mt-6">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          ) : upcomingAppointments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} userRole="DOCTOR" />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">No upcoming appointments</h3>
              <p className="text-muted-foreground">Your upcoming appointments will appear here.</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="past" className="mt-6">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          ) : pastAppointments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} userRole="DOCTOR" />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">No past appointments</h3>
              <p className="text-muted-foreground">Your appointment history will appear here.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

