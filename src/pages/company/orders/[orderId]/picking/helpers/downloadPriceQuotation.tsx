import ReactDOM from 'react-dom';

import PriceQuotation from '@components/OrderDetails/PriceQuotation/PriceQuotation';
import { createNewPrint } from '@services/pdf';
import TranslationProvider from '@translations/TranslationProvider';
import type { TObject } from '@utils/types';

import type { usePrepareOrderDetailPageData } from '../hooks/usePrepareData';

export const downloadPriceQuotation =
  (
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

    await createNewPrint('priceQuotation').then((response) => {
      const { doc, id } = response as TObject;
      if (doc && id) {
        const fileName = `${'Báo giá'}.pdf`;
        doc.save(fileName, { returnPromise: true }).then((_res: any) => {});
      }
    });

    document.body.removeChild(div);
  };
