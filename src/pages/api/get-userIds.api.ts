import type { NextApiRequest, NextApiResponse } from 'next';

import { getIntegrationSdk } from '@services/integrationSdk';
import { denormalisedResponseEntities } from '@utils/data';

/**
 * Public API to get user IDs from a list of email addresses
 *
 * POST /api/get-userIds
 *
 * Request body:
 * {
 *   "emails": ["user1@example.com", "user2@example.com"]
 * }
 *
 * Response:
 * ["id1", "id2", "id3"]
 */

const BATCH_SIZE = 50;

function chunkArray<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size),
  );
}

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { emails } = req.body;

  // Validate input
  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({
      message:
        'Missing or invalid emails. Please provide an array of email addresses.',
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invalidEmails = emails.filter(
    (email: string) => !emailRegex.test(email),
  );

  if (invalidEmails.length > 0) {
    return res.status(400).json({
      message: 'Invalid email format',
      invalidEmails,
    });
  }

  const integrationSdk = getIntegrationSdk();
  const emailChunks = chunkArray(emails, BATCH_SIZE);

  try {
    const userIds: string[] = [];

    // Process emails in batches to avoid overwhelming the API
    await emailChunks.reduce(async (previousPromise, chunk) => {
      await previousPromise;

      const chunkResults = await Promise.allSettled(
        chunk.map(async (email: string) => {
          try {
            const [user] = denormalisedResponseEntities(
              await integrationSdk.users.show({
                email,
                include: ['profileImage'],
              }),
            );

            return user?.id?.uuid || null;
          } catch (error) {
            console.error(`Error fetching user for email ${email}:`, error);

            return null;
          }
        }),
      );

      // Add only successful user IDs to the result
      chunkResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          userIds.push(result.value);
        }
      });
    }, Promise.resolve());

    return res.status(200).json(userIds);
  } catch (error) {
    console.error('Error in get-userIds API:', error);

    return res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
}

// Export handler directly without authentication middleware to make it public
export default handler;
