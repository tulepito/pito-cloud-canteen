import { NextSeo } from 'next-seo';

import configs from '../../configs';

type TMetaProps = {
  title: string;
  description: string;
  canonical?: string;
  imageUrl?: string;
};
const Meta = (props: TMetaProps) => {
  const { title, description, canonical, imageUrl } = props;
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
            url:
              imageUrl ||
              `${process.env.NEXT_PUBLIC_CANONICAL_URL}/static/images/journeyh.png`,
            width: 900,
            height: 800,
            alt: 'Journey Horizon',
            type: 'image/jpeg',
          },
        ],
      }}
    />
  );
};

export default Meta;
