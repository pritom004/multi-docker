# Stage 1: Build the application
FROM node:alpine AS builder   
WORKDIR /app  
COPY package*.json ./  
RUN npm ci  
COPY . .   
RUN npm run build   

# Stage 2: Serve the application with Nginx
FROM nginx:alpine
# Optional but recommended if your custom config targets a non-standard port:
EXPOSE 3000  

# Copy custom Nginx configuration to the correct default path
COPY ./nginx.conf /etc/nginx/conf.d/default.conf  

# Copy the static build output from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
