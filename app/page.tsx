import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { AppointmentBooking } from "@/components/appointment-booking"
import { PharmacySection } from "@/components/pharmacy-section"
import { AIChatbot } from "@/components/ai-chatbot"
import { HealthRecords } from "@/components/health-records"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* <Header /> */}
      <main>
        <HeroSection />
        <ServicesSection />
        {/* <AppointmentBooking /> */}
        {/* <PharmacySection /> */}
        {/* <HealthRecords /> */}
      </main>
      <AIChatbot />
    </div>
  )
}
