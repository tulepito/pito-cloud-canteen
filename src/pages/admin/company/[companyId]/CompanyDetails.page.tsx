import React from 'react';

import AdminRatingSection from '../components/AdminRatingSection/AdminRatingSection';

import css from './CompanyDetails.module.scss';

const CompanyDetailsPage = () => {
  return (
    <div className={css.root}>
      <AdminRatingSection />
    </div>
  );
};

export default CompanyDetailsPage;
