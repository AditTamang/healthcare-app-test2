"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUpcomingAppointments, getPastAppointments } from "@/lib/appointments"
import { AppointmentCard } from "@/components/appointment-card"
import type { Appointment, DoctorProfile, User } from "@prisma/client"
import { Plus } from "lucide-react"

type AppointmentWithDoctor = Appointment & {
  doctorProfile: DoctorProfile & {
    user: User
  }
}

export function PatientAppointments({ userId }: { userId: string }) {
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentWithDoctor[]>([])
  const [pastAppointments, setPastAppointments] = useState<AppointmentWithDoctor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const upcoming = await getUpcomingAppointments(userId)
        const past = await getPastAppointments(userId)
        setUpcomingAppointments(upcoming)
        setPastAppointments(past)
      } catch (error) {
        console.error("Failed to fetch appointments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [userId])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Your Appointments</h2>
        <Button asChild>
          <Link href="/appointments/book">
            <Plus className="h-4 w-4 mr-2" />
            Book New Appointment
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
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
                <AppointmentCard key={appointment.id} appointment={appointment} userRole="PATIENT" />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium mb-2">No upcoming appointments</h3>
              <p className="text-muted-foreground mb-4">Book an appointment with one of our doctors.</p>
              <Button asChild>
                <Link href="/appointments/book">Book Appointment</Link>
              </Button>
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
                <AppointmentCard key={appointment.id} appointment={appointment} userRole="PATIENT" />
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

