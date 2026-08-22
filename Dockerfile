# Statische boekenlijst — nginx serveert de gegenereerde index.html en
# de gegenereerde boekpagina's uit boek/ (zonder die COPY lopen de
# uitgebreide samenvattingen stil op de 404-fallback naar index.html uit)
FROM nginx:alpine

# htpasswd-tool voor Basic Auth (wachtwoord komt uit env vars, nooit uit deze image/repo)
RUN apk add --no-cache apache2-utils

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/
COPY boek/ /usr/share/nginx/html/boek/

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
