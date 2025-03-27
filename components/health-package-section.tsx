"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getHealthPackages } from "@/lib/health-packages"
import type { HealthPackage } from "@prisma/client"

export function HealthPackageSection() {
  const [packages, setPackages] = useState<HealthPackage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const data = await getHealthPackages()
        setPackages(data)
      } catch (error) {
        console.error("Failed to fetch health packages:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [])

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Health Packages</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Choose a health package that suits your needs and budget.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array(3)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="flex flex-col justify-between">
                  <CardHeader>
                    <div className="h-7 w-1/2 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 w-full bg-muted rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
                  </CardFooter>
                </Card>
              ))
          ) : packages.length > 0 ? (
            packages.map((pkg) => (
              <Card key={pkg.id} className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle>{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${pkg.price.toFixed(2)}</div>
                  <p className="text-muted-foreground">{pkg.duration} minutes</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href={`/packages/${pkg.id}`}>Select Package</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center">
              <p>No health packages available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

