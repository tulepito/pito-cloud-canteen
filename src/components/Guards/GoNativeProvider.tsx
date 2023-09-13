/* eslint-disable @typescript-eslint/naming-convention */
import { type PropsWithChildren, useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { currentUserSelector, userThunks } from '@redux/slices/user.slice';
import { gonative } from '@src/assets/GoNativeJSBridgeLibrary';

interface CWindow extends Window {
  gonative_onesignal_info?: any;
}

declare let window: CWindow;

type TGoNativeProvider = PropsWithChildren<{}>;

const GoNativeProvider: React.FC<TGoNativeProvider> = ({ children }) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(currentUserSelector);
  useEffect(() => {
    function gonative_onesignal_info(oneSignalInfo: any) {
      window.sessionStorage.setItem(
        'oneSignalInfo2',
        oneSignalInfo.oneSignalUserId,
      );
      if (!currentUser) return;
      dispatch(
        userThunks.updateProfile({
          privateData: {
            oneSignalUserId: oneSignalInfo.oneSignalUserId,
            oneSignalPushToken: oneSignalInfo.oneSignalPushToken,
          },
        }),
      );
    }
    window.gonative_onesignal_info = gonative_onesignal_info;
    gonative.onesignal.run.onesignalInfo();
  }, [currentUser, dispatch]);

  return <>{children}</>;
};

export default GoNativeProvider;
