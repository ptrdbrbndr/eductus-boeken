# Statische boekenlijst — nginx serveert de gegenereerde index.html en
# de gegenereerde boekpagina's uit boek/ (zonder die COPY lopen de
# uitgebreide samenvattingen stil op de 404-fallback naar index.html uit)
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/
COPY boek/ /usr/share/nginx/html/boek/

EXPOSE 80
