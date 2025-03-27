"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getDoctorProfile(userId: string) {
  try {
    const profile = await db.doctorProfile.findUnique({
      where: { userId },
      include: {
        availabilities: true,
      },
    })
    return profile
  } catch (error) {
    console.error("Failed to fetch doctor profile:", error)
    throw new Error("Failed to fetch doctor profile")
  }
}

export async function createDoctorProfile(userId: string, formData: FormData) {
  const specialty = formData.get("specialty") as string
  const bio = formData.get("bio") as string

  try {
    await db.doctorProfile.create({
      data: {
        userId,
        specialty,
        bio,
        isApproved: false,
      },
    })

    revalidatePath("/doctor/profile")
    revalidatePath("/dashboard")
    return { success: "Doctor profile created successfully" }
  } catch (error) {
    console.error("Failed to create doctor profile:", error)
    return { error: "Failed to create doctor profile" }
  }
}

export async function updateDoctorProfile(userId: string, formData: FormData) {
  const specialty = formData.get("specialty") as string
  const bio = formData.get("bio") as string

  try {
    await db.doctorProfile.update({
      where: { userId },
      data: {
        specialty,
        bio,
      },
    })

    revalidatePath("/doctor/profile")
    revalidatePath("/dashboard")
    return { success: "Doctor profile updated successfully" }
  } catch (error) {
    console.error("Failed to update doctor profile:", error)
    return { error: "Failed to update doctor profile" }
  }
}

export async function getAllDoctors() {
  try {
    const doctors = await db.doctorProfile.findMany({
      where: {
        isApproved: true,
      },
      include: {
        user: true,
        availabilities: {
          where: {
            date: {
              gte: new Date(),
            },
          },
        },
      },
    })
    return doctors
  } catch (error) {
    console.error("Failed to fetch doctors:", error)
    throw new Error("Failed to fetch doctors")
  }
}

export async function getDoctorById(id: string) {
  try {
    const doctor = await db.doctorProfile.findUnique({
      where: { id },
      include: {
        user: true,
        availabilities: {
          where: {
            date: {
              gte: new Date(),
            },
          },
          orderBy: {
            date: "asc",
          },
        },
      },
    })
    return doctor
  } catch (error) {
    console.error(`Failed to fetch doctor with id ${id}:`, error)
    throw new Error("Failed to fetch doctor")
  }
}

