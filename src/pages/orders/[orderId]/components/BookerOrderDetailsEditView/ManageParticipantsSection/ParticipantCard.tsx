import IconCheckWithBackground from '@components/Icons/IconCheckWithBackground/IconCheckWithBackground';
import IconClose from '@components/Icons/IconClose/IconClose';
import { shortenString } from '@utils/string';
import type { TDefaultProps } from '@utils/types';
import classNames from 'classnames';
import React from 'react';

import css from './ParticipantCard.module.scss';

const DEFAULT_AVATAR_PATH = '/images/default_avatar.png';
const MAXLENGTH_NAME = 26;
const MAXLENGTH_EMAIL = 30;

type TParticipantCardProps = TDefaultProps & {
  avatar?: any;
  hasCheckIcon?: boolean;
  name?: string;
  email?: string;
  onClickDeleteIcon: () => void;
};

const ParticipantCard: React.FC<TParticipantCardProps> = (props) => {
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

  const formattedName = shortenString(name, MAXLENGTH_NAME);
  const formattedEmail = shortenString(email, MAXLENGTH_EMAIL);

  return (
    <div className={rootClasses}>
      <div className={css.avatarContainer}>
        <img src={avatar} alt="Avatar" className={css.avatar} />
        {hasCheckIcon && <IconCheckWithBackground className={css.checkIcon} />}
      </div>
      <div className={css.infoContainer}>
        <div title={name}>{formattedName}</div>
        <div title={email}>{formattedEmail}</div>
      </div>
      <div className={css.closeIconContainer} onClick={onClickDeleteIcon}>
        <IconClose className={css.closeIcon} />
      </div>
    </div>
  );
};

export default ParticipantCard;
