FROM node:16.16.0
WORKDIR /app

COPY package.json yarn.lock ./
COPY . .
RUN yarn install --production --frozen-lockfile \
    && yarn build && yarn cache clean

EXPOSE 3000 443

CMD ["yarn", "start"]