# Usamos JRE directamente porque ya compilaste el .jar en IntelliJ
FROM eclipse-temurin:17-jre
WORKDIR /app

# Mantenemos tus instalaciones y limpieza
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Copiamos el JAR que ya existe en tu carpeta target local
# Nota: Usamos comodín (*) por si la versión cambia (1.0.0, etc)
COPY target/*.jar app.jar

# Mantenemos tu puerto y comando original
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app/app.jar"]