"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllAppointments } from "@/lib/admin"
import { AppointmentCard } from "@/components/appointment-card"
import type { Appointment, DoctorProfile, User } from "@prisma/client"

type AppointmentWithRelations = Appointment & {
  patient: User
  doctorProfile: DoctorProfile & {
    user: User
  }
}

export function AdminAppointments() {
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const appointmentsData = await getAllAppointments()
        setAppointments(appointmentsData)
      } catch (error) {
        console.error("Failed to fetch appointments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">All Appointments</h2>

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
                <AppointmentCard key={appointment.id} appointment={appointment} userRole="ADMIN" />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">No pending appointments</h3>
              <p className="text-muted-foreground">All appointments have been processed.</p>
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
                <AppointmentCard key={appointment.id} appointment={appointment} userRole="ADMIN" />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">No upcoming appointments</h3>
              <p className="text-muted-foreground">There are no upcoming appointments in the system.</p>
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
                <AppointmentCard key={appointment.id} appointment={appointment} userRole="ADMIN" />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">No past appointments</h3>
              <p className="text-muted-foreground">There are no past appointments in the system.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

