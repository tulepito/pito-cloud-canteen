FROM node:16.15.1 as BASE

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile \
    && yarn cache clean

# Build Image
FROM node:16.15.1 as BUILD

WORKDIR /app
COPY --from=BASE /app/node_modules ./node_modules
COPY . .
RUN yarn build \
    && rm -rf node_modules \
    && yarn install --production --frozen-lockfile --ignore-scripts --prefer-offline

FROM node:16.15.1 as PRODUCTION
WORKDIR /app

COPY --from=BUILD /app/package.json /app/yarn.lock ./
COPY --from=BUILD /app/node_modules ./node_modules
COPY --from=BUILD /app/.next ./.next
COPY --from=BUILD /app/public ./public
COPY --from=BUILD /app/startServer.js ./startServer.js
COPY --from=BUILD /app/.env ./.env

EXPOSE 3000 443

CMD ["yarn", "start"]