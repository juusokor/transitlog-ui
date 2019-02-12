FROM node:10-alpine

ENV WORK /opt/transitlog

RUN mkdir -p ${WORK}
WORKDIR ${WORK}

# Install app dependencies
COPY yarn.lock ${WORK}
COPY package.json ${WORK}
RUN yarn

COPY . ${WORK}
RUN yarn run test:ci
RUN yarn run build

EXPOSE 3000

CMD yarn run production
