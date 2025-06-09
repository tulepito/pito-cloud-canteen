import CTA from '../components/CTA';
import FAQs from '../components/FAQs';
import Features from '../components/Features';
import Hero from '../components/Home/Hero';
import ServicesImages from '../components/ServicesImages';
import Solutions from '../components/Solutions';
import Testimonials from '../components/Testimonials';
import TrustedCompanies from '../components/TrustedCompanies/index';

import 'lenis/dist/lenis.css';

const Home = () => {
  return (
    <div>
      <Hero />
      <TrustedCompanies />
      <Features />
      <Testimonials />
      <Solutions />
      <FAQs />
      <CTA />
      <ServicesImages />
    </div>
  );
};

export default Home;
