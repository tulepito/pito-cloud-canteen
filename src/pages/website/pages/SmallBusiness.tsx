import FAQsAlt from '../components/FAQsAlt';
import ImageMarquee from '../components/ImageMarquee';
import CommonProblems from '../components/SmallBusiness/CommonProblems';
import CTASection from '../components/SmallBusiness/CTASection';
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
      <ImageMarquee className="!mb-0 py-[64px] md:py-16" />
      <WhyChoosePito />
      <Testimonials />
      <FAQsAlt />
      <CTASection />
    </div>
  );
};

export default SmallBusiness;
