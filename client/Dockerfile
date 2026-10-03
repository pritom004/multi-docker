# Stage 1: Build the application
FROM node:alpine AS builder   
WORKDIR /app  
COPY package*.json ./  
RUN npm ci  
COPY . .   
RUN npm run build   


FROM nginx:alpine

EXPOSE 3000  

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /app/build /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
