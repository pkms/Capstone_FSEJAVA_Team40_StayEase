# stay-ease-server

Backend service for the StayEase application — a Spring Boot REST API that powers hotel search, booking, user management, and related services for the StayEase frontend.

This README describes how to build, configure, run and test the stay-ease-server module locally and in Docker.

## Table of Contents

- About
- Key Features
- Technology Stack
- Prerequisites
- Project Structure
- Quickstart (Local)
- Configuration
- Running with Docker
- Database migrations
- Test
- API overview
- Contributing
- License
- Contact

## About

The stay-ease-server module is the Java/Spring Boot backend for the StayEase hotel booking application. It exposes REST endpoints consumed by the frontend, handles business logic, persists data to a relational database, and integrates with external services where required.

## Key Features

- REST API for hotels, rooms, bookings, users and payments (as applicable)
- Authentication and authorization (JWT or session-based — adapt as implemented)
- Persistence layer using JPA/Hibernate
- Environment-based configuration for local, staging and production
- Health and readiness endpoints

## Technology Stack

- Java 11+ (or the project's configured Java version)
- Spring Boot
- Spring Data JPA (or equivalent)
- Maven (or Gradle if the module uses it)
- PostgreSQL / MySQL (configure according to your environment)
- Docker (for containerization)

## Prerequisites

- JDK 11 or newer installed and JAVA_HOME configured
- Maven 3.6+ (or Gradle if used)
- Docker & Docker Compose (optional, for containerized runs)
- A running relational database (Postgres recommended)

## Project Structure

The recommended project structure for the stay-ease-server module follows standard Spring Boot conventions. Adjust package names to match the project's base package.

- stay-ease-server/
  - pom.xml (or build.gradle) — build file
  - Dockerfile — optional container image build instructions
  - src/
    - main/
      - java/
        - com/yourorg/stayease/ (base package)
          - config/ — Spring configuration classes (security, CORS, Swagger)
          - controller/ — REST controllers (API endpoints)
          - service/ — service layer containing business logic
          - repository/ — Spring Data JPA repositories
          - model/ or entity/ — JPA entity classes
          - dto/ — request/response DTOs
          - security/ — authentication/authorization (JWT filters, providers)
          - exception/ — custom exceptions and handlers (e.g., @ControllerAdvice)
          - util/ — utility classes and helpers
      - resources/
        - application.yml / application.properties — default configuration
        - application-dev.yml, application-prod.yml — profile-specific configs
        - db/migration/ (if using Flyway) or db/changelog/ (Liquibase)
        - static/ and templates/ (if needed)
    - test/
      - java/ — unit and integration tests
  - README.md
  - .env.example — example environment variables (optional)
  - docker-compose.yml — example compose for local dev (optional)

Notes
- If the repo uses modules or a different packaging style, adapt the layout accordingly.
- If you use a layered package structure (api, core, persistence), include a short description in this section.

## Quickstart (Local)

1. Clone the repository and navigate to the module dir:

   git clone https://github.com/pkms/Capstone_FSEJAVA_Team40_StayEase.git
   cd Capstone_FSEJAVA_Team40_StayEase/stay-ease-server

2. Configure application properties (see Configuration below).

3. Build the project:

   mvn clean package

4. Run the application:

   mvn spring-boot:run

   Or run the packaged jar:

   java -jar target/*.jar

5. By default the server will start on port 8080 (adjust via application properties).

## Configuration

Application configuration lives in src/main/resources/application.properties or application.yml and uses Spring profiles (e.g., `application-dev.yml`, `application-prod.yml`) as needed.

Common configuration items:

- spring.datasource.url: JDBC URL for your database
- spring.datasource.username
- spring.datasource.password
- spring.jpa.hibernate.ddl-auto
- server.port
- jwt.secret (if using JWT auth)

Example environment variables for local development:

- DB_URL=jdbc:postgresql://localhost:5432/stayease
- DB_USER=stayease
- DB_PASS=stayeasepass
- SPRING_PROFILES_ACTIVE=dev

You can also supply these via application.yml or a `.env` file when using Docker Compose.

## Running with Docker

A simple Docker setup (example `docker-compose.yml`) might include the app and a Postgres service:

```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=stayease
      - POSTGRES_USER=stayease
      - POSTGRES_PASSWORD=stayeasepass
    ports:
      - "5432:5432"
    volumes:
      - db-data:/var/lib/postgresql/data

  stayease:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/stayease
      - SPRING_DATASOURCE_USERNAME=stayease
      - SPRING_DATASOURCE_PASSWORD=stayeasepass
    depends_on:
      - db

volumes:
  db-data:
```

To build and run the stack:

  docker-compose up --build

## Database migrations

If the project uses Flyway or Liquibase, migration scripts live under `src/main/resources/db/migration` (Flyway) or `src/main/resources/db/changelog` (Liquibase). Run the application and the migration tool will apply schema changes automatically on startup.

If migrations are not present, ensure your `spring.jpa.hibernate.ddl-auto` is configured appropriately (for development you may use `update`, for production use migrations).

## Tests

Run unit and integration tests with:

  mvn test

Integration tests that require a database can use Testcontainers or a local test database. Check the project's test configuration to see which strategy is used.

## API overview

This document is a brief overview — consult the project's API docs (Swagger/OpenAPI) if available (commonly at `/swagger-ui.html` or `/v3/api-docs`).

Common endpoints (examples):

- GET /api/hotels — list hotels
- GET /api/hotels/{id} — hotel details
- POST /api/bookings — create booking
- GET /api/users/{id}/bookings — list user bookings
- POST /api/auth/login — authenticate user

Replace paths above with the actual routes implemented by the module.

## Logging

Logging is configured via `application.properties` and uses Spring Boot’s logging system (Logback by default). Adjust logging levels with:

  logging.level.root=INFO
  logging.level.com.yourpackage=DEBUG

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a feature branch
3. Commit changes with clear messages
4. Open a pull request describing your change and any setup steps

Follow the project's coding style and unit test coverage standards.

## License

Include the repository's license here. If no license is configured, add a LICENSE file to the repo and reference it.

## Contact

For questions about this module, reach out to the project maintainers or open an issue in the repository.
