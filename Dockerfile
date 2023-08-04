FROM node:16

RUN apt update && apt install -y ffmpeg

RUN npm i -g @microsoft/rush

WORKDIR /app

ADD . .

RUN rush install

RUN rush build
