FROM node:10
ARG source
WORKDIR /app
COPY ${source:-dist} .
ENTRYPOINT ["node", "main.bundle.js"]
