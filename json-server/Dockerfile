FROM node:12

RUN npm install -g json-server

WORKDIR /data

CMD json-server --watch db.json --host 0.0.0.0
