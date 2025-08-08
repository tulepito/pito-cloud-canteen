import CTABg from '../assets/offshore/CTABg.webp';
import CTABgMobile from '../assets/offshore/CTABgMobile.webp';
import FAQ from '../components/Admin/FAQ';
import TestimonialsEmployee from '../components/Employee/Testimonial';
import Benefit from '../components/OffShore/Benefit';
import Built from '../components/OffShore/Built';
import CTA from '../components/OffShore/CTA';
import Hero from '../components/OffShore/Hero';
import HowItWorks from '../components/OffShore/HowItWork';
import Testimonials from '../components/StartUp/Testimonial';
import SingleTestimonial from '../components/TechService/SingleTestimonial';
import TrustedCompanies from '../components/TrustedCompanies/index';

import 'lenis/dist/lenis.css';

const Employee = () => {
  return (
    <div>
      <Hero />
      <div className="max-w-[1280px] mx-auto md:mb-32 mb-20">
        <TrustedCompanies />
      </div>
      <Built />
      <Benefit />
      <div className="hidden md:block">
        <SingleTestimonial />
      </div>
      <div className="block md:hidden">
        <TestimonialsEmployee />
      </div>
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <CTA
        src={CTABg}
        srcMobile={CTABgMobile}
        textTop="One platform. Zero chaos. Meals that just work — shift after shift."
        textMiddleNode={
          <>
            Let your team deliver. <br /> We&apos;ll take care of lunch.
          </>
        }
      />
    </div>
  );
};

export default Employee;
