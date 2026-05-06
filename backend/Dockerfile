FROM node:24.11.1-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./

# USER node

RUN npm install -g @nestjs/cli

# RUN npm install --only=production
RUN npm install

COPY  . .

CMD ["npm", "run", "start:dev"]