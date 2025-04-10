import React from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import Link from 'next/link';

import IconBannedUser from '@components/Icons/IconBannedUser/IconBannedUser';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import type { UserListing } from '@src/types';
import {
  ensureCurrentUser,
  ensureUser,
  userAbbreviatedName,
  userDisplayNameAsString,
} from '@utils/data';
import { EImageVariants } from '@utils/enums';
import type { TCurrentUser, TDefaultProps, TUser } from '@utils/types';

import css from './Avatar.module.scss';

// Responsive image sizes hint
const AVATAR_SIZES_MEDIUM = '60px';
const AVATAR_SIZES_LARGE = '96px';

const AVATAR_IMAGE_VARIANTS = [
  // 40x40
  EImageVariants.squareXsSmall,

  // 80x80
  EImageVariants.squareXsSmall2x,

  // 240x240
  EImageVariants.squareSmall,

  // 480x480
  EImageVariants.squareSmall2x,

  // default
  EImageVariants.default,
];

type TAvatarProps = TDefaultProps & {
  initialsClassName?: string;
  user: TCurrentUser | TUser | UserListing;
  renderSizes?: string;
  disableProfileLink?: boolean;
};

const Avatar: React.FC<TAvatarProps> = (props) => {
  const {
    rootClassName,
    className,
    initialsClassName,
    user,
    renderSizes,
    disableProfileLink,
  } = props;
  const intl = useIntl();

  const userIsCurrentUser = user && user.type === 'currentUser';
  const avatarUser = userIsCurrentUser
    ? ensureCurrentUser(user)
    : ensureUser(user);

  const isBannedUser = avatarUser.attributes.banned;
  const isDeletedUser = avatarUser.attributes.deleted;

  const bannedUserDisplayName = intl.formatMessage({
    id: 'Avatar.bannedUserDisplayName',
  });

  const deletedUserDisplayName = intl.formatMessage({
    id: 'Avatar.deletedUserDisplayName',
  });

  const defaultUserDisplayNameFn = () => {
    if (isBannedUser) return bannedUserDisplayName;
    if (isDeletedUser) return deletedUserDisplayName;

    return '';
  };

  const defaultUserDisplayName = defaultUserDisplayNameFn();

  const defaultUserAbbreviatedName = '';

  const displayName = userDisplayNameAsString(
    avatarUser,
    defaultUserDisplayName,
  );
  const abbreviatedName = userAbbreviatedName(
    avatarUser,
    defaultUserAbbreviatedName,
  );

  const hasProfileImage = avatarUser.profileImage && avatarUser.profileImage.id;
  const profileLinkEnabled = !disableProfileLink;

  const classForInitials = initialsClassName || css.initials;
  const classes = classNames(
    rootClassName || css.root,
    { [css.hasProfileImage]: hasProfileImage !== null },
    className,
  );
  const rootProps = { className: classes, title: displayName };
  const linkProps = avatarUser.id
    ? { href: 'ProfilePage', params: { id: avatarUser.id.uuid } }
    : { href: 'ProfileBasePage' };

  if (isBannedUser || isDeletedUser) {
    return (
      <div {...rootProps}>
        <IconBannedUser className={css.bannedUserIcon} />
      </div>
    );
  }
  if (hasProfileImage && profileLinkEnabled) {
    return (
      <Link {...rootProps} {...linkProps}>
        <ResponsiveImage
          rootClassName={css.avatarImage}
          alt={displayName}
          image={avatarUser.profileImage}
          variants={AVATAR_IMAGE_VARIANTS}
          sizes={renderSizes}
        />
      </Link>
    );
  }
  if (hasProfileImage) {
    return (
      <div {...rootProps}>
        <ResponsiveImage
          rootClassName={css.avatarImage}
          alt={displayName}
          image={avatarUser.profileImage}
          variants={AVATAR_IMAGE_VARIANTS}
          sizes={renderSizes}
        />
      </div>
    );
  }
  if (profileLinkEnabled) {
    // Placeholder avatar (initials)
    return (
      <Link {...rootProps} {...linkProps}>
        <span className={classForInitials}>{abbreviatedName}</span>
      </Link>
    );
  }

  // Placeholder avatar (initials)
  return (
    <div {...rootProps}>
      <span className={classForInitials}>{abbreviatedName}</span>
    </div>
  );
};

export default Avatar;

export const AvatarMedium: React.FC<TAvatarProps> = (props) => (
  <Avatar
    rootClassName={css.mediumAvatar}
    renderSizes={AVATAR_SIZES_MEDIUM}
    {...props}
  />
);

AvatarMedium.displayName = 'AvatarMedium';

export const AvatarLarge: React.FC<TAvatarProps> = (props) => (
  <Avatar
    rootClassName={css.largeAvatar}
    renderSizes={AVATAR_SIZES_LARGE}
    {...props}
  />
);

AvatarLarge.displayName = 'AvatarLarge';
