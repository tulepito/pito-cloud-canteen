import { useCallback, useEffect, useState } from 'react';

const useBoolean = (defaultValue = false) => {
  const [value, setValue] = useState<boolean>(defaultValue);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => {
    return setValue(false);
  }, []);
  const toggle = useCallback(() => setValue((x) => !x), []);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return { value, setValue, setTrue, setFalse, toggle };
};

export default useBoolean;
