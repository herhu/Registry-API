# Registry API Documentation

## Overview

The Registry API is a RESTful service that maintains a set of items internally. It provides endpoints to add, remove, and check items in the registry, as well as to invert the current set and compare it with another set. The items can be any string containing only alphanumeric characters and spaces. The storage is implemented using Redis.

## Features

- **Check if an item is in the registry**: Verifies whether a given item is present in the registry.
- **Add an item to the registry**: Adds a new item to the registry.
- **Remove an item from the registry**: Removes an existing item from the registry.
- **Compare with another set**: Returns the difference between a submitted set and the current registry set.
- **Invert the current set**: Inverts the membership status of all items in the registry.

## Prerequisites

- **Node.js** (>= 14.x)
- **npm** (>= 6.x)
- **Redis** (running on default port 6379)

## .ENV
   ```bash
   PORT=3000
   REDIS_HOST=redis
   REDIS_PORT=6379
   ```





## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd registry-api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Ensure Redis is running**:
   You can start a Redis server using Docker:
   ```bash
   docker run -p 6379:6379 --name redis -d redis
   ```

## Running the Application

To start the NestJS application, run:
```bash
npm run start
```

The application will be accessible at `http://localhost:3000`.

## API Documentation

The API documentation is available through Swagger UI. After starting the application, open your browser and navigate to:
```
http://localhost:3000/api
```

### API Endpoints

- **GET /registry/check**: Check if an item is in the registry.
  - Query Parameter: `item` (string)
  - Response: `"OK"` if the item is in the registry, `"NOT OK"` otherwise.

- **POST /registry/add**: Add an item to the registry.
  - Body: `{ item: string }`
  - Response: `"OK"`

- **POST /registry/remove**: Remove an item from the registry.
  - Body: `{ item: string }`
  - Response: `"OK"`

- **POST /registry/diff**: Compare a submitted set to the current set.
  - Body: `{ items: string[] }`
  - Response: Array of items that are not in the current set.

- **POST /registry/invert**: Invert the current set.
  - Response: `"OK"`

### Example Requests

Using `curl`:

1. **Add an item**:
   ```bash
   curl -X POST http://localhost:3000/registry/add -H "Content-Type: application/json" -d '{"item": "red"}'
   ```

2. **Check an item**:
   ```bash
   curl -X GET http://localhost:3000/registry/check?item=red
   ```

3. **Remove an item**:
   ```bash
   curl -X POST http://localhost:3000/registry/remove -H "Content-Type: application/json" -d '{"item": "red"}'
   ```

4. **Diff items**:
   ```bash
   curl -X POST http://localhost:3000/registry/diff -H "Content-Type: application/json" -d '{"items": ["red", "blue", "green"]}'
   ```

5. **Invert the set**:
   ```bash
   curl -X POST http://localhost:3000/registry/invert
   ```

## Testing

### Unit Tests

To run unit tests:
```bash
npm run test
```

### End-to-End (E2E) Tests

To run end-to-end tests:
```bash
npm run test:e2e
```

### Testing Configuration

#### `src/registry/registry.service.spec.ts`

This file contains unit tests for the `RegistryService` to ensure all service methods work as expected.

#### `src/registry/registry.controller.spec.ts`

This file contains unit tests for the `RegistryController` to validate the interaction between the controller and the service.

#### `test/app.e2e-spec.ts`

This file contains end-to-end tests for the Registry API, testing the full application flow from making HTTP requests to receiving responses.

### Running Redis

Ensure Redis is running locally on the default port (`6379`) before running the tests. You can start Redis using Docker if it's not already running:

```bash
docker run -p 6379:6379 --name redis -d redis
```

## Project Structure

- **src/app.module.ts**: Main application module.
- **src/main.ts**: Entry point for the application, including Swagger setup.
- **src/registry/registry.module.ts**: Module for the registry feature.
- **src/registry/registry.service.ts**: Service layer for registry operations.
- **src/registry/registry.controller.ts**: Controller layer exposing the registry endpoints.
- **test/app.e2e-spec.ts**: End-to-end test cases.