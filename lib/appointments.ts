"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import type { AppointmentStatus } from "@prisma/client"

export async function getUpcomingAppointments(userId: string) {
  try {
    const appointments = await db.appointment.findMany({
      where: {
        patientId: userId,
        date: {
          gte: new Date(),
        },
      },
      include: {
        doctorProfile: {
          include: {
            user: true,
          },
        },
        healthPackage: true,
      },
      orderBy: {
        date: "asc",
      },
    })
    return appointments
  } catch (error) {
    console.error("Failed to fetch upcoming appointments:", error)
    throw new Error("Failed to fetch upcoming appointments")
  }
}

export async function getPastAppointments(userId: string) {
  try {
    const appointments = await db.appointment.findMany({
      where: {
        patientId: userId,
        date: {
          lt: new Date(),
        },
      },
      include: {
        doctorProfile: {
          include: {
            user: true,
          },
        },
        healthPackage: true,
      },
      orderBy: {
        date: "desc",
      },
    })
    return appointments
  } catch (error) {
    console.error("Failed to fetch past appointments:", error)
    throw new Error("Failed to fetch past appointments")
  }
}

export async function getDoctorAppointments(doctorProfileId: string) {
  try {
    const appointments = await db.appointment.findMany({
      where: {
        doctorProfileId,
      },
      include: {
        patient: true,
        healthPackage: true,
      },
      orderBy: {
        date: "asc",
      },
    })
    return appointments
  } catch (error) {
    console.error("Failed to fetch doctor appointments:", error)
    throw new Error("Failed to fetch doctor appointments")
  }
}

export async function getAppointment(id: string) {
  try {
    const appointment = await db.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        doctorProfile: {
          include: {
            user: true,
          },
        },
        healthPackage: true,
      },
    })
    return appointment
  } catch (error) {
    console.error(`Failed to fetch appointment with id ${id}:`, error)
    throw new Error("Failed to fetch appointment")
  }
}

export async function bookAppointment(formData: FormData) {
  const patientId = formData.get("patientId") as string
  const doctorProfileId = formData.get("doctorProfileId") as string
  const date = new Date(formData.get("date") as string)
  const startTime = new Date(formData.get("startTime") as string)
  const endTime = new Date(formData.get("endTime") as string)
  const notes = formData.get("notes") as string
  const healthPackageId = (formData.get("healthPackageId") as string) || null

  try {
    // Get the doctor's user ID
    const doctorProfile = await db.doctorProfile.findUnique({
      where: { id: doctorProfileId },
      select: { userId: true },
    })

    if (!doctorProfile) {
      return { error: "Doctor not found" }
    }

    await db.appointment.create({
      data: {
        patientId,
        doctorProfileId,
        doctorId: doctorProfile.userId,
        date,
        startTime,
        endTime,
        notes,
        healthPackageId,
        status: "PENDING",
      },
    })

    revalidatePath("/appointments")
    revalidatePath("/dashboard")
    return { success: "Appointment booked successfully" }
  } catch (error) {
    console.error("Failed to book appointment:", error)
    return { error: "Failed to book appointment" }
  }
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  try {
    await db.appointment.update({
      where: { id },
      data: { status },
    })

    revalidatePath("/appointments")
    revalidatePath("/dashboard")
    revalidatePath(`/appointments/${id}`)
    return { success: `Appointment ${status.toLowerCase()} successfully` }
  } catch (error) {
    console.error("Failed to update appointment status:", error)
    return { error: "Failed to update appointment status" }
  }
}

export async function cancelAppointment(id: string) {
  return updateAppointmentStatus(id, "CANCELED")
}

export async function approveAppointment(id: string) {
  return updateAppointmentStatus(id, "APPROVED")
}

export async function rejectAppointment(id: string) {
  return updateAppointmentStatus(id, "REJECTED")
}

export async function completeAppointment(id: string) {
  return updateAppointmentStatus(id, "COMPLETED")
}

