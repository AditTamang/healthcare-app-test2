"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSession } from "@/components/session-provider"
import { UserNav } from "@/components/user-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

export function MainNav() {
  const pathname = usePathname()
  const { user, status } = useSession()
  const [open, setOpen] = useState(false)

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/doctor",
      label: "Find Doctors",
      active: pathname === "/doctor",
    },
    {
      href: "/packages",
      label: "Health Packages",
      active: pathname === "/packages",
    },
  ]

  const authRoutes = user
    ? [
      {
        href: "/dashboard",
        label: "Dashboard",
        active: pathname === "/dashboard",
      },
      {
        href: "/appointments",
        label: "My Appointments",
        active: pathname === "/appointments",
      },
    ]
    : []

  const allRoutes = [...routes, ...authRoutes]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
              MedDoc
            </span>
          </Link>

          <nav className="hidden md:flex gap-6">
            {allRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  route.active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          {status === "authenticated" ? (
            <UserNav />
          ) : (
            <div className="hidden md:flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col gap-4 mt-8">
                {allRoutes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      route.active ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {route.label}
                  </Link>
                ))}
                {status === "unauthenticated" && (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="text-sm font-medium transition-colors hover:text-primary"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setOpen(false)}
                      className="text-sm font-medium transition-colors hover:text-primary"
                    >
                      Register
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

