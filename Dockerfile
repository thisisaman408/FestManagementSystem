# ---------- Stage 1: Build the React/Vite client ----------
FROM node:18-alpine AS client-builder

WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ---------- Stage 2: Runtime for API + ML ----------
FROM node:18-slim

# Install Python3, venv, pip, and build tools
RUN apt-get update && \
    apt-get install -y python3 python3-venv python3-pip build-essential libpython3-dev && \
    rm -rf /var/lib/apt/lists/*

# Create and activate Python virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:${PATH}"

WORKDIR /app/api
COPY api/package.json api/package-lock.json ./
RUN npm ci --only=production
COPY api/ML/requirements.txt ./ML/
RUN pip install --no-cache-dir -r ML/requirements.txt
COPY api/ ./

# Create uploads directory for Multer
RUN mkdir -p /app/api/uploads

# Copy built client into API's public folder
RUN mkdir -p public
COPY --from=client-builder /app/client/dist ./public

# Debug: List files and Python packages
RUN ls -la /app/api /app/api/public /app/api/uploads
RUN pip list

ENV PORT=4000
EXPOSE 4000

# Debug: Print environment variables and file structure before starting
CMD ["sh", "-c", "echo 'Environment:' && env && echo 'Files in /app/api:' && ls -la /app/api && echo 'Files in /app/api/public:' && ls -la /app/api/public && echo 'Files in /app/api/uploads:' && ls -la /app/api/uploads && echo 'Python packages:' && pip list && npm start"]