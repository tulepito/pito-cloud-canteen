import IconCheckWithBackground from '@components/Icons/IconCheckWithBackground/IconCheckWithBackground';
import IconClose from '@components/Icons/IconClose/IconClose';
import { shortenString } from '@utils/string';
import classNames from 'classnames';
import React from 'react';

import css from './BookerOrderDetailsParticipantCard.module.scss';

const DEFAULT_AVATAR_PATH = '/images/default_avatar.png';
const MAXLENGTH_NAME = 26;
const MAXLENGTH_EMAIL = 30;

type BookerOrderDetailsParticipantCardProps = {
  className?: string;
  rootClassName?: string;
  avatar?: any;
  hasCheckIcon?: boolean;
  name?: string;
  email?: string;
  onClickDeleteIcon: () => void;
};

const BookerOrderDetailsParticipantCard: React.FC<
  BookerOrderDetailsParticipantCardProps
> = (props) => {
  const {
    rootClassName,
    className,
    avatar = DEFAULT_AVATAR_PATH,
    name = 'Demo participant',
    email = 'xyzasd1234@gmail.com',
    onClickDeleteIcon,
    hasCheckIcon,
  } = props;
  const rootClasses = classNames(rootClassName || css.root, className);

  return (
    <div className={rootClasses}>
      <div className={css.avatarContainer}>
        <img src={avatar} alt="Avatar" className={css.avatar} />
        {hasCheckIcon && <IconCheckWithBackground className={css.checkIcon} />}
      </div>
      <div className={css.infoContainer}>
        <div title={name}>{shortenString(name, MAXLENGTH_NAME)}</div>
        <div title={email}>{shortenString(email, MAXLENGTH_EMAIL)}</div>
      </div>
      <div className={css.closeIconContainer} onClick={onClickDeleteIcon}>
        <IconClose className={css.closeIcon} />
      </div>
    </div>
  );
};

export default BookerOrderDetailsParticipantCard;
