FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:22-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn build

FROM node:22-alpine AS runner

ARG PORT=4001
ARG SEED=false
ENV PORT=${PORT}
ENV SEED=${SEED}

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile && yarn cache clean

COPY --from=build /app/dist ./dist

EXPOSE ${PORT}

CMD if [ "$SEED" = "true" ]; then node dist/scripts/seed.js && node dist/main; else node dist/main; fi
