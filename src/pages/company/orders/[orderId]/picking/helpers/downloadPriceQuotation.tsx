import ReactDOM from 'react-dom';

import PriceQuotation from '@components/OrderDetails/PriceQuotation/PriceQuotation';
import { createNewPrint } from '@services/pdf';
import TranslationProvider from '@translations/TranslationProvider';

import type { usePrepareOrderDetailPageData } from '../hooks/usePrepareData';

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

    const { doc, id } = await createNewPrint({ id: 'priceQuotation' });
    document.body.removeChild(div);

    if (doc && id) {
      const fileName = `${'Báo giá'}#${orderTitle}.pdf`;
      doc.save(fileName, { returnPromise: true });
    }
  };
