import CTABg from '../assets/CTABg2.png';
import CTABgMobile from '../assets/CTABg2-2.png';
import FAQsAlt from '../components/FAQsAlt';
import ImageMarquee from '../components/ImageMarquee';
import CTA from '../components/MediumBusiness/CTA';
import CommonProblems from '../components/SmallBusiness/CommonProblems';
import Hero from '../components/SmallBusiness/Hero';
import HowItWorks from '../components/SmallBusiness/HowItWorks';
import WhyChoosePito from '../components/SmallBusiness/WhyChoosePito';
import Testimonials from '../components/Testimonials';
import TrustedCompanies from '../components/TrustedCompanies';

const SmallBusiness = () => {
  return (
    <div>
      <Hero />
      <TrustedCompanies />
      <CommonProblems />
      <HowItWorks />
      <div className="py-16">
        <ImageMarquee />
      </div>
      <WhyChoosePito />
      <Testimonials />
      <FAQsAlt />
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

export default SmallBusiness;
