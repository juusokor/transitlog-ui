FROM node:12-alpine

ARG BUILD_ENV=production
ENV WORK /opt/transitlog

RUN mkdir -p ${WORK}
WORKDIR ${WORK}

# Install app dependencies
COPY yarn.lock ${WORK}
COPY package.json ${WORK}
RUN yarn

COPY . ${WORK}
COPY .env.${BUILD_ENV} ${WORK}/.env.production

RUN yarn run test:ci
# RUN yarn run build

EXPOSE 3000

CMD yarn run build && yarn run production
