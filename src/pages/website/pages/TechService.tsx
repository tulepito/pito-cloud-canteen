import CTABg from '../assets/tech/CTABg.webp';
import CTABgMobile from '../assets/tech/CTABgMobile.webp';
import FAQ from '../components/Admin/FAQ';
import TestimonialsEmployee from '../components/Employee/Testimonial';
import SingleTestimonial from '../components/SingleTestimonial';
import Testimonials from '../components/StartUp/Testimonial';
import CTA from '../components/TechService/CTA';
import Hero from '../components/TechService/Hero';
import HowItWorks from '../components/TechService/HowItWork';
import Stability from '../components/TechService/Stability';
import What from '../components/TechService/What';
import Why from '../components/TechService/Why';
import TrustedCompanies from '../components/TrustedCompanies/index';

import 'lenis/dist/lenis.css';

const TechService = () => {
  return (
    <div>
      <Hero />
      <div className="max-w-[1280px] mx-auto md:mb-0 mb-20">
        <TrustedCompanies />
      </div>
      <Stability />
      <What />
      <div className="hidden md:block">
        <SingleTestimonial />
      </div>
      <div className="block md:hidden">
        <TestimonialsEmployee />
      </div>
      <HowItWorks />
      <Why />
      <Testimonials />
      <FAQ />
      <CTA
        src={CTABg}
        srcMobile={CTABgMobile}
        textTop="Keep your team focused on what matters"
        textMiddleNode={
          <>
            Stop losing time over lunch. <br className="hidden md:block" />{' '}
            Start delivering better with <br className="hidden md:block" /> PITO
            Cloud Canteen.
          </>
        }
      />
    </div>
  );
};

export default TechService;
