import ReactDOM from 'react-dom';

import PriceQuotation from '@components/OrderDetails/PriceQuotation/PriceQuotation';
import type { usePrepareOrderDetailPageData } from '@hooks/usePrepareOrderManagementData';
import { createNewPrint } from '@services/pdf';
import { EPartnerVATSetting } from '@src/utils/enums';
import TranslationProvider from '@translations/TranslationProvider';

// eslint-disable-next-line react-hooks/rules-of-hooks
const PAGE_HEIGHT = 842; // A4 height in pixels
const PADDING_TOP = 42; // padding top in pixels
const PADDING_BOTTOM = 42; // padding bottom in pixels

export const downloadPriceQuotation =
  ({
    orderTitle,
    priceQuotationData,
    isPartnerQuotation = false,
    subOrderDate,
    vatSetting = EPartnerVATSetting.vat,
  }: {
    orderTitle: string;
    isPartnerQuotation?: boolean;
    priceQuotationData: ReturnType<
      typeof usePrepareOrderDetailPageData
    >['priceQuotationData'];
    subOrderDate?: number | string;
    vatSetting: EPartnerVATSetting;
  }) =>
  async () => {
    const ele = (
      <TranslationProvider>
        <PriceQuotation
          subOrderDate={subOrderDate}
          vatSetting={vatSetting}
          data={priceQuotationData}
          isPartnerQuotation={isPartnerQuotation}
        />
      </TranslationProvider>
    );
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = '-9999px';
    document.body.appendChild(div);
    ReactDOM.render(ele, div);

    const headerEle = document.querySelector('#priceQuotation');
    // const infoEle = document.querySelector('#infoSection');
    // const summaryEle = document.querySelector('#summaryPrice');

    const sections = document.querySelectorAll('.item-line');

    let currentPage = 1;

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const sectionId = section.id;
      const itemTitleEle = document.querySelector(`#${sectionId} .item-title`);
      const items = document.querySelectorAll(`#${sectionId} .item-row`);

      if (itemTitleEle && headerEle) {
        const remain =
          itemTitleEle.getBoundingClientRect().top -
          headerEle.getBoundingClientRect().top +
          itemTitleEle.getBoundingClientRect().height +
          PADDING_TOP +
          PADDING_BOTTOM -
          PAGE_HEIGHT * currentPage;

        if (remain > 0) {
          currentPage++;
          itemTitleEle.setAttribute('style', `padding-top: ${remain}px;`);
        }
      }

      for (let j = 0; j < items.length; j++) {
        if (items[j] && headerEle) {
          const remain =
            items[j].getBoundingClientRect().top -
            headerEle.getBoundingClientRect().top +
            items[j].getBoundingClientRect().height +
            PADDING_TOP +
            PADDING_BOTTOM -
            PAGE_HEIGHT * currentPage;

          if (remain > 0) {
            currentPage++;
            items[j].setAttribute('style', `padding-top: ${remain}px;`);
          }
        }
      }
    }

    const { doc, id } = await createNewPrint({ id: 'priceQuotation' });
    document.body.removeChild(div);

    const dayIndex = subOrderDate
      ? new Date(Number(subOrderDate)).getDay()
      : null;

    if (doc && id) {
      const fileName =
        typeof dayIndex === 'number'
          ? `${'Báo giá'}#${orderTitle}-${dayIndex}.pdf`
          : `${'Báo giá'}#${orderTitle}.pdf`;
      doc.save(fileName, { returnPromise: true });
    }
  };
