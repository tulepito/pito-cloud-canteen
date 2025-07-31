import { type PropsWithChildren } from 'react';
import { useIntl } from 'react-intl';

import type { TMetaProps } from '@components/Layout/Meta';
import Meta from '@components/Layout/Meta';

type TMetaWrapperProps = PropsWithChildren<
  TMetaProps & {
    routeName?: string;
    titleId?: string;
    title?: string;
    descriptionId?: string;
    description?: string;
  }
>;

const MetaWrapper: React.FC<TMetaWrapperProps> = ({
  routeName,
  children,
  title,
  titleId,
  description,
  descriptionId,
  ...props
}) => {
  const intl = useIntl();

  const metaProps = {
    title:
      title ||
      (titleId &&
        intl.formatMessage({
          id: titleId,
        })) ||
      (routeName &&
        intl.formatMessage({
          id: `${routeName}.title`,
        })),
    description:
      description ||
      (descriptionId &&
        intl.formatMessage({
          id: descriptionId,
        })) ||
      (routeName &&
        intl.formatMessage({
          id: `${routeName}.description`,
        })),
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
    ...props,
  };

  return (
    <>
      <Meta {...metaProps} />
      {children}
    </>
  );
};

export default MetaWrapper;
