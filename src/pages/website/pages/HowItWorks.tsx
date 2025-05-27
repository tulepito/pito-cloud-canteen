import CTAAlt from '../components/CTAAlt';
import Decor2 from '../components/Decor2';
import FAQsAlt from '../components/FAQsAlt';
import HighlightedFeaturesCard from '../components/HighlightedFeaturesCard';
import Hero from '../components/HowItWorks/Hero';
import Hero2 from '../components/HowItWorks/Hero2';
import HowItWorksDynamicCard from '../components/HowItWorksDynamicCard';
import SimplifyOrdering from '../components/SimplifyOrdering';
import SingleTestimonial from '../components/SingleTestimonial';
import Testimonials from '../components/Testimonials';
import TrustedCompanies from '../components/TrustedCompanies';

const HowItWorks = () => {
  return (
    <div className="overflow-hidden">
      <Hero />
      <Hero2 />
      <HowItWorksDynamicCard />
      <HighlightedFeaturesCard />
      <Decor2 />
      <Testimonials />
      <TrustedCompanies />
      <SingleTestimonial />
      <SimplifyOrdering />
      <FAQsAlt />
      <CTAAlt />
    </div>
  );
};

export default HowItWorks;
