# Usamos directamente el JRE (Runtime) ya que el JAR está listo
FROM eclipse-temurin:17-jre
WORKDIR /app

# Instalaciones de sistema y limpieza de caché de apt
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Copiamos el ejecutable desde tu carpeta target local
COPY target/*.jar app.jar

# Respetamos tu puerto original 8083
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "/app/app.jar"]