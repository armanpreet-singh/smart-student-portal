  import Navigation from "../../components/layout/Navigation";
  import Footer from "../../components/layout/Footer";
  import { useEffect } from "react";
  import HeroSection from "./sections/HeroSection";
  import UniversityIdentitySection from "./sections/UniversityIdentitySection";
  import CoreModulesSection from "./sections/CoreModulesSection";
  import DashboardShowcaseSection from "./sections/DashboardShowcaseSection";
  import BenefitsSection from "./sections/BenefitsSection";
  import FeaturesSection from "./sections/FeaturesSection";
  import CampusExperienceSection from "./sections/CampusExperienceSection";
  import TestimonialsSection from "./sections/TestimonialsSection";
  import FinalCTASection from "./sections/FinalCTASection";

  export default function LandingPage({
    theme,
    toggleTheme
  }) {
    return (
      <>
        <Navigation
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <main id="main-content">
          <HeroSection theme={theme} />
          <UniversityIdentitySection theme={theme} />
          <CoreModulesSection theme={theme} />
          <DashboardShowcaseSection theme={theme} />
          <BenefitsSection theme={theme} />
          <FeaturesSection theme={theme} />
          <CampusExperienceSection theme={theme} />
          <TestimonialsSection theme={theme} />
          <FinalCTASection theme={theme} />
        </main>

        <Footer theme={theme} />
      </>
    );
  }