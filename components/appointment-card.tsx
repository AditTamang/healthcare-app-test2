"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Appointment, DoctorProfile, Role, User } from "@prisma/client"
import { CalendarDays, Clock } from "lucide-react"
import { format } from "date-fns"

type AppointmentWithRelations = Appointment & {
  doctorProfile: DoctorProfile & {
    user: User
  }
  patient?: User
}

export function AppointmentCard({
  appointment,
  userRole,
}: {
  appointment: AppointmentWithRelations
  userRole: Role
}) {
  const formatDate = (date: Date) => {
    return format(new Date(date), "EEEE, MMMM d, yyyy")
  }

  const formatTime = (time: Date) => {
    return format(new Date(time), "h:mm a")
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "APPROVED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "CANCELED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>
              {userRole === "PATIENT" ? `Dr. ${appointment.doctorProfile.user.name}` : appointment.patient?.name}
            </CardTitle>
            <CardDescription>
              {userRole === "PATIENT" ? appointment.doctorProfile.specialty : "Patient"}
            </CardDescription>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusClass(appointment.status)}`}>
            {appointment.status.charAt(0) + appointment.status.slice(1).toLowerCase()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center mb-2">
          <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm">{formatDate(appointment.date)}</span>
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm">
            {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/appointments/${appointment.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

