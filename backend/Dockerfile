# Multi-stage build: only the built jar ends up in the runtime image.
#
# Tests are skipped here on purpose, not to weaken the gate but because they
# can't run here at all: the IT suite uses Testcontainers (AbstractIntegrationTest),
# which needs a Docker daemon to spin up an ephemeral Postgres -- a plain `docker
# build` has no access to the host's Docker socket. Run `./mvnw test` locally
# (or wherever you build this image from) BEFORE building/deploying -- that's the
# actual gate, see backend/docs/deploy-oracle.md.

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/rolliq-api-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
