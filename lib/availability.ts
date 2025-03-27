"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getAvailabilities(doctorProfileId: string) {
  try {
    const availabilities = await db.availability.findMany({
      where: {
        doctorProfileId,
        date: {
          gte: new Date(),
        },
      },
      orderBy: {
        date: "asc",
      },
    })
    return availabilities
  } catch (error) {
    console.error("Failed to fetch availabilities:", error)
    throw new Error("Failed to fetch availabilities")
  }
}

export async function addAvailability(formData: FormData) {
  const doctorProfileId = formData.get("doctorProfileId") as string
  const date = new Date(formData.get("date") as string)
  const startTime = new Date(formData.get("startTime") as string)
  const endTime = new Date(formData.get("endTime") as string)

  // Validate times
  if (startTime >= endTime) {
    return { error: "Start time must be before end time" }
  }

  try {
    await db.availability.create({
      data: {
        doctorProfileId,
        date,
        startTime,
        endTime,
      },
    })

    revalidatePath("/doctor/availability")
    revalidatePath("/dashboard")
    return { success: "Availability added successfully" }
  } catch (error) {
    console.error("Failed to add availability:", error)
    return { error: "Failed to add availability" }
  }
}

export async function deleteAvailability(id: string) {
  try {
    await db.availability.delete({
      where: { id },
    })

    revalidatePath("/doctor/availability")
    revalidatePath("/dashboard")
    return { success: "Availability deleted successfully" }
  } catch (error) {
    console.error("Failed to delete availability:", error)
    return { error: "Failed to delete availability" }
  }
}

