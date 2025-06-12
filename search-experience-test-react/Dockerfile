FROM node:latest

WORKDIR /app

# add app
COPY . ./

# install app dependencies
RUN npm install

RUN npm run build

ENV PATH /app/src/node_modules/.bin:$PATH

# start app
CMD ["npm", "run", "dev"]
