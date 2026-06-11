FROM node:26-alpine

WORKDIR /home/app/${PACKAGE}
COPY ./*.json ./
COPY ./*.ts ./

COPY ./src ./src
COPY ./db ./db

RUN npm i

CMD npm run build && npm start