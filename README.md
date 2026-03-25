# Banco Carrefour — API Test Automation

![API Tests](https://github.com/filipeCardorso/banco-carrefour-api-tests/actions/workflows/api-tests.yml/badge.svg)

Automated API tests for the ServeRest API, covering user CRUD operations, JWT authentication, contract validation, security, and idempotency.

## Language Note

The ServeRest API uses Portuguese endpoints (`/usuarios`, `/login`) and returns Portuguese messages. Test assertions validate these Portuguese strings as they are the actual API responses.

## Tech Stack

| Component | Tool |
|---|---|
| Language | JavaScript (ES6+) |
| Test Framework | Jest |
| HTTP Client | SuperTest |
| Fake Data | @faker-js/faker |
| Contract Validation | jest-json-schema |
| Reports | jest-html-reporters + jest-junit |
| CI/CD | GitHub Actions |
| Local Environment | Docker Compose |

## Prerequisites

- Node.js 20+
- npm 9+
- Docker and Docker Compose (optional, for local environment)

## Installation

```bash
git clone https://github.com/filipeCardorso/banco-carrefour-api-tests.git
cd banco-carrefour-api-tests
npm install
cp .env.example .env
```

## Running Tests

### Mode 1 — Public API (default)

```bash
npm test
```

Runs against `https://serverest.dev`.

### Mode 2 — Isolated Local Environment (Docker)

```bash
docker-compose up --abort-on-container-exit
```

Spins up ServeRest locally and runs all tests in isolated containers. Zero external API dependency.

### Running Specific Suites

```bash
npm run test:login        # Authentication tests
npm run test:users        # User CRUD tests
npm run test:contracts    # Contract validation tests
npm run test:security     # Security and authentication tests
npm run test:idempotency  # Idempotency tests
```

## Project Structure

```
├── src/
│   ├── config/           # Environment variables and constants
│   ├── services/         # Service Objects (encapsulate HTTP calls)
│   ├── factories/        # Factory Pattern (test data generation)
│   ├── schemas/          # JSON Schemas (contract validation)
│   └── utils/            # Request wrapper and cleanup helpers
├── tests/
│   ├── auth/             # Login tests
│   ├── users/            # CRUD tests (create, list, get, update, delete)
│   ├── contracts/        # Contract tests (schema validation)
│   ├── security/         # Authentication and HTTP method tests
│   └── idempotency/      # Idempotency tests (DELETE and PUT)
├── reports/              # Generated reports (HTML + JUnit XML)
├── .github/workflows/    # CI/CD pipeline
├── docker-compose.yml    # Local environment with ServeRest
└── Dockerfile
```

## Test Scenarios

### POST /login (7 scenarios)
- Valid login, unregistered email, wrong password, required fields, invalid email format

### POST /usuarios (13 scenarios)
- Basic CRUD, field validation, duplicate email, SQL injection, XSS, oversized payload, invalid Content-Type

### GET /usuarios (4 scenarios)
- Full listing, query parameter filters, unknown query parameter

### GET /usuarios/{_id} (3 scenarios)
- Get by ID, non-existent ID, invalid ID format

### PUT /usuarios/{_id} (10 scenarios)
- Update, create via PUT, duplicate email, own email, security (SQL injection, XSS)

### DELETE /usuarios/{_id} (3 scenarios)
- Delete, non-existent ID, user with active cart

### Contract (9 scenarios)
- JSON Schema validation for all success and error responses

### Authentication (3 scenarios)
- Missing token, invalid token, expired token (via /carrinhos endpoint)

### Idempotency (2 scenarios)
- Consecutive DELETE and PUT on the same resource

### Security (1 scenario)
- Unsupported HTTP method (PATCH -> 405)

**Total: 55 test scenarios**

## Design Patterns

- **Service Object** — encapsulates HTTP calls per resource
- **Factory Pattern** — generates test payloads with dynamic data
- **Data-Driven Testing** — `describe.each` for parameterized scenarios
- **Centralized Constants** — API messages defined in a single place

## Reports

After execution, reports are available in `reports/`:
- `report.html` — visual HTML report
- `junit.xml` — JUnit format for CI integration

In the GitHub Actions pipeline, reports are uploaded as artifacts and displayed inline on PRs via test-reporter.

## CI/CD Pipeline

The pipeline runs automatically on:
- Push to `main` or `develop`
- Pull requests targeting `main`
- Manual execution (workflow_dispatch)

## Technical Decisions

- **`--runInBand`**: Tests run serially to avoid interference between specs that create/delete data on the same shared API.
- **`/usuarios` endpoints do not require a JWT token**: Discovered during API exploration. Authentication tests target the `/carrinhos` endpoint, which actually enforces token validation.
- **Security tests validate absence of side effects**: ServeRest accepts payloads with SQL injection and XSS (201). Tests verify that the API remains intact after injection.
- **Rate limiting not enforced**: ServeRest does not implement rate limiting on the public API, so rate limit tests were intentionally omitted.
