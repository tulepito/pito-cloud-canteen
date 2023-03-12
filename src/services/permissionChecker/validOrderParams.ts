import isEmpty from 'lodash/isEmpty';
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

import { handleError } from '@services/sdk';

const validOrderParams =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const { companyId, bookerId, isCreatedByAdmin, generalInfo } = req.body;
      if (!companyId || !bookerId) {
        throw new Error('Missing required params');
      }

      if (!isCreatedByAdmin) {
        if (isEmpty(generalInfo)) {
          throw new Error('Missing general info params');
        }

        const { startDate, endDate, packagePerMember, deliveryHour } =
          generalInfo;

        if (!startDate || !endDate || !packagePerMember || !deliveryHour) {
          throw new Error('Missing general info params');
        }
      }
      return handler(req, res);
    } catch (error) {
      handleError(res, error);
    }
  };

export default validOrderParams;
