# Usamos un servidor web Nginx ultra liviano
FROM nginx:alpine

# Copiamos directamente la carpeta 'dist' que Windows ya compiló con éxito
COPY dist/ /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]