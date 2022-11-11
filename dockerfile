
FROM node:16
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . ./
RUN npm run build
EXPOSE 9999
CMD [ "npm" , "start"]

#FROM node:16
#
## Create app directory
#WORKDIR /neom-heritage
#
##copy the app code
#COPY ./ /neom-heritage
#
## Install app dependencies
#RUN npm install
#
#
#RUN npm run build
#
## If you are building your code for production
## RUN npm ci --only=production
#
#EXPOSE 9999
#
#CMD [ "npm" , "start"]