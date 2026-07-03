FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm ci --omit=dev --ignore-scripts

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache curl
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/knexfile.ts ./knexfile.ts
COPY --from=build /app/database ./database
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT:-5000}/api/v1/health || exit 1
EXPOSE 5000
CMD ["node", "dist/src/index.js"]
