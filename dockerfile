FROM node:22-alpine
RUN addgroup -S nodegrp && adduser -S node -G nodegrp
USER node

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
EXPOSE 8080

CMD ["node", "index.js"]
