import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import OnboardingForm from '@/components/OnboardingForm'
import CampaignList from '@/components/CampaignList'
import Footer from '@/components/Footer'
import Nav from '@/components/Nav'

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <HowItWorks />
      <OnboardingForm />
      <CampaignList />
      <Footer />
    </main>
  )
}
