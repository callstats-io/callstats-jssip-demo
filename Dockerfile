FROM node:8.9.4

WORKDIR /usr/src/app

COPY package.json /usr/src/app/
COPY bower.json /usr/src/app/
RUN npm install -g bower --silent
RUN npm install --silent
RUN bower install --allow-root

COPY . /usr/src/app

CMD ["npm","start"]

