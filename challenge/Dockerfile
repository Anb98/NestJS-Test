# Establece la imagen base de Node.js con la versión 18.17.0
FROM node:18.17.0

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 3000

CMD ["yarn", "start:prod"]
