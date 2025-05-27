import FeaturesCard from './FeaturesCard';
import TeamRoles from './TeamRoles';
import WhyChooseUs from './WhyChooseUs';

const Features = () => {
  return (
    <div className="md:p-20 px-2 pt-16 md:px-4">
      <FeaturesCard />
      <WhyChooseUs />
      <TeamRoles />
    </div>
  );
};

export default Features;
