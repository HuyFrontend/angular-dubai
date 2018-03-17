FROM node:7.10.0-alpine

ADD build/dist /app
ADD run.sh /app/
RUN chmod +x /app/run.sh

WORKDIR /app

CMD ["sh", "/app/run.sh"]