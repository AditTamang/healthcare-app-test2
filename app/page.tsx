import { HeroSection } from "@/components/hero-section"
import { FeatureSection } from "@/components/feature-section"
import { HealthPackageSection } from "@/components/health-package-section"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <FeatureSection />
      <HealthPackageSection />
    </div>
  )
}

