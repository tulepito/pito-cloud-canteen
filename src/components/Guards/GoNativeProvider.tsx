/* eslint-disable @typescript-eslint/naming-convention */
import { type PropsWithChildren, useEffect } from 'react';
import { uniq } from 'lodash';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { currentUserSelector, userThunks } from '@redux/slices/user.slice';
import { gonative } from '@src/assets/GoNativeJSBridgeLibrary';
import { CurrentUser } from '@src/utils/data';

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
        'oneSignalInfo',
        oneSignalInfo.oneSignalUserId,
      );
      if (!currentUser) return;
      const currentUserGetter = CurrentUser(currentUser);
      const { oneSignalUserIds = [] } = currentUserGetter.getPrivateData();
      dispatch(
        userThunks.updateProfile({
          privateData: {
            oneSignalUserIds: uniq([
              ...oneSignalUserIds,
              oneSignalInfo.oneSignalUserId,
            ]),
          },
        }),
      );
    }
    window.gonative_onesignal_info = gonative_onesignal_info;
    if (currentUser && !currentUser.privateData?.oneSignalUserId) {
      gonative.onesignal.run.onesignalInfo();
    }
  }, [currentUser, dispatch]);

  return <>{children}</>;
};

export default GoNativeProvider;
