import IconCheckWithBackground from '@components/Icons/IconCheckWithBackground/IconCheckWithBackground';
import IconClose from '@components/Icons/IconClose/IconClose';
import classNames from 'classnames';
import React from 'react';

import css from './BookerOrderDetailsParticipantCard.module.scss';

const DEFAULT_AVATAR_PATH = '/images/default_avatar.png';

type BookerOrderDetailsParticipantCardProps = {
  className?: string;
  rootClassName?: string;
  avatar?: any;
  hasCheckIcon?: boolean;
  name?: string;
  email?: string;
  onClickDeleteIcon: (id: string) => () => void;
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
        <div>{name}</div>
        <div>{email}</div>
      </div>
      <div
        className={css.closeIconContainer}
        onClick={onClickDeleteIcon('delete')}>
        <IconClose className={css.closeIcon} />
      </div>
    </div>
  );
};

export default BookerOrderDetailsParticipantCard;
