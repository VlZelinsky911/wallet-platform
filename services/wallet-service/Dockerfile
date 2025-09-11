FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx nest build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/dist dist
COPY package*.json ./
RUN npm ci --omit=dev
EXPOSE 5002
CMD ["node","dist/main.js"]