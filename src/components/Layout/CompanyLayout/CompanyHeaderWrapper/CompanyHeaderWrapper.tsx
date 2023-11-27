import type { ReactNode } from 'react';
import React from 'react';
import { useRouter } from 'next/router';

import FeaturesHeader from '@components/FeaturesHeader/FeaturesHeader';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useViewport } from '@hooks/useViewport';
import type { TObject } from '@src/utils/types';

import CompanyHeader from '../CompanyHeader/CompanyHeader';
import CompanyHeaderMobile from '../CompanyHeaderMobile/CompanyHeaderMobile';
import { shouldShowMobileCompanyHeader } from '../companyLayout.helpers';

import css from './CompanyHeaderWrapper.module.scss';

type TCompanyHeaderWrapperProps = {
  showFeatureHeader: boolean;
  companyHeaderLinkData: {
    key: string;
    path: string;
    label: string | ReactNode;
  }[];
  featureHeaderData: {
    key: string;
    title: ReactNode;
    pathname: string;
    query?: TObject;
  }[];
  companyId: string;
};

const CompanyHeaderWrapper: React.FC<TCompanyHeaderWrapperProps> = (props) => {
  const {
    showFeatureHeader,
    companyHeaderLinkData,
    featureHeaderData,
    companyId,
  } = props;

  const { pathname } = useRouter();
  const { isMobileLayout, isTabletLayout } = useViewport();

  const shouldShowMobileHeaderLayout = isMobileLayout || isTabletLayout;

  return (
    <div className={css.root}>
      <RenderWhen condition={shouldShowMobileHeaderLayout}>
        <RenderWhen condition={shouldShowMobileCompanyHeader(pathname)}>
          <CompanyHeaderMobile
            companyHeaderLinkData={companyHeaderLinkData}
            headerData={featureHeaderData}
            companyId={companyId}
          />
        </RenderWhen>
        <RenderWhen.False>
          <div className={css.desktopHeader}>
            <CompanyHeader
              companyId={companyId}
              showBottomLine={!showFeatureHeader}
              companyHeaderLinkData={companyHeaderLinkData}
            />
            {showFeatureHeader && (
              <FeaturesHeader headerData={featureHeaderData} />
            )}
          </div>
        </RenderWhen.False>
      </RenderWhen>
    </div>
  );
};

export default CompanyHeaderWrapper;
