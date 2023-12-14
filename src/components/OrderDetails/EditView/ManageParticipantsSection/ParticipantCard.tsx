import React from 'react';
import classNames from 'classnames';

import Avatar from '@components/Avatar/Avatar';
import IconCheckWithBackground from '@components/Icons/IconCheckWithBackground/IconCheckWithBackground';
import IconClose from '@components/Icons/IconClose/IconClose';
import { shortenString } from '@utils/string';
import type { TDefaultProps, TUser } from '@utils/types';

import css from './ParticipantCard.module.scss';

const DEFAULT_AVATAR_PATH = '/images/defaultAvatar_small.png';
const MAXLENGTH_NAME = 26;
const MAXLENGTH_EMAIL = 26;

type TParticipantCardProps = TDefaultProps & {
  avatar?: any;
  hasCheckIcon?: boolean;
  hasDeleteIcon?: boolean;
  name?: string;
  email?: string;
  participant?: TUser;
  onClickDeleteIcon?: () => void;
  ableToRemove?: boolean;
};

const ParticipantCard: React.FC<TParticipantCardProps> = (props) => {
  const {
    rootClassName,
    className,
    avatar = DEFAULT_AVATAR_PATH,
    name = 'Chờ xác thực',
    email = 'email@pito.com',
    onClickDeleteIcon,
    hasDeleteIcon = true,
    hasCheckIcon,
    participant,
    ableToRemove,
  } = props;
  const rootClasses = classNames(rootClassName || css.root, className);

  const formattedName = shortenString(name, MAXLENGTH_NAME);
  const formattedEmail = shortenString(email, MAXLENGTH_EMAIL);

  return (
    <div className={rootClasses}>
      <div className={css.avatarContainer}>
        {participant ? (
          <Avatar
            disableProfileLink
            user={participant}
            className={css.avatar}
          />
        ) : (
          <img src={avatar} alt="Avatar" className={css.avatar} />
        )}

        {hasCheckIcon && <IconCheckWithBackground className={css.checkIcon} />}
      </div>
      <div className={css.infoContainer}>
        <div title={name}>{formattedName}</div>
        <div title={email}>{formattedEmail}</div>
      </div>
      {hasDeleteIcon && ableToRemove && (
        <div className={css.closeIconContainer} onClick={onClickDeleteIcon}>
          <IconClose className={css.closeIcon} />
        </div>
      )}
    </div>
  );
};

export default ParticipantCard;
