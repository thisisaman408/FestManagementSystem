# ---------- Stage 1: Build the React/Vite client ----------
FROM node:18-alpine AS client-builder

WORKDIR /app/client

# Install client deps
COPY client/package.json client/package-lock.json ./
RUN npm ci

# Build client
COPY client/ ./
RUN npm run build

# ---------- Stage 2: Runtime for API + ML ----------
FROM node:18-slim

# Install Python3, venv & pip
RUN apt-get update && \
    apt-get install -y python3 python3-venv python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Create and activate Python virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:${PATH}"

# Set working dir
WORKDIR /app/api

# Copy and install API Node deps
COPY api/package.json api/package-lock.json ./
RUN npm ci --only=production

# Copy ML requirements and install Python deps in venv
COPY api/ML/requirements.txt ./ML/
RUN pip install --no-cache-dir -r ML/requirements.txt

# Copy the rest of the API & ML code (including your .env)
COPY api/ ./

# Copy built client into API's public folder
RUN mkdir -p public
COPY --from=client-builder /app/client/dist ./public

# Expose port (default 4000, overridden by Render via $PORT)
ENV PORT=4000
EXPOSE 4000

# Start the server (index.js should use process.env.PORT || 4000)
CMD ["npm", "start"]
