# Usamos el JRE porque ya compilaste el .jar con IntelliJ
FROM eclipse-temurin:17-jre
WORKDIR /app

# Mantenemos tus dependencias de sistema (curl para el healthcheck)
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Copiamos el JAR generado desde tu carpeta target local
COPY target/*.jar app.jar

# Respetamos tu puerto original 8080
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]