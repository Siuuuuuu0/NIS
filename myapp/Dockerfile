FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 8081

# Expo only accepts --host lan|tunnel|localhost (not 0.0.0.0). CI=1 in compose disables interactive prompts.
CMD ["npx", "expo", "start", "--web", "--host", "lan", "--port", "8081"]
