"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { User } from "@prisma/client"
import { getUserSession } from "@/lib/auth"

type SessionContextType = {
  user: User | null
  status: "loading" | "authenticated" | "unauthenticated"
  refresh: () => Promise<void>
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  status: "loading",
  refresh: async () => {},
})

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading")
  const router = useRouter()
  const pathname = usePathname()

  const refresh = async () => {
    try {
      const session = await getUserSession()
      if (session) {
        setUser(session.user)
        setStatus("authenticated")
      } else {
        setUser(null)
        setStatus("unauthenticated")
      }
    } catch (error) {
      setUser(null)
      setStatus("unauthenticated")
    }
  }

  useEffect(() => {
    refresh()
  }, [pathname])

  return <SessionContext.Provider value={{ user, status, refresh }}>{children}</SessionContext.Provider>
}

export const useSession = () => useContext(SessionContext)

