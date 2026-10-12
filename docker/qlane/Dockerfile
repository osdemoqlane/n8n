# Testing-only image for Qlane pull-request sandboxes (see compose.qlane.yaml).
# It builds n8n from this checkout and runs it from the workspace. The release
# image (docker/images/n8n) packages a prebuilt ./compiled directory instead.
# Node 24 matches CI and has prebuilt binaries for the native modules.
FROM node:24.18.1-bookworm-slim

# The compilers are a fallback for a native module without a prebuilt binary.
RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates g++ make python3 tini \
	&& rm -rf /var/lib/apt/lists/*

RUN npm install --global pnpm@12.4.2

# DOCKER_BUILD makes the prepare script skip the git hooks install.
ENV DOCKER_BUILD=true \
	DO_NOT_TRACK=1 \
	TURBO_TELEMETRY_DISABLED=1

WORKDIR /app

# Download packages from the lockfile before the source is copied, so most
# pull requests reuse this layer.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches
RUN pnpm fetch

COPY . .
RUN pnpm install --frozen-lockfile --offline

# Build n8n and the packages it uses, without type checks. The editor builds
# first and alone, because its build script allows an 8 GB heap.
ARG BUILD_MAX_OLD_SPACE_MB=3072
RUN NODE_OPTIONS="--max-old-space-size=${BUILD_MAX_OLD_SPACE_MB}" \
	pnpm exec turbo run build:unchecked --filter=n8n-editor-ui... --concurrency=4
RUN NODE_OPTIONS="--max-old-space-size=${BUILD_MAX_OLD_SPACE_MB}" \
	pnpm exec turbo run build:unchecked --filter=n8n... --concurrency=4

ENV NODE_ENV=production
USER node
EXPOSE 5678
ENTRYPOINT ["tini", "--", "node", "packages/cli/bin/n8n"]
CMD ["start"]
