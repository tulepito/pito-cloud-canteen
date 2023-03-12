/**
 * Promised component makes it easier to render content that
 * depends on resolution of a Promise.
 *
 * How to use:
 * <Promised promise={givenPromise} renderFulfilled={v => <b>{v}</b>} renderRejected={v => <b>v</b>} />
 */

/* eslint-disable no-underscore-dangle */
import { useEffect, useState } from 'react';

import useBoolean from '@hooks/useBoolean';

type TPromised = {
  promise: Promise<any>;
  renderFulfilled: (e: any) => void;
  renderRejected: (e: any) => void;
};

const Promised: React.FC<TPromised | any> = (props) => {
  const { promise, renderFulfilled, renderRejected } = props;
  const { value: mounted, setValue: setMounted } = useBoolean(false);
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    if (!promise) return;
    promise
      .then((e: any) => {
        if (mounted) {
          setValue(e);
        }
      })
      .catch((e: any) => {
        if (mounted) {
          setError(e);
        }
      });

    return () => setMounted(false);
  }, [promise]);

  return error ? renderRejected(error) : renderFulfilled(value);
};

export default Promised;
