FROM node:20.12.2
WORKDIR /app

COPY package.json yarn.lock ./
COPY . .

ENV NODE_ENV="production"

RUN yarn install --production --frozen-lockfile \
    && yarn build && yarn cache clean

EXPOSE 3000 443

CMD ["yarn", "start"]