import _ from 'lodash';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import partnerChecker from '@services/permissionChecker/partner';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const { JSONParams = '' } = req.query;

    switch (apiMethod) {
      case HttpMethod.GET: {
        const {
          rating = [],
          page,
          pageSize,
        } = JSON.parse(JSONParams as string);

        // #TODO FAKE Data to Test
        const reviewDetailData = [
          {
            id: 1,
            name: 'vy',
            rating: 3,
            foodName: 'Hàu nướng phô mai',
            foodRating: 3,
            description:
              'Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.',
            eatingUtensilRating: 3,
            orderDate: new Date(),
            avatar: 'avatar',
          },
          {
            id: 2,
            name: 'vy',
            rating: 3,
            foodName: 'Hàu nướng phô mai',
            foodRating: 3,
            description:
              'Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.',
            eatingUtensilRating: 3,
            orderDate: new Date(),
            avatar: 'avatar',
          },
          {
            id: 3,
            name: 'vy',
            rating: 3,
            foodName: 'Hàu nướng phô mai',
            foodRating: 3,
            description:
              'Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.',
            eatingUtensilRating: 3,
            orderDate: new Date(),
            avatar: 'avatar',
          },
          {
            id: 4,
            name: 'vy',
            rating: 3,
            foodName: 'Hàu nướng phô mai',
            foodRating: 3,
            description:
              'Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.',
            eatingUtensilRating: 3,
            orderDate: new Date(),
            avatar: 'avatar',
          },
          {
            id: 1,
            name: 'vy',
            rating: 3,
            foodName: 'Hàu nướng phô mai',
            foodRating: 3,
            description:
              'Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.',
            eatingUtensilRating: 3,
            orderDate: new Date(),
            avatar: 'avatar',
          },
          {
            id: 1,
            name: 'vy',
            rating: 3,
            foodName: 'Hàu nướng phô mai',
            foodRating: 3,
            description:
              'Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.',
            eatingUtensilRating: 3,
            orderDate: new Date(),
            avatar: 'avatar',
          },
          {
            id: 1,
            name: 'vy',
            rating: 3,
            foodName: 'Hàu nướng phô mai',
            foodRating: 3,
            description:
              'Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.',
            eatingUtensilRating: 3,
            orderDate: new Date(),
            avatar: 'avatar',
          },
          {
            id: 1,
            name: 'vy',
            rating: 3,
            foodName: 'Hàu nướng phô mai',
            foodRating: 3,
            description:
              'Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.',
            eatingUtensilRating: 3,
            orderDate: new Date(),
            avatar: 'avatar',
          },
          {
            id: 1,
            name: 'vy',
            rating: 3,
            foodName: 'Hàu nướng phô mai',
            foodRating: 3,
            description:
              'Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.',
            eatingUtensilRating: 3,
            orderDate: new Date(),
            avatar: 'avatar',
          },
          {
            id: 1,
            name: 'vy',
            rating: 3,
            foodName: 'Hàu nướng phô mai',
            foodRating: 3,
            description:
              'Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.',
            eatingUtensilRating: 3,
            orderDate: new Date(),
            avatar: 'avatar',
          },
          {
            id: 1,
            name: 'vy',
            rating: 3,
            foodName: 'Hàu nướng phô mai',
            foodRating: 3,
            description:
              'Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.',
            eatingUtensilRating: 3,
            orderDate: new Date(),
            avatar: 'avatar',
          },
          {
            id: 1,
            name: 'vy',
            rating: 3,
            foodName: 'Hàu nướng phô mai',
            foodRating: 3,
            description:
              'Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.',
            eatingUtensilRating: 3,
            orderDate: new Date(),
            avatar: 'avatar',
          },
          {
            id: 1,
            name: 'vy',
            rating: 3,
            foodName: 'Hàu nướng phô mai',
            foodRating: 3,
            description:
              'Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.',
            eatingUtensilRating: 3,
            orderDate: new Date(),
            avatar: 'avatar',
          },
        ];

        const filterData =
          rating && rating.length
            ? reviewDetailData.filter((data) => {
                return data.rating === rating;
              })
            : reviewDetailData;
        const totalReviewDetailData = filterData.length;
        const offset = (page - 1) * pageSize;
        const sliceLength = Math.min(totalReviewDetailData - offset, pageSize);
        const paginationData = _.slice(
          filterData,
          offset,
          offset + sliceLength,
        );

        // #END TODO FAKE Data to Test

        return res.status(200).json({
          reviewDetailData: paginationData,
          totalReviewDetailData,
        });
      }

      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(partnerChecker(handler));
