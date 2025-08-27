import FAQ from '../components/Admin/FAQ';
import CTASection from '../components/StartUp/CTASection';
import Hero from '../components/StartUp/Hero';
import HowItWorks from '../components/StartUp/HowItWork';
import ReClaim from '../components/StartUp/ReClaim';
import Smart from '../components/StartUp/Smart';
import Testimonial from '../components/StartUp/Testimonial';
import What from '../components/StartUp/What';
import WhyChoose from '../components/StartUp/WhyChoose';
import TrustedCompanies from '../components/TrustedCompanies/index';

import 'lenis/dist/lenis.css';

const StartUp = () => {
  return (
    <div>
      <Hero />
      <div className="max-w-[1280px] mx-auto md:mb-0 mb-20">
        <TrustedCompanies />
      </div>
      <What />
      <Smart />
      <ReClaim />
      <Testimonial />
      <HowItWorks />
      <WhyChoose />
      <FAQ />
      <CTASection />
    </div>
  );
};

export default StartUp;
