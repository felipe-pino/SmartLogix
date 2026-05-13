# Usamos JRE porque el .jar ya lo fabricaste vos afuera
FROM eclipse-temurin:17-jre
WORKDIR /app

# Mantenemos tus instalaciones de seguridad y curl
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Copiamos el JAR directamente desde tu carpeta target local
# Usamos el comodín para evitar errores si la versión cambia levemente
COPY target/*.jar app.jar

# Respetamos el puerto 8085 de Order Service
EXPOSE 8085
ENTRYPOINT ["java", "-jar", "/app/app.jar"]