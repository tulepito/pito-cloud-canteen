FROM node:16.16.0

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

ADD ./ /usr/src/app

RUN yarn && yarn build

EXPOSE 3000 443

CMD ["yarn", "start"]