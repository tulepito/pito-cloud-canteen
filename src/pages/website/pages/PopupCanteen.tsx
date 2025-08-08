import pitoAsset1 from '../assets/pitoAssets/3.webp';
import pitoAsset5 from '../assets/pitoAssets/11.png';
import pitoAsset6 from '../assets/pitoAssets/12.png';
import pitoAsset2 from '../assets/pitoAssets/pito-cloud-canteen-popup-canteen-1.webp';
import pitoAsset3 from '../assets/pitoAssets/pito-cloud-canteen-popup-canteen-2.webp';
import pitoAsset4 from '../assets/pitoAssets/pito-cloud-canteen-popup-canteen-3.webp';
import CTA from '../components/Cafeteria/CTA';
import Hero from '../components/Cafeteria/Hero';
import HighlightedFeaturesCard from '../components/Cafeteria/HighlightedFeaturesCard';
import HowItWorksDynamicCard from '../components/Cafeteria/HowItWorksDynamicCard';
import { FAQsAltCenter } from '../components/FAQsAlt';
import ServicesImages from '../components/ServicesImages';
// import SimplifyOrdering from '../components/SimplifyOrdering';
import SingleTestimonial from '../components/SingleTestimonial';
import Testimonials from '../components/Testimonials';
import TrustedCompanies from '../components/TrustedCompanies';

const images = [
  pitoAsset1,
  pitoAsset2,
  pitoAsset3,
  pitoAsset4,
  pitoAsset5,
  pitoAsset6,
];

const PopupCanteen = () => {
  return (
    <div>
      <Hero />
      <TrustedCompanies />
      <HowItWorksDynamicCard />
      <HighlightedFeaturesCard />
      <SingleTestimonial />
      {/* <SimplifyOrdering /> */}
      <Testimonials />
      <FAQsAltCenter />
      <CTA />
      <ServicesImages images={images} />
    </div>
  );
};

export default PopupCanteen;
