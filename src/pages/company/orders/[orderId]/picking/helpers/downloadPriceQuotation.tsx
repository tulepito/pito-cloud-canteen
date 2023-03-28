import ReactDOM from 'react-dom';

import PriceQuotation from '@components/OrderDetails/PriceQuotation/PriceQuotation';
import { createNewPrint } from '@services/pdf';
import TranslationProvider from '@translations/TranslationProvider';

import type { usePrepareOrderDetailPageData } from '../hooks/usePrepareData';

const PAGE_HEIGHT = 842; // A4 height in pixels
const PADDING_TOP = 42; // padding top in pixels
const PADDING_BOTTOM = 42; // padding bottom in pixels

export const downloadPriceQuotation =
  (
    orderTitle: string,
    priceQuotationData: ReturnType<
      typeof usePrepareOrderDetailPageData
    >['priceQuotationData'],
  ) =>
  async () => {
    const ele = (
      <TranslationProvider>
        <PriceQuotation data={priceQuotationData} />
      </TranslationProvider>
    );
    const div = document.createElement('div');
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

    if (doc && id) {
      const fileName = `${'Báo giá'}#${orderTitle}.pdf`;
      doc.save(fileName, { returnPromise: true });
    }
  };
