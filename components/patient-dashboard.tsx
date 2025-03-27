"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUpcomingAppointments, getPastAppointments } from "@/lib/appointments"
import type { Appointment, DoctorProfile, User } from "@prisma/client"
import { CalendarDays, Clock } from "lucide-react"

type AppointmentWithDoctor = Appointment & {
  doctorProfile: DoctorProfile & {
    user: User
  }
}

export function PatientDashboard({ userId }: { userId: string }) {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Patient Dashboard</h2>
        <Button asChild>
          <Link href="/appointments/book">Book New Appointment</Link>
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
          <TabsTrigger value="past">Past Appointments</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-6">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-9 bg-muted rounded w-full"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : upcomingAppointments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardHeader className="pb-2">
                    <CardTitle>{appointment.doctorProfile.user.name}</CardTitle>
                    <CardDescription>{appointment.doctorProfile.specialty}</CardDescription>
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
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-9 bg-muted rounded w-full"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : pastAppointments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardHeader className="pb-2">
                    <CardTitle>{appointment.doctorProfile.user.name}</CardTitle>
                    <CardDescription>{appointment.doctorProfile.specialty}</CardDescription>
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

