import FeaturesCard from './FeaturesCard';
import TeamRoles from './TeamRoles';
import WhyChooseUs from './WhyChooseUs';

const Features = () => {
  return (
    <div className="px-5 py-16 md:px-4">
      <FeaturesCard />
      <WhyChooseUs />
      <TeamRoles />
    </div>
  );
};

export default Features;
