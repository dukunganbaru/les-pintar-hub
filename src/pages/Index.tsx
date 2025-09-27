import Navbar from "@/components/Navbar"
import HeroSection from "@/components/HeroSection"
import WhyChooseUs from "@/components/WhyChooseUs"
import PricingSection from "@/components/PricingSection"
import Footer from "@/components/Footer"

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <WhyChooseUs />
      <PricingSection />
      <Footer />
    </div>
  );
};

export default Index;
