# Usamos la imagen ligera que ya tienes
FROM eclipse-temurin:17-jre

# Carpeta de la app
WORKDIR /app

# Instalamos curl para el healthcheck del discovery
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# COPIAMOS el jar ejecutable.
# Usamos esta sintaxis para asegurarnos de que solo agarre el JAR principal
# y no el .original que a veces genera el repackage de Spring
COPY target/auth-service-*.jar app.jar

# Comando para arrancar
ENTRYPOINT ["java", "-jar", "app.jar"]