"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Appointment, DoctorProfile, HealthPackage, Role, User } from "@prisma/client"
import { CalendarDays, Clock, FileText, Package, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cancelAppointment, approveAppointment, rejectAppointment, completeAppointment } from "@/lib/appointments"
import { format } from "date-fns"

type AppointmentWithRelations = Appointment & {
  patient: User
  doctorProfile: DoctorProfile & {
    user: User
  }
  healthPackage: HealthPackage | null
}

export function AppointmentDetails({
  appointment,
  userRole,
  userId,
}: {
  appointment: AppointmentWithRelations
  userRole: Role
  userId: string
}) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const formatDate = (date: Date) => {
    return format(new Date(date), "EEEE, MMMM d, yyyy")
  }

  const formatTime = (time: Date) => {
    return format(new Date(time), "h:mm a")
  }

  const handleStatusUpdate = async (action: "cancel" | "approve" | "reject" | "complete", id: string) => {
    setIsLoading(true)

    try {
      let result

      switch (action) {
        case "cancel":
          result = await cancelAppointment(id)
          break
        case "approve":
          result = await approveAppointment(id)
          break
        case "reject":
          result = await rejectAppointment(id)
          break
        case "complete":
          result = await completeAppointment(id)
          break
      }

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
        description: result.success,
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isPatient = userId === appointment.patientId
  const isDoctor = userId === appointment.doctorId
  const canCancel =
    (isPatient || isDoctor || userRole === "ADMIN") &&
    (appointment.status === "PENDING" || appointment.status === "APPROVED")
  const canApprove = (isDoctor || userRole === "ADMIN") && appointment.status === "PENDING"
  const canReject = (isDoctor || userRole === "ADMIN") && appointment.status === "PENDING"
  const canComplete = (isDoctor || userRole === "ADMIN") && appointment.status === "APPROVED"

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Appointment with {appointment.doctorProfile.user.name}</CardTitle>
          <CardDescription>
            Status: <span className="capitalize">{appointment.status.toLowerCase()}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Doctor</h3>
              <p>{appointment.doctorProfile.user.name}</p>
              <p className="text-sm text-muted-foreground">{appointment.doctorProfile.specialty}</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Patient</h3>
              <p>{appointment.patient.name}</p>
              <p className="text-sm text-muted-foreground">{appointment.patient.email}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center">
              <CalendarDays className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-medium">Date</h3>
                <p>{formatDate(appointment.date)}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-medium">Time</h3>
                <p>
                  {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                </p>
              </div>
            </div>
          </div>

          {appointment.healthPackage && (
            <div className="flex items-start">
              <Package className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="text-sm font-medium">Health Package</h3>
                <p>{appointment.healthPackage.name}</p>
                <p className="text-sm text-muted-foreground">
                  ${appointment.healthPackage.price.toFixed(2)} - {appointment.healthPackage.duration} minutes
                </p>
                <p className="text-sm text-muted-foreground">{appointment.healthPackage.description}</p>
              </div>
            </div>
          )}

          {appointment.notes && (
            <div className="flex items-start">
              <FileText className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="text-sm font-medium">Notes</h3>
                <p className="text-sm">{appointment.notes}</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          {canCancel && (
            <Button
              variant="destructive"
              onClick={() => handleStatusUpdate("cancel", appointment.id)}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel Appointment
            </Button>
          )}
          {canApprove && (
            <Button
              variant="default"
              onClick={() => handleStatusUpdate("approve", appointment.id)}
              disabled={isLoading}
            >
              <Check className="h-4 w-4 mr-2" />
              Approve
            </Button>
          )}
          {canReject && (
            <Button variant="outline" onClick={() => handleStatusUpdate("reject", appointment.id)} disabled={isLoading}>
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
          )}
          {canComplete && (
            <Button
              variant="default"
              onClick={() => handleStatusUpdate("complete", appointment.id)}
              disabled={isLoading}
            >
              <Check className="h-4 w-4 mr-2" />
              Mark as Completed
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

