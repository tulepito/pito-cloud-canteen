import Daily from '../components/Admin/Daily';
import Difference from '../components/Admin/Difference';
import FAQ from '../components/Admin/FAQ';
import Feature from '../components/Admin/Feature';
import Hero from '../components/Admin/Hero';
import HowItWorks from '../components/Admin/HowItWorks';
import Numbers from '../components/Admin/Numbers';
import Ready from '../components/Admin/Ready';
import Testimonials from '../components/Admin/Testimonial';
import TrustedCompanies from '../components/TrustedCompanies/index';

import 'lenis/dist/lenis.css';

const Admin = () => {
  return (
    <div>
      <Hero />
      <div className="max-w-[1280px] mx-auto">
        <TrustedCompanies />
      </div>
      <Numbers />
      <Daily />
      <Feature />
      <Difference />
      <Testimonials />
      <HowItWorks />
      <FAQ />
      <Ready />
    </div>
  );
};

export default Admin;
