import { NextSeo } from 'next-seo';
import { useIntl } from 'react-intl';

import configs from '../../configs';

type TMetaProps = {
  title?: string;
  description?: string;
  canonical?: string;
  imageUrl?: string;
};
const Meta: React.FC<TMetaProps> = (props) => {
  const intl = useIntl();
  const {
    title = intl.formatMessage({ id: 'Meta.defaultTitle' }),
    description = intl.formatMessage({ id: 'Meta.defaultDescription' }),
    canonical,
    imageUrl,
  } = props;

  return (
    <NextSeo
      title={title}
      description={description}
      canonical={canonical}
      openGraph={{
        title,
        description,
        url: canonical,
        locale: configs.locale,
        siteName: configs.siteTitle,
        images: [
          {
            url: imageUrl as string,
            alt: 'PITO Cloud Canteen',
            type: 'image/jpeg',
          },
        ],
      }}
    />
  );
};

export default Meta;
