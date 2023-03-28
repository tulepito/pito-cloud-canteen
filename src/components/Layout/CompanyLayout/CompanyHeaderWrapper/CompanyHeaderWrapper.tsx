import type { ReactNode } from 'react';
import React from 'react';

import FeaturesHeader from '@components/FeaturesHeader/FeaturesHeader';
import { useViewport } from '@hooks/useViewport';
import type { TObject } from '@src/utils/types';

import CompanyHeader from '../CompanyHeader/CompanyHeader';
import CompanyHeaderMobile from '../CompanyHeaderMobile/CompanyHeaderMobile';

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

  const { isMobileLayout, isTabletLayout } = useViewport();

  return (
    <div className={css.root}>
      {isMobileLayout || isTabletLayout ? (
        <CompanyHeaderMobile
          companyHeaderLinkData={companyHeaderLinkData}
          headerData={featureHeaderData}
          companyId={companyId}
        />
      ) : (
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
      )}
    </div>
  );
};

export default CompanyHeaderWrapper;
