import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { getIntegrationSdk, handleError } from '@services/sdk';

function asString(q: string | string[] | undefined) {
  return Array.isArray(q) ? q[0] : q;
}

const countByFoodId = (
  items: readonly {
    foodId: string;
    memberId: string;
    reason: string;
  }[],
) => {
  const counts = (items || []).reduce<Record<string, number>>(
    (acc, { foodId }) => {
      acc[foodId] = (acc[foodId] ?? 0) + 1;

      return acc;
    },
    {},
  );

  return Object.keys(counts).map((foodId) => ({
    foodId,
    count: counts[foodId],
  }));
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== HttpMethod.POST) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const planId = asString(req.query.planId);
    const { mealItemsFailed, quotationId } = req.body ?? {};

    if (!planId) {
      return res.status(400).json({ error: 'Missing required field: planId' });
    }
    if (mealItemsFailed == null || typeof mealItemsFailed !== 'object') {
      return res
        .status(400)
        .json({ error: 'Missing or invalid field: mealItemsFailed' });
    }

    const sdk = getIntegrationSdk();
    const metadata = { mealItemsFailed };

    const mealItemsFailedByDate = Object.entries(mealItemsFailed).reduce(
      (acc, [date, items]) => {
        acc[date] = countByFoodId(
          items as readonly {
            foodId: string;
            memberId: string;
            reason: string;
          }[],
        );

        return acc;
      },
      {} as Record<string, { foodId: string; count: number }[]>,
    );

    const metadataQuotation = {
      mealItemsFailed: Object.fromEntries(
        Object.keys(mealItemsFailedByDate).map((date) => [
          date,
          mealItemsFailedByDate[date],
        ]),
      ),
    };

    const updates = [
      sdk.listings.update({ id: planId, metadata }, { expand: true }),
      ...(quotationId
        ? [
            sdk.listings.update(
              {
                id: quotationId,
                metadata: metadataQuotation,
              },
              { expand: true },
            ),
          ]
        : []),
    ];

    // eslint-disable-next-line unused-imports/no-unused-vars
    const [planResult, _] = await Promise.all(updates);

    return res.status(200).json(planResult.data);
  } catch (error) {
    console.error(error);

    return handleError(res, error);
  }
}
