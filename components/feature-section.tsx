import { CalendarCheck, Clock, Shield, Users } from "lucide-react"

export function FeatureSection() {
  const features = [
    {
      icon: <CalendarCheck className="h-10 w-10" />,
      title: "Easy Appointment Booking",
      description: "Book appointments with doctors in just a few clicks.",
    },
    {
      icon: <Users className="h-10 w-10" />,
      title: "Top Specialists",
      description: "Access to a network of qualified healthcare professionals.",
    },
    {
      icon: <Clock className="h-10 w-10" />,
      title: "24/7 Availability",
      description: "Book appointments at your convenience, any time of day.",
    },
    {
      icon: <Shield className="h-10 w-10" />,
      title: "Secure & Private",
      description: "Your health information is protected with top-notch security.",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Why Choose MedConnect?</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              We provide a seamless healthcare experience with features designed to make your life easier.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center space-y-2 rounded-lg p-4 text-center">
              <div className="text-primary">{feature.icon}</div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

