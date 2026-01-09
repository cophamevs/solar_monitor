# Production-only Dockerfile (no build stage)
# For low-RAM devices like Orange Pi (1GB)
# Pre-requisite: Run "npm run build" locally first to create dist/

FROM nginx:alpine

# Copy pre-built frontend assets
COPY dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
