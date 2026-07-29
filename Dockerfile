# Statische boekenlijst — nginx serveert de gegenereerde index.html
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/

EXPOSE 80
