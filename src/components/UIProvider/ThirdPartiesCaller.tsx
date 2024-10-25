import { useEffect } from 'react';

import Tracker from '@helpers/tracker';

const ThirdPartiesCaller = () => {
  /**
   * Initialize tracker
   */
  useEffect(() => {
    Tracker.init();
  }, []);

  return null;
};

export default ThirdPartiesCaller;
