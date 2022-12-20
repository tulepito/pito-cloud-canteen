FROM node:16.16.0
WORKDIR /app

COPY package.json yarn.lock ./
COPY . .
RUN yarn install --production --frozen-lockfile --ignore-scripts --prefer-offline \
    && yarn build

EXPOSE 3000 443

CMD ["yarn", "start"]