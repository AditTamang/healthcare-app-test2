"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import type { Role } from "@prisma/client"

export async function getAllDoctors() {
  try {
    const doctors = await db.doctorProfile.findMany({
      include: {
        user: true,
      },
    })
    return doctors
  } catch (error) {
    console.error("Failed to fetch all doctors:", error)
    throw new Error("Failed to fetch all doctors")
  }
}

export async function getAllHealthPackages() {
  try {
    const packages = await db.healthPackage.findMany({
      orderBy: {
        price: "asc",
      },
    })
    return packages
  } catch (error) {
    console.error("Failed to fetch all health packages:", error)
    throw new Error("Failed to fetch all health packages")
  }
}

export async function approveDoctorProfile(id: string) {
  try {
    await db.doctorProfile.update({
      where: { id },
      data: {
        isApproved: true,
      },
    })

    revalidatePath("/admin/dashboard")
    return { success: "Doctor profile approved successfully" }
  } catch (error) {
    console.error("Failed to approve doctor profile:", error)
    return { error: "Failed to approve doctor profile" }
  }
}

export async function rejectDoctorProfile(id: string) {
  try {
    await db.doctorProfile.delete({
      where: { id },
    })

    revalidatePath("/admin/dashboard")
    return { success: "Doctor profile rejected successfully" }
  } catch (error) {
    console.error("Failed to reject doctor profile:", error)
    return { error: "Failed to reject doctor profile" }
  }
}

export async function getAllUsers() {
  try {
    const users = await db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })
    return users
  } catch (error) {
    console.error("Failed to fetch all users:", error)
    throw new Error("Failed to fetch all users")
  }
}

export async function deleteUser(id: string) {
  try {
    await db.user.delete({
      where: { id },
    })

    revalidatePath("/admin/users")
    return { success: "User deleted successfully" }
  } catch (error) {
    console.error("Failed to delete user:", error)
    return { error: "Failed to delete user. Make sure there are no related records." }
  }
}

export async function updateUserByAdmin(id: string, formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const role = formData.get("role") as Role

  try {
    // Check if email is already in use by another user
    const existingUser = await db.user.findFirst({
      where: {
        email,
        id: {
          not: id,
        },
      },
    })

    if (existingUser) {
      return { error: "Email already in use" }
    }

    // Update the user
    await db.user.update({
      where: { id },
      data: {
        name,
        email,
        role,
      },
    })

    revalidatePath("/admin/users")
    return { success: "User updated successfully" }
  } catch (error) {
    console.error("Failed to update user:", error)
    return { error: "Failed to update user" }
  }
}

export async function getAllAppointments() {
  try {
    const appointments = await db.appointment.findMany({
      include: {
        patient: true,
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
    console.error("Failed to fetch all appointments:", error)
    throw new Error("Failed to fetch all appointments")
  }
}

