# ---- Stage 1: build the React frontend ----
FROM node:20-alpine AS frontend-build
WORKDIR /repo/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: build the Spring Boot backend (bundles frontend/dist as static content) ----
FROM eclipse-temurin:21-jdk-alpine AS backend-build
WORKDIR /repo
COPY backend/ ./backend/
COPY --from=frontend-build /repo/frontend/dist ./frontend/dist
WORKDIR /repo/backend
RUN chmod +x gradlew && ./gradlew :app:bootJar --no-daemon -x test

# ---- Stage 3: minimal runtime image ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=backend-build /repo/backend/app/build/libs/*.jar app.jar
# Keep the Java source on disk too, so the "Scan Path" demo feature has
# real files to parse when a client hits it with the default path.
COPY --from=backend-build /repo/backend/app/src/main/java ./backend/app/src/main/java
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
