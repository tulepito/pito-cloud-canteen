import CTA from '../components/Cafeteria/CTA';
import Decor from '../components/Cafeteria/Decor';
import Hero from '../components/Cafeteria/Hero';
import HighlightedFeaturesCard from '../components/Cafeteria/HighlightedFeaturesCard';
import HowItWorksDynamicCard from '../components/Cafeteria/HowItWorksDynamicCard';
import { FAQsAltCenter } from '../components/FAQsAlt';
import SingleTestimonial from '../components/SingleTestimonial';
import Testimonials from '../components/Testimonials';
import TrustedCompanies from '../components/TrustedCompanies';

const Cafeteria = () => {
  return (
    <div>
      <Hero />
      <TrustedCompanies />
      <HowItWorksDynamicCard />
      <SingleTestimonial />
      <HighlightedFeaturesCard />
      <Testimonials />
      <FAQsAltCenter />
      <CTA />
      <Decor />
      <div className="w-full bg-neutral-200 h-[1px]"></div>
    </div>
  );
};

export default Cafeteria;
