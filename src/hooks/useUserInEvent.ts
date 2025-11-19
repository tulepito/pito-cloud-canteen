import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';

import { getEmailsApi } from '@apis/participantApi';
import { User } from '@src/utils/data';
import { HttpStatus } from '@src/utils/response';

import { useAppSelector } from './reduxHooks';

export const useUserInEvent = () => {
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const userEmail = User(currentUser!).getAttributes().email;
  const [isUserInEvent, setIsUserInEvent] = useState(false);

  useEffect(() => {
    if (!userEmail) return;

    const controller = new AbortController();

    const checkUserInEvent = async () => {
      const now = DateTime.now().setZone('Asia/Ho_Chi_Minh');
      const eventDate = DateTime.fromISO('2025-11-19', {
        zone: 'Asia/Ho_Chi_Minh',
      });
      const eventStartDate = eventDate.startOf('day');
      const eventEndDate = eventDate.endOf('month');

      if (now < eventStartDate || now > eventEndDate) {
        setIsUserInEvent(false);

        return;
      }

      try {
        const response = await getEmailsApi({ signal: controller.signal });

        if (response.status === HttpStatus.OK) {
          const emails = response.data?.data || [];
          const emailsInLowerCase = emails.map((email) => email.toLowerCase());
          setIsUserInEvent(emailsInLowerCase.includes(userEmail.toLowerCase()));
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('Error in checkUserInEvent:', err);
        setIsUserInEvent(false);
      }
    };

    checkUserInEvent();

    return () => {
      controller.abort();
    };
  }, [userEmail]);

  return {
    isUserInEvent,
    setIsUserInEvent,
  };
};
