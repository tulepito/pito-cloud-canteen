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

    if (!headerEle) return;

    const headerTop = headerEle.getBoundingClientRect().top;
    const CONTENT_HEIGHT = PAGE_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
    let currentPage = 1;

    /**
     * Tính padding cần thêm để đẩy element sang trang mới
     * @returns padding cần thêm (0 nếu không cần xuống trang)
     */
    const calculatePageBreak = (element: Element): number => {
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top - headerTop;
      const elementBottom = elementTop + rect.height;

      const currentPageEnd = currentPage * CONTENT_HEIGHT;

      if (elementBottom > currentPageEnd) {
        const padding = currentPageEnd - elementTop;

        const pagesNeeded = Math.ceil(
          (elementBottom - currentPageEnd) / CONTENT_HEIGHT,
        );
        currentPage += pagesNeeded;

        return padding > 0 ? padding : 0;
      }

      return 0;
    };

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const sectionId = section.id;
      const itemTitleEle = document.querySelector(`#${sectionId} .item-title`);
      const items = document.querySelectorAll(`#${sectionId} .item-row`);

      if (itemTitleEle) {
        const padding = calculatePageBreak(itemTitleEle);
        if (padding > 0) {
          itemTitleEle.setAttribute('style', `padding-top: ${padding}px;`);
        }
      }

      for (let j = 0; j < items.length; j++) {
        const item = items[j];
        if (item) {
          const padding = calculatePageBreak(item);
          if (padding > 0) {
            item.setAttribute('style', `padding-top: ${padding}px;`);
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
