import * as fs from "fs"
import * as path from "path"

export function generateDockerfile(projectPath: string, envVars: Record<string, string> = {}): string | null {

  // Check if a Dockerfile already exists
  if (fs.existsSync(path.join(projectPath, "Dockerfile"))) {
    return null // Don't overwrite if they provided one
  }

  const files = fs.readdirSync(projectPath)

  // Create ARG statements for every environment variable
  const argLines = Object.keys(envVars).map(key => `ARG ${key}\nENV ${key}=$${key}`).join('\n')

  // 1. Detect Node.js (NestJS, React, Next.js)
  if (files.includes("package.json")) {
    return `
            FROM node:20-alpine
            WORKDIR /app
            COPY package*.json ./
            RUN npm install
            COPY . .
            ${argLines}
            RUN npm run build --if-present
            EXPOSE 3000
            CMD ["npm", "start"]
        `.trim()
  }

  // 2. Detect Python
  if (files.includes("requirements.txt")) {
    return `
            FROM python:3.11-slim
            WORKDIR /app
            COPY requirements.txt .
            RUN pip install -r requirements.txt
            COPY . .
            EXPOSE 8000
            CMD ["python", "app.py"]
        `.trim()
  }

  // 3. Fallback (Static site / Generic)
  return `
        FROM node:20-alpine
        WORKDIR /app
        COPY . .
        RUN npm install -g serve
        EXPOSE 3000
        CMD ["serve", "-s", "."]
    `.trim()
}
