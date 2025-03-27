"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const userProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
})

export async function updateUserProfile(userId: string, formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string

  try {
    // Validate the input
    const validatedFields = userProfileSchema.safeParse({ name, email })

    if (!validatedFields.success) {
      return { error: "Invalid fields" }
    }

    // Check if email is already in use by another user
    const existingUser = await db.user.findFirst({
      where: {
        email,
        id: {
          not: userId,
        },
      },
    })

    if (existingUser) {
      return { error: "Email already in use" }
    }

    // Update the user
    await db.user.update({
      where: { id: userId },
      data: {
        name,
        email,
      },
    })

    revalidatePath("/patient/profile")
    revalidatePath("/dashboard")
    return { success: "Profile updated successfully" }
  } catch (error) {
    console.error("Failed to update user profile:", error)
    return { error: "Failed to update profile" }
  }
}

export async function getUserProfile(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    })
    return user
  } catch (error) {
    console.error("Failed to fetch user profile:", error)
    throw new Error("Failed to fetch user profile")
  }
}

