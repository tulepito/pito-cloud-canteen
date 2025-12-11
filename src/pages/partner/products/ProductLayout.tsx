import { type PropsWithChildren, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import IconAdd from '@components/Icons/IconAdd/IconAdd';
import IconUploadFile from '@components/Icons/IconUploadFile/IconUploadFile';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { TTabsItem } from '@components/Tabs/Tabs';
import Tabs from '@components/Tabs/Tabs';
import { partnerPaths } from '@src/paths';

import css from './ProductLayout.module.scss';

type TProductLayoutProps = PropsWithChildren<{
  currentPage: string;
  handleAddProduct: () => void;
  shouldHideAddProductButton?: boolean;
  handleImportProduct?: () => void;
  shouldHideImportProductButton?: boolean;
}>;

const PRODUCT_LAYOUT_TABS = [
  { id: 'food', label: 'Món ăn' },
  { id: 'menu', label: 'Menu' },
];

const PRODUCT_LAYOUT_TAB_KEYS = {
  food: 'food',
  menu: 'menu',
};

const ProductLayout: React.FC<TProductLayoutProps> = (props) => {
  const {
    children,
    currentPage = PRODUCT_LAYOUT_TAB_KEYS.food,
    shouldHideAddProductButton = false,
    handleAddProduct,
    handleImportProduct,
    shouldHideImportProductButton = true,
  } = props;

  const router = useRouter();
  const [currentTab, setCurrentTab] = useState(currentPage);

  const isFoodManagementPage = currentPage === PRODUCT_LAYOUT_TAB_KEYS.food;

  const items = PRODUCT_LAYOUT_TABS.map(({ id, label }) => {
    return {
      label: <div>{label}</div>,
      children: <div></div>,
      id,
    };
  });

  const handleTabChanged = (params: TTabsItem) => {
    const { id = PRODUCT_LAYOUT_TAB_KEYS.food } = params || {};

    setCurrentTab(id.toString());
  };

  useEffect(() => {
    if (currentTab !== currentPage) {
      if (currentTab === PRODUCT_LAYOUT_TAB_KEYS.food) {
        router.push(partnerPaths.ManageFood);
      } else if (currentTab === PRODUCT_LAYOUT_TAB_KEYS.menu) {
        router.push(partnerPaths.ManageMenus);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab]);

  return (
    <div className={css.root}>
      <div className={css.title}>Sản phẩm</div>
      <div className={css.actionContainer}>
        <Tabs
          items={items}
          headerClassName={css.tabHeaders}
          defaultActiveKey={isFoodManagementPage ? '1' : '2'}
          onChange={handleTabChanged}
        />

        <div className="flex items-center gap-2">
          <RenderWhen condition={!shouldHideImportProductButton}>
            <Button
              type="button"
              variant="secondary"
              className={css.lightButton}
              onClick={handleImportProduct}>
              <IconUploadFile className="me-1" />
              Tải món
            </Button>
          </RenderWhen>

          <RenderWhen condition={!shouldHideAddProductButton}>
            <Button onClick={handleAddProduct}>
              <IconAdd className={css.addIcon} />

              <div>Thêm</div>
            </Button>
          </RenderWhen>
        </div>
      </div>

      <div className={css.contentContainer}>{children}</div>
    </div>
  );
};

export default ProductLayout;
