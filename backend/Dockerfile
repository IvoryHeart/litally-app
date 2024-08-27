FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Build the TypeScript code
RUN npm run local-build

EXPOSE 3000

# Command to run the local application
CMD ["node", "dist/server.js"]