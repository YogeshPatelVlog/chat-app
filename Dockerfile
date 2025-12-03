# 1. Build stage
FROM eclipse-temurin:17-jdk AS build

WORKDIR /app

# Copy everything
COPY . .

# Build the project
RUN ./mvnw clean package -DskipTests

# 2. Run stage
FROM eclipse-temurin:17-jdk

WORKDIR /app

# Copy jar from build stage to runtime stage
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
