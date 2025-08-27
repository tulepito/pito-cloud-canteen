import { FAQsAltCenter } from '../components/FAQsAlt';
import ImageMarquee from '../components/ImageMarquee';
import CommonProblems from '../components/MediumBusiness/CommonProblems';
import CTASection from '../components/MediumBusiness/CTASection';
import Hero from '../components/MediumBusiness/Hero';
import HowItWorks from '../components/MediumBusiness/HowItWorks';
import SingleTestimonial from '../components/SingleTestimonial';
import Testimonials from '../components/Testimonials';
import TrustedCompanies from '../components/TrustedCompanies';

const MediumBusiness = () => {
  return (
    <div>
      <Hero />
      <TrustedCompanies />
      <CommonProblems />
      <SingleTestimonial />
      <HowItWorks />
      <ImageMarquee className="!mb-0 md:py-16" />
      <Testimonials />
      <FAQsAltCenter />
      <CTASection />
    </div>
  );
};

export default MediumBusiness;
