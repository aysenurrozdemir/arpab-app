# Use the official Node.js image as the build environment
FROM node:22.2 AS build

# Create and set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Angular app
ARG CONFIGURATION
RUN npm run build-$CONFIGURATION



# Use the official Nginx image as the runtime environment
FROM nginx:latest

# Copia i certificati SSL
COPY ./ssl/self_signed.crt /etc/nginx/ssl/self_signed.crt
COPY ./ssl/self_signed.key /etc/nginx/ssl/self_signed.key
COPY ./ssl/dhparam.pem /etc/nginx/ssl/dhparam.pem

# Copia il file di configurazione personalizzato di Nginx
COPY ./nginx/conf/default.conf /etc/nginx/conf.d/

# Copia il sito web statico Angular compilato nella directory web di Nginx
COPY --from=build /app/dist/primeng-quickstart-cli /usr/share/nginx/html

# Espone la porta https definita nel conf
EXPOSE 4443
EXPOSE 8080
