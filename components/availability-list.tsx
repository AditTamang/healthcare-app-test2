"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { Availability } from "@prisma/client"
import { CalendarDays, Clock, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { deleteAvailability } from "@/lib/availability"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

export function AvailabilityList({
  availabilities,
  doctorProfileId,
}: {
  availabilities: Availability[]
  doctorProfileId: string
}) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const formatDate = (date: Date) => {
    return format(new Date(date), "EEEE, MMMM d, yyyy")
  }

  const formatTime = (time: Date) => {
    return format(new Date(time), "h:mm a")
  }

  const handleDelete = async (id: string) => {
    setIsLoading(id)

    try {
      const result = await deleteAvailability(id)

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
        description: "Availability deleted successfully",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete availability",
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  if (availabilities.length === 0) {
    return (
      <div className="text-center p-6 bg-muted rounded-lg">
        <p className="text-muted-foreground">No availabilities added yet.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Add your available time slots to start receiving appointments.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {availabilities.map((availability) => (
        <Card key={availability.id}>
          <CardContent className="pt-6 pb-2">
            <div className="flex items-center mb-2">
              <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{formatDate(availability.date)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>
                {formatTime(availability.startTime)} - {formatTime(availability.endTime)}
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={() => handleDelete(availability.id)}
              disabled={isLoading === availability.id}
            >
              {isLoading === availability.id ? (
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

