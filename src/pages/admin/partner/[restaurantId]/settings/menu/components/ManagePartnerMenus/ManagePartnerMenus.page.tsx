import Button from '@components/Button/Button';
import AlertModal from '@components/Modal/AlertModal';
import type { TSecondaryKeywordSearchFormValues } from '@components/SecondaryKeywordSearchForm/SecondaryKeywordSearchForm';
import SecondaryKeywordSearchForm from '@components/SecondaryKeywordSearchForm/SecondaryKeywordSearchForm';
import { adminRoutes } from '@src/paths';
import { EMenuTypes } from '@utils/enums';
import type { FormApi } from 'final-form';
import { useRouter } from 'next/router';
import React, { useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import type { TCreateMenuOptionFormValues } from '../CreateMenuOptionForm/CreateMenuOptionForm';
import CreateMenuOptionForm from '../CreateMenuOptionForm/CreateMenuOptionForm';
import ManagePartnerMenusContent from '../ManagePartnerMenusContent/ManagePartnerMenusContent';
import css from './ManagePartnerMenus.module.scss';

type TManagePartnerMenusPageProps = {
  menuType: typeof EMenuTypes.cycleMenu | typeof EMenuTypes.fixedMenu;
};

const ManagePartnerMenusPage: React.FC<TManagePartnerMenusPageProps> = (
  props,
) => {
  const { menuType } = props;
  const isFixedMenu = menuType === EMenuTypes.fixedMenu;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const router = useRouter();
  const formRef = useRef<FormApi>();
  const { restaurantId, keywords = '', page = 1 } = router.query;

  const onSubmit = ({
    keywords: newKeywords,
  }: TSecondaryKeywordSearchFormValues) => {
    router.push({
      pathname: isFixedMenu
        ? adminRoutes.ManagePartnerFixedMenus.path
        : adminRoutes.ManagePartnerCycleMenus.path,
      query: { ...router.query, keywords: newKeywords },
    });
  };

  const handleSubmitCreateOptionForm = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const onSubmitCreateOptionForm = (values: TCreateMenuOptionFormValues) => {
    const { createOption, duplicateId } = values;
    setIsCreateModalOpen(false);
    if (createOption === 'create') {
      return router.push({
        pathname: adminRoutes.CreatePartnerMenu.path,
        query: { restaurantId },
      });
    }

    if (duplicateId) {
      return router.push({
        pathname: `${adminRoutes.CreatePartnerMenu.path}`,
        query: { restaurantId, duplicateId },
      });
    }
  };

  return (
    <div className={css.root}>
      <div className={css.pageHeader}>
        <h1 className={css.title}>
          <FormattedMessage
            id={
              !isFixedMenu
                ? 'ManagePartnerMenusPage.cycleMenuTitle'
                : 'ManagePartnerMenusPage.fixedMenuTitle'
            }
          />
        </h1>
        <SecondaryKeywordSearchForm
          initialValues={{ keywords: keywords as string }}
          onSubmit={onSubmit}
        />
      </div>
      <Button
        onClick={() => setIsCreateModalOpen(true)}
        className={css.addButton}
        type="button">
        <FormattedMessage id="ManagePartnerMenu.createTitle" />
      </Button>
      <ManagePartnerMenusContent
        restaurantId={restaurantId as string}
        keywords={keywords as string}
        menuType={menuType as string}
        page={page as string}
      />
      <AlertModal
        isOpen={isCreateModalOpen}
        handleClose={() => setIsCreateModalOpen(false)}
        title={
          <h3 className={css.createTitle}>
            <FormattedMessage id="ManagePartnerMenu.createTitle" />
          </h3>
        }
        onConfirm={handleSubmitCreateOptionForm}
        onCancel={() => setIsCreateModalOpen(false)}
        confirmLabel={<FormattedMessage id="ManagePartnerMenu.createLabel" />}
        cancelLabel={<FormattedMessage id="ManagePartnerMenu.cancelLabel" />}>
        <CreateMenuOptionForm
          formRef={formRef}
          onSubmit={onSubmitCreateOptionForm}
          initialValues={{
            createOption: 'create',
          }}
        />
      </AlertModal>
    </div>
  );
};

export default ManagePartnerMenusPage;
