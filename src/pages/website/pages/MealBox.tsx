import CTAAlt from '../components/CTAAlt';
// import Decor2 from '../components/Decor2';
import FAQsAlt from '../components/FAQsAlt';
import HighlightedFeaturesCard from '../components/HighlightedFeaturesCard';
import Hero from '../components/HowItWorks/Hero';
import HowItWorksDynamicCard from '../components/HowItWorksDynamicCard';
import SimplifyOrdering from '../components/SimplifyOrdering';
import SingleTestimonial from '../components/SingleTestimonial';
import Testimonials from '../components/Testimonials';
import TrustedCompanies from '../components/TrustedCompanies';

const MealBox = () => {
  return (
    <div className="overflow-hidden">
      <Hero />
      {/* <Hero2 /> */}
      <TrustedCompanies />
      <HowItWorksDynamicCard />
      <HighlightedFeaturesCard />
      <SingleTestimonial />
      <SimplifyOrdering />
      {/* <Decor2 /> */}
      <Testimonials />
      <FAQsAlt />
      <CTAAlt />
      <div className="w-full bg-neutral-200 h-[1px]"></div>
    </div>
  );
};

export default MealBox;
