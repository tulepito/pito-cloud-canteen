FROM node:16.16.0

ADD ./ ./

ENV NODE_ENV "production"

RUN yarn add && yarn build

EXPOSE 3000 443

CMD ["yarn", "start"]
