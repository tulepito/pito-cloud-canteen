import { useAppSelector } from '@hooks/reduxHooks';
import Joyride from 'react-joyride';

type TWalkthroughProps = {};

const Walkthrough: React.FC<TWalkthroughProps> = () => {
  const steps = useAppSelector((state) => state.walkthrough.steps);
  const runState = useAppSelector((state) => state.walkthrough.run);

  return <Joyride steps={steps} continuous run={runState} />;
};

export default Walkthrough;
