# Dev Test

This repository contains the implementation of the User Service for a microservice-based e-commerce application. The service is built using [NestJS](https://nestjs.com/) and includes JWT-based authentication, database integration via Sequelize, and asynchronous messaging using Kafka. This README explains how to set up and run the solution.

## Features

- **User Registration & Authentication:**

  - Endpoints for user registration (`POST /register`) and login (`POST /login`).
  - JWT-based protection for secured routes (`GET /users/:id`).

- **Database Integration:**

  - Uses Sequelize to map to a relational database (PostgreSQL)

- **Asynchronous Messaging with Kafka:**

  - Integration with Kafka for producing and consuming messages.

- **API Documentation:**
  - Swagger documentation available at `/api-documentation`.

## Architecture Overview

This service is part of a microservices ecosystem that includes the User, Product, and Order services. Key components include:

- **API Gateway:** Handles incoming requests and load balancing.
- **User Service:** Manages user accounts, authentication, and profile data.
- **Kafka Integration:** Handles asynchronous messaging for tasks like sending welcome emails.

For a visual overview, please refer to the [Miro Board](https://miro.com/app/board/uXjVIc2Q7Qw=).

## Requirements

- **Node.js** (v14 or later)
- **npm** (v6 or later) or **yarn**
- **PostgreSQL**
- **Kafka Broker**
  - Set up a Kafka Broker either using a cloud service or Docker
  - Save the broker URL as the constant `KAFKA_BROKER_URL` in the file `src/common/index.ts`.

## Installation

1. **Clone the repository:**

```bash
# Clone the repository
git clone https://github.com/claretnnamocha/dev-test.git

# Navigate into the project directory
cd dev-test

# Install dependencies
npm install

# Copy environment variables file
cp .env.example .env
```

## 🚀 Running the Application

### Development

To start the application in development mode with hot-reloading:

```sh
npm run start:dev
```

### Production

To build and run the application in production::

```sh
npm run build
npm run start:prod
```

## ✅ Testing

Run unit and integration tests:

```sh
npm run test
```
