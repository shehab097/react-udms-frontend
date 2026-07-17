University Database Management System (UDMS) - Backend Setup Guide
Welcome to the backend repository for the University Database Management System (UDMS). This project is built using Spring Boot, Spring Security (JWT), and JPA/Hibernate to manage university resources such as students, teachers, semesters, courses, attendance, and notifications.
Follow this guide to clone, configure, build, and run the project on your local machine.
---
📋 Prerequisites
Before setting up, ensure you have the following installed:
Java Development Kit (JDK) 17 or 21
Git
Database Engine: PostgreSQL or MySQL (depending on your project configuration)
IDE: IntelliJ IDEA (highly recommended) or VS Code (with Extension Pack for Java)
Postman (optional, for testing APIs)
---
🚀 Step-by-Step Setup
1. Clone the Repository
Open your terminal or command prompt and clone the repository using the following commands:
```bash
git clone https://github.com/shehab097/spring-boot-udms-backend.git
cd spring-boot-udms-backend
```
---
2. Configure the Database
The application requires a relational database. You need to create a local schema/database and configure the credentials.
Create the Database:
Open your database CLI or GUI (like pgAdmin or MySQL Workbench) and run:
    ```sql
    CREATE DATABASE udms_db;
    ```
Update Configuration Properties:
Navigate to `src/main/resources/` and open `application.properties` (or `application.yml`). Configure your database credentials:
    ```properties
    # Server configuration
    server.port=8080

    # Database configuration (example for PostgreSQL)
    spring.datasource.url=jdbc:postgresql://localhost:5432/udms_db
    spring.datasource.username=your_db_username
    spring.datasource.password=your_db_password

    # Hibernate properties
    spring.jpa.hibernate.ddl-auto=update
    spring.jpa.show-sql=true
    spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

    # JWT Configurations (if applicable)
    jwt.secret=your_super_secret_signing_key_with_at_least_256_bits_length
    jwt.expiration=86400000
    ```
Change the driver and dialect if you are using MySQL:
    ```properties
    spring.datasource.url=jdbc:mysql://localhost:3306/udms_db?useSSL=false&serverTimezone=UTC
    spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
    ```
---
3. Build & Download Dependencies
The repository includes a Maven Wrapper (`mvnw` / `mvnw.cmd`) or Gradle Wrapper (`gradlew` / `gradlew.bat`), so you do not need a global installation.
For Maven Projects:
Windows (PowerShell/CMD):
    ```powershell
    .\mvnw clean install
    ```
Linux/macOS:
    ```bash
    chmod +x mvnw
    ./mvnw clean install
    ```
For Gradle Projects (if applicable):
Windows (PowerShell/CMD):
    ```powershell
    .\gradlew build -x test
    ```
Linux/macOS:
    ```bash
    chmod +x gradlew
    ./gradlew build -x test
    ```
---
4. Run the Application
You can spin up the server in multiple ways:
Option A: Using the CLI Wrapper (Fastest)
Windows (Maven):
    ```powershell
    .\mvnw.cmd spring-boot:run
    ```
Linux/macOS (Maven):
    ```bash
    ./mvnw spring-boot:run
    ```
Windows (Gradle):
    ```powershell
    .\gradlew.cmd bootRun
    ```
Linux/macOS (Gradle):
    ```bash
    ./gradlew bootRun
    ```
Option B: Running in an IDE (Recommended for Development)
Open IntelliJ IDEA or VS Code.
Choose Open/Import Project and select the root directory containing `pom.xml` or `build.gradle`.
Let the IDE resolve dependencies and index files.
Navigate to `src/main/java/.../` and locate the file containing the `@SpringBootApplication` annotation (e.g., `UdmsBackendApplication.java`).
Right-click and select Run 'UdmsBackendApplication' (or click the green play button).
---
📁 Standard Architecture Pattern
This backend follows a typical tiered architecture:
```text
src/main/java/com/udms/backend/
│
├── config/          # Security configs, JWT, CORS filter, Beans
├── controller/      # REST API Endpoints (Student, Course, Attendance, etc.)
├── dto/             # Data Transfer Objects (Request/Response payloads)
├── model/           # Entity Definitions (JPA/Hibernate)
├── repository/      # Spring Data JPA Repositories (Database access layers)
├── service/         # Business Logic Interfaces and Implementations
└── exception/       # Global Exception Handler and Custom Exceptions
```
---
🛠 Troubleshooting
Error: `UnsupportedClassVersionError`:
Cause: Your local Java version is older than the one targeted in `pom.xml` / `build.gradle`.
Solution: Make sure your IDE project settings and system environment variables (`JAVA_HOME`) point to JDK 17 or higher.
Error: `Access denied for user...` or `Relation "..." does not exist`:
Cause: Incorrect database credentials or the specified database schema does not exist.
Solution: Double-check `application.properties` and ensure `CREATE DATABASE udms_db;` was successfully executed.
Port 8080 already in use:
Solution: You can change the port in `application.properties`:
```properties
        server.port=8081
        ```