FROM eclipse-temurin:17-jre
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Copia el JAR generado por IntelliJ
COPY target/*.jar app.jar

# Puerto de Eureka
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "/app/app.jar"]