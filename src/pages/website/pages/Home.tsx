import pitoAsset1 from '../assets/pitoAssets/1.webp';
import pitoAsset2 from '../assets/pitoAssets/2.webp';
import pitoAsset3 from '../assets/pitoAssets/3.webp';
import pitoAsset4 from '../assets/pitoAssets/4.webp';
import pitoAsset5 from '../assets/pitoAssets/5.webp';
import pitoAsset6 from '../assets/pitoAssets/6.webp';
import CTA from '../components/CTA';
import FAQs from '../components/FAQs';
import Features from '../components/Features';
import Hero from '../components/Home/Hero';
import ServicesImages from '../components/ServicesImages';
import Solutions from '../components/Solutions';
import Testimonials from '../components/Testimonials';
import TrustedCompanies from '../components/TrustedCompanies/index';

import 'lenis/dist/lenis.css';

const images = [
  pitoAsset1,
  pitoAsset2,
  pitoAsset3,
  pitoAsset4,
  pitoAsset5,
  pitoAsset6,
];

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
      <ServicesImages images={images} />
    </div>
  );
};

export default Home;
