import Navigation from "../../components/layout/Navigation";
import Footer from "../../components/layout/Footer";
import { lazy, Suspense } from "react";

import HeroSection from "./sections/HeroSection";
import UniversityIdentitySection from "./sections/UniversityIdentitySection";
import CoreModulesSection from "./sections/CoreModulesSection";
import DashboardShowcaseSection from "./sections/DashboardShowcaseSection";

// Lazy-loaded sections
const BenefitsSection = lazy(() =>
  import("./sections/BenefitsSection")
);


const FeaturesSection = lazy(() =>
  import("./sections/FeaturesSection")
);

const CampusExperienceSection = lazy(() =>
  import("./sections/CampusExperienceSection")
);

const TestimonialsSection = lazy(() =>
  import("./sections/TestimonialsSection")
);

const FinalCTASection = lazy(() =>
  import("./sections/FinalCTASection")
);

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

        <Suspense fallback={null}>
          <BenefitsSection theme={theme} />
          <FeaturesSection theme={theme} />
          <CampusExperienceSection theme={theme} />
          <TestimonialsSection theme={theme} />
          <FinalCTASection theme={theme} />
        </Suspense>
      </main>

      <Footer theme={theme} />
    </>
  );
}