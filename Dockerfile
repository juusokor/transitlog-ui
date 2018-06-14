FROM node:10-alpine

WORKDIR /app
COPY . ./

RUN yarn install
RUN yarn build
RUN yarn add serve

EXPOSE 3000

ENTRYPOINT ["yarn", "run"]
CMD ["serve", "-s", "build"]
