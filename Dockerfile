FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install --prod=false

COPY . .

RUN pnpm run build

EXPOSE 3001

CMD ["pnpm", "start"]
