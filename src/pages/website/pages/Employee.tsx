import Change from '../components/Employee/Change';
import Experience from '../components/Employee/Experience';
import Hero from '../components/Employee/Hero';
import Testimonials from '../components/Employee/Testimonial';
import Tired from '../components/Employee/Tired';
import Want from '../components/Employee/Want';
import TrustedCompanies from '../components/TrustedCompanies/index';

import 'lenis/dist/lenis.css';

const Employee = () => {
  return (
    <div>
      <Hero />
      <div className="md:mb-0 mb-20">
        <TrustedCompanies />
      </div>
      <Tired />
      <Experience />
      <Testimonials />
      <Change />
      <Want />
    </div>
  );
};

export default Employee;
