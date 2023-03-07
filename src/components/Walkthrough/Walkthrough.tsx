import Joyride from 'react-joyride';

import { useAppSelector } from '@hooks/reduxHooks';

type TWalkthroughProps = {};

const Walkthrough: React.FC<TWalkthroughProps> = () => {
  const steps = useAppSelector((state) => state.walkthrough.steps);
  const runState = useAppSelector((state) => state.walkthrough.run);

  return <Joyride steps={steps} continuous run={runState} />;
};

export default Walkthrough;
