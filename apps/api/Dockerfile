FROM node:22-alpine

ARG NPM_TOKEN
WORKDIR /app
COPY . .
RUN echo "@danieluruena:registry=https://npm.pkg.github.com/" > .npmrc \
  && echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" >> .npmrc 
RUN npm install --only-prod
RUN npm run build
RUN rm -rf ./src

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
