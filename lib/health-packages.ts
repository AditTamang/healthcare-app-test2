"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const healthPackageSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z
    .string()
    .refine((value) => !isNaN(Number.parseFloat(value)), {
      message: "Price must be a number",
    })
    .transform((value) => Number.parseFloat(value)),
  duration: z
    .string()
    .refine((value) => !isNaN(Number.parseInt(value)), {
      message: "Duration must be a number",
    })
    .transform((value) => Number.parseInt(value)),
})

export async function getHealthPackages() {
  try {
    const packages = await db.healthPackage.findMany({
      orderBy: {
        price: "asc",
      },
    })
    return packages
  } catch (error) {
    console.error("Failed to fetch health packages:", error)
    return []
  }
}

export async function createHealthPackage(formData: FormData) {
  const validatedFields = healthPackageSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    duration: formData.get("duration"),
  })

  if (!validatedFields.success) {
    return { error: "Invalid fields" }
  }

  const { name, description, price, duration } = validatedFields.data

  try {
    await db.healthPackage.create({
      data: {
        name,
        description,
        price,
        duration,
      },
    })

    revalidatePath("/admin/health-packages")
    return { success: "Health package created successfully" }
  } catch (error) {
    console.error("Failed to create health package:", error)
    return { error: "Failed to create health package" }
  }
}

export async function updateHealthPackage(id: string, formData: FormData) {
  const validatedFields = healthPackageSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    duration: formData.get("duration"),
  })

  if (!validatedFields.success) {
    return { error: "Invalid fields" }
  }

  const { name, description, price, duration } = validatedFields.data

  try {
    await db.healthPackage.update({
      where: { id },
      data: {
        name,
        description,
        price,
        duration,
      },
    })

    revalidatePath("/admin/health-packages")
    return { success: "Health package updated successfully" }
  } catch (error) {
    console.error("Failed to update health package:", error)
    return { error: "Failed to update health package" }
  }
}

export async function deleteHealthPackage(id: string) {
  try {
    await db.healthPackage.delete({
      where: { id },
    })

    revalidatePath("/admin/health-packages")
    return { success: "Health package deleted successfully" }
  } catch (error) {
    console.error("Failed to delete health package:", error)
    return { error: "Failed to delete health package" }
  }
}

export async function getHealthPackage(id: string) {
  try {
    const healthPackage = await db.healthPackage.findUnique({
      where: { id },
    })
    return healthPackage
  } catch (error) {
    console.error("Failed to fetch health package:", error)
    return null
  }
}

