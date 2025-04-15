
FROM node:18-bullseye


RUN apt-get update && apt-get install -y python3 python3-pip


WORKDIR /app


COPY api/package*.json ./api/
RUN cd api && npm install


COPY api ./api


RUN pip3 install -r api/ML/requirements.txt


COPY client ./client
WORKDIR /app/client
RUN npm ci
RUN npm run build
WORKDIR /app



RUN mkdir -p api/public && cp -r client/dist/* api/public/


EXPOSE 4000



WORKDIR /app/api
CMD ["node", "index.js"]
