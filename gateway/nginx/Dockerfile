FROM nginx:alpine

COPY ./conf.d/default.conf /etc/nginx/conf.d/default.conf
COPY ./nginx.conf   /etc/nginx/nginx.conf
COPY ./src/auth.js /etc/nginx/auth.js
