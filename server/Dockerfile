FROM node:16

WORKDIR /server

RUN yarn config set https://registry.yarnpkg.com

COPY package*.json ./

RUN yarn install --verbose

COPY wait-for-it.sh ./

COPY . .

RUN mkdir store

EXPOSE 9876

CMD ["yarn","start"]