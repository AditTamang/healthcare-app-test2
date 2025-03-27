"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { getAllDoctors, getDoctorById } from "@/lib/doctor-profile"
import { getHealthPackages } from "@/lib/health-packages"
import { bookAppointment } from "@/lib/appointments"
import type { DoctorProfile, HealthPackage, User, Availability } from "@prisma/client"
import { format } from "date-fns"

type DoctorWithUser = DoctorProfile & {
  user: User
  availabilities: Availability[]
}

export function BookAppointmentForm({ patientId }: { patientId: string }) {
  const [doctors, setDoctors] = useState<DoctorWithUser[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<string>("")
  const [selectedDoctorData, setSelectedDoctorData] = useState<DoctorWithUser | null>(null)
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [selectedAvailability, setSelectedAvailability] = useState<string>("")
  const [healthPackages, setHealthPackages] = useState<HealthPackage[]>([])
  const [selectedPackage, setSelectedPackage] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const doctorsData = await getAllDoctors()
        const packagesData = await getHealthPackages()
        setDoctors(doctorsData)
        setHealthPackages(packagesData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast({
          title: "Error",
          description: "Failed to load doctors and packages",
          variant: "destructive",
        })
      } finally {
        setInitialLoading(false)
      }
    }

    fetchData()
  }, [toast])

  useEffect(() => {
    const fetchDoctorData = async () => {
      if (!selectedDoctor) {
        setSelectedDoctorData(null)
        setAvailabilities([])
        return
      }

      try {
        const doctorData = await getDoctorById(selectedDoctor)
        setSelectedDoctorData(doctorData)
        setAvailabilities(doctorData?.availabilities || [])
      } catch (error) {
        console.error("Failed to fetch doctor data:", error)
        toast({
          title: "Error",
          description: "Failed to load doctor information",
          variant: "destructive",
        })
      }
    }

    fetchDoctorData()
  }, [selectedDoctor, toast])

  const formatDate = (date: Date) => {
    return format(new Date(date), "EEEE, MMMM d, yyyy")
  }

  const formatTime = (time: Date) => {
    return format(new Date(time), "h:mm a")
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedDoctor || !selectedAvailability) {
      toast({
        title: "Error",
        description: "Please select a doctor and an available time slot",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const availability = availabilities.find((a) => a.id === selectedAvailability)

      if (!availability) {
        throw new Error("Selected availability not found")
      }

      const formData = new FormData()
      formData.append("patientId", patientId)
      formData.append("doctorProfileId", selectedDoctor)
      formData.append("date", availability.date.toISOString())
      formData.append("startTime", availability.startTime.toISOString())
      formData.append("endTime", availability.endTime.toISOString())
      formData.append("notes", notes)

      if (selectedPackage) {
        formData.append("healthPackageId", selectedPackage)
      }

      const result = await bookAppointment(formData)

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
        description: "Appointment booked successfully",
      })

      router.push("/appointments")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to book appointment",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded w-1/3 animate-pulse"></div>
        <div className="h-32 bg-muted rounded w-full animate-pulse"></div>
        <div className="h-10 bg-muted rounded w-1/2 animate-pulse"></div>
        <div className="h-32 bg-muted rounded w-full animate-pulse"></div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="space-y-2">
        <Label htmlFor="doctor">Select a Doctor</Label>
        <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
          <SelectTrigger>
            <SelectValue placeholder="Select a doctor" />
          </SelectTrigger>
          <SelectContent>
            {doctors.map((doctor) => (
              <SelectItem key={doctor.id} value={doctor.id}>
                {doctor.user.name} - {doctor.specialty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedDoctorData && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h3 className="font-medium text-lg">{selectedDoctorData.user.name}</h3>
              <p className="text-muted-foreground">{selectedDoctorData.specialty}</p>
              {selectedDoctorData.bio && <p className="text-sm">{selectedDoctorData.bio}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {availabilities.length > 0 && (
        <div className="space-y-2">
          <Label>Select an Available Time Slot</Label>
          <RadioGroup
            value={selectedAvailability}
            onValueChange={setSelectedAvailability}
            className="grid grid-cols-1 md:grid-cols-2 gap-2"
          >
            {availabilities.map((availability) => (
              <div key={availability.id} className="flex items-center space-x-2">
                <RadioGroupItem value={availability.id} id={availability.id} />
                <Label htmlFor={availability.id} className="cursor-pointer">
                  {formatDate(availability.date)} - {formatTime(availability.startTime)} to{" "}
                  {formatTime(availability.endTime)}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {healthPackages.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="package">Select a Health Package (Optional)</Label>
          <Select value={selectedPackage} onValueChange={setSelectedPackage}>
            <SelectTrigger>
              <SelectValue placeholder="Select a package" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No package</SelectItem>
              {healthPackages.map((pkg) => (
                <SelectItem key={pkg.id} value={pkg.id}>
                  {pkg.name} - ${pkg.price.toFixed(2)} ({pkg.duration} min)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any notes or concerns you'd like to share with the doctor"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
        />
      </div>

      <Button type="submit" disabled={isLoading || !selectedDoctor || !selectedAvailability}>
        {isLoading ? "Booking..." : "Book Appointment"}
      </Button>
    </form>
  )
}

