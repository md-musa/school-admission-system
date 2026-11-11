# School Admission System

## 1. Project Overview

The School Admission System is a seat reservation and admission management platform that allows administrators to create classes with multiple shifts and allows students to hold seats, track countdown timers, and confirm admissions. The system is built with **React**, **ASP.NET Core (.NET 8)**, **PostgreSQL**, and **Docker**.

## 2. Prerequisites

- **Docker** (version 24 or newer)
- **Docker Compose** (v2 or newer)

Separate installations of Node.js, .NET SDK, and PostgreSQL are not required on your machine to run the application.

## 3. Project Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/md-musa/school-admission-system.git
   ```

2. Navigate to the project directory:

   ```bash
   cd school-admission-system
   ```

3. (Optional) Configure environment variables:
   Default configuration values are already provided in `docker-compose.yml`, so creating a `.env` file is optional. If you wish to customize credentials or hold duration, copy the template:

   ```bash
   cp .env.example .env
   ```

4. Build and run all services:
   ```bash
   docker compose up --build
   ```

## 4. Application URLs

Once the containers are running, access the services at:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **Classes API**: http://localhost:8080/classes

## 5. Stopping the Application

To stop the running application:

```bash
docker compose down
```

To stop the application and completely reset the database by removing the persisted PostgreSQL data volume:

```bash
docker compose down -v
```
