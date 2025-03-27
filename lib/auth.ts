"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"
import { db } from "@/lib/db"
import { compare, hash } from "bcryptjs"
import { v4 as uuidv4 } from "uuid"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["PATIENT", "DOCTOR"]),
})

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const validatedFields = loginSchema.safeParse({ email, password })

  if (!validatedFields.success) {
    return { error: "Invalid fields" }
  }

  try {
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { error: "Invalid credentials" }
    }

    const passwordMatch = await compare(password, user.password)

    if (!passwordMatch) {
      return { error: "Invalid credentials" }
    }

    // Create a new session
    const token = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

    await db.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    })

    // Set the session cookie
    ;(await
      // Set the session cookie
      cookies()).set("session_token", token, {
      httpOnly: true,
      expires: expiresAt,
      path: "/",
    })

    return { success: "Logged in successfully" }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "Something went wrong" }
  }
}

export async function register(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as "PATIENT" | "DOCTOR"

  const validatedFields = registerSchema.safeParse({
    name,
    email,
    password,
    role,
  })

  if (!validatedFields.success) {
    return { error: "Invalid fields" }
  }

  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { error: "Email already in use" }
    }

    // Hash the password
    const hashedPassword = await hash(password, 10)

    // Create the user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    })

    // If the user is a doctor, create a doctor profile
    if (role === "DOCTOR") {
      await db.doctorProfile.create({
        data: {
          userId: user.id,
          specialty: "General",
          isApproved: false,
        },
      })
    }

    // Create a new session
    const token = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

    await db.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    })

    // Set the session cookie
    ;(await
      // Set the session cookie
      cookies()).set("session_token", token, {
      httpOnly: true,
      expires: expiresAt,
      path: "/",
    })

    return { success: "Registered successfully" }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "Something went wrong" }
  }
}

export async function logout() {
  const cookieStore = cookies()
  const token = (await cookieStore).get("session_token")?.value

  if (token) {
    try {
      // Delete the session from the database
      await db.session.delete({
        where: { token },
      })
    } catch (error) {
      console.error("Error deleting session:", error)
    }

    // Delete the cookie
    (await
      // Delete the cookie
      cookieStore).delete("session_token")
  }

  return { success: "Logged out successfully" }
}

export async function getUserSession() {
  const cookieStore = cookies()
  const token = (await cookieStore).get("session_token")?.value

  if (!token) {
    return null
  }

  try {
    const session = await db.session.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!session) {
      return null
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      await db.session.delete({
        where: { token },
      })
      ;(await cookieStore).delete("session_token")
      return null
    }

    return session
  } catch (error) {
    console.error("Error getting user session:", error)
    return null
  }
}

export async function requireAuth() {
  const session = await getUserSession()

  if (!session) {
    redirect("/login")
  }

  return session.user
}

export async function requireRole(role: "ADMIN" | "DOCTOR" | "PATIENT") {
  const user = await requireAuth()

  if (user.role !== role) {
    redirect("/unauthorized")
  }

  return user
}

