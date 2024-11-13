FROM node:latest

WORKDIR /app/src

# add app
COPY . ./

# install app dependencies
RUN npm install

# RUN echo $(ls -1 /app/node_modules/react-scripts/bin)
# this outputs : react-scripts.js in the console

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/src/node_modules/.bin:$PATH

# start app
CMD ["npm", "run", "dev"]
