"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getDoctorProfile } from "@/lib/doctor-profile"
import { getDoctorAppointments } from "@/lib/appointments"
import type { Appointment, DoctorProfile, User } from "@prisma/client"
import { CalendarDays, Clock, UserIcon, Plus } from "lucide-react"

type AppointmentWithPatient = Appointment & {
  patient: User
}

export function DoctorDashboard({ userId }: { userId: string }) {
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (time: Date) => {
    return new Date(time).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const pendingAppointments = appointments.filter((appointment) => appointment.status === "PENDING")

  const upcomingAppointments = appointments.filter(
    (appointment) => appointment.status === "APPROVED" && new Date(appointment.date) >= new Date(),
  )

  const pastAppointments = appointments.filter(
    (appointment) => appointment.status === "COMPLETED" || new Date(appointment.date) < new Date(),
  )

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

  if (!doctorProfile) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium mb-2">Doctor profile not found</h3>
        <p className="text-muted-foreground mb-4">Please complete your doctor profile to continue.</p>
        <Button asChild>
          <Link href="/doctor/profile/create">Create Profile</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Doctor Dashboard</h2>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/doctor/profile">Edit Profile</Link>
          </Button>
          <Button asChild>
            <Link href="/doctor/availability">
              <Plus className="h-4 w-4 mr-2" />
              Add Availability
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Doctor Profile</CardTitle>
          <CardDescription>
            {doctorProfile.isApproved
              ? "Your profile is approved and visible to patients"
              : "Your profile is pending approval"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium">Specialty</h3>
              <p className="text-muted-foreground">{doctorProfile.specialty}</p>
            </div>
            <div>
              <h3 className="font-medium">Bio</h3>
              <p className="text-muted-foreground">{doctorProfile.bio || "No bio provided"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full md:w-[600px] grid-cols-3">
          <TabsTrigger value="pending">Pending ({pendingAppointments.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-6">
          {pendingAppointments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardHeader className="pb-2">
                    <CardTitle>{appointment.patient.name}</CardTitle>
                    <CardDescription>n>Pending Approval</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center mb-2">
                      <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{formatDate(appointment.date)}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{appointment.patient.email}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={`/appointments/${appointment.id}`}>View</Link>
                    </Button>
                  </CardFooter>
                </Card>
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
          {upcomingAppointments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardHeader className="pb-2">
                    <CardTitle>{appointment.patient.name}</CardTitle>
                    <CardDescription>Upcoming Appointment</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center mb-2">
                      <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{formatDate(appointment.date)}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{appointment.patient.email}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/appointments/${appointment.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
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
          {pastAppointments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardHeader className="pb-2">
                    <CardTitle>{appointment.patient.name}</CardTitle>
                    <CardDescription>Past Appointment</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center mb-2">
                      <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{formatDate(appointment.date)}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="text-sm font-medium">
                        Status: <span className="capitalize">{appointment.status.toLowerCase()}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/appointments/${appointment.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
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

