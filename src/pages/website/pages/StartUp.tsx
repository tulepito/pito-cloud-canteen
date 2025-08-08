import CTABg from '../assets/startup/CTABg.webp';
import CTABgMobile from '../assets/startup/CTABgMobile.webp';
import FAQ from '../components/Admin/FAQ';
import CTA from '../components/StartUp/CTA';
import Hero from '../components/StartUp/Hero';
import HowItWorks from '../components/StartUp/HowItWork';
import Ready from '../components/StartUp/Ready';
import ReClaim from '../components/StartUp/ReClaim';
import Smart from '../components/StartUp/Smart';
import Testimonial from '../components/StartUp/Testimonial';
import What from '../components/StartUp/What';
import WhyChoose from '../components/StartUp/WhyChoose';
import TrustedCompanies from '../components/TrustedCompanies/index';

import 'lenis/dist/lenis.css';

const Employee = () => {
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
      <Ready />
      <HowItWorks />
      <WhyChoose />
      <FAQ />
      <CTA
        src={CTABg}
        srcMobile={CTABgMobile}
        textTop="Optimize today with PITO Cloud Canteen."
        textMiddleNode={
          <>
            Don&apos;t let lunch orders hold back{' '}
            <br className="hidden md:block" /> your team&apos;s productivity
          </>
        }
      />
    </div>
  );
};

export default Employee;
