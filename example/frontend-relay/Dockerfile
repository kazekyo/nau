FROM node:15-alpine

ARG APP_ROOT="/app"
WORKDIR $APP_ROOT
COPY package.json $APP_ROOT/
RUN npm install --legacy-peer-deps
COPY . $APP_ROOT
