# Build Image
FROM node:16.16.0 as BUILD

WORKDIR /app
COPY --from=BASE /app/node_modules ./node_modules
COPY . .
RUN yarn install --production --frozen-lockfile --ignore-scripts --prefer-offline \
    && yarn build && yarn cache clean

FROM node:16.16.0 as PRODUCTION
WORKDIR /app

COPY --from=BUILD /app/package.json /app/yarn.lock ./
COPY --from=BUILD /app/node_modules ./node_modules
COPY --from=BUILD /app/.next ./.next
COPY --from=BUILD /app/public ./public
COPY --from=BUILD /app/startServer.js ./startServer.js
COPY --from=BUILD /app/.env ./.env

EXPOSE 3000 443

CMD ["yarn", "start"]