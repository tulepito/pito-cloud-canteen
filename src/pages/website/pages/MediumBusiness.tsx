import CTABg from '../assets/CTABg3.png';
import CTABgMobile from '../assets/CTABg3-2.png';
import { FAQsAltCenter } from '../components/FAQsAlt';
import ImageMarquee from '../components/ImageMarquee';
import CommonProblems from '../components/MediumBusiness/CommonProblems';
import CTA from '../components/MediumBusiness/CTA';
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
      <Testimonials />
      <FAQsAltCenter />
      <ImageMarquee />
      <CTA
        src={CTABg}
        srcMobile={CTABgMobile}
        textTop="Your Team’s Meals"
        textMiddleNode={
          <>
            Ready to Upgrade Your <br /> Office Lunch Experience?
          </>
        }
        textBottom="Let PITO help you manage lunch for 100–300 employees without the need for an in-house kitchen or manual coordination."
      />
    </div>
  );
};

export default MediumBusiness;
