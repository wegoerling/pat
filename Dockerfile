FROM node:lts-alpine
WORKDIR /usr/src/app
COPY . ./
RUN npm install && npm link && apk add --no-cache git
