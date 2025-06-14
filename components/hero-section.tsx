import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Your Health, Our Priority
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Book appointments with top doctors, manage your health records, and get the care you deserve.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg">
                <Link href="/register">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/doctor">Find Doctors</Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <img
              alt="Healthcare professionals"
              className="aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              src="/doctorFront.jpg"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

