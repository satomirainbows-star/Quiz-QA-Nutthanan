# QA Automation Testing Framework

![Node.js](https://img.shields.io/badge/Node.js-20.x-green)
![WebdriverIO](https://img.shields.io/badge/WebdriverIO-v9-orange)
![Cucumber](https://img.shields.io/badge/Cucumber-BDD-brightgreen)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue)
[![CI](https://github.com/satomirainbows-star/Quiz-QA-Nutthanan/actions/workflows/qa-tests.yml/badge.svg)](https://github.com/satomirainbows-star/Quiz-QA-Nutthanan/actions/workflows/qa-tests.yml)

A scalable QA automation framework for Web UI and REST API testing using WebdriverIO, Cucumber, Docker, and GitHub Actions.

---

## Overview

The framework provides scalable, maintainable, and CI-friendly automation testing for both Web UI and REST API validation, with a strong focus on execution stability and test isolation.

---

## Quick Start

```bash
git clone https://github.com/satomirainbows-star/Quiz-QA-Nutthanan.git
cd Quiz-QA-Nutthanan

npm install

docker run -d --rm \
  --name qa-practice-api \
  -p 8887:8081 \
  rvancea/qa-practice-api:latest

npm test
```

---

## Features

* Web UI automation with WebdriverIO
* REST API testing with Axios
* BDD implementation using Cucumber
* Dockerized API environment
* HTML report generation
* Headless browser execution
* Automatic failure screenshots
* CI stability-focused execution design
* Isolated browser state management

---

## Tech Stack

| Layer            | Technology                    |
| ---------------- | ----------------------------- |
| UI Automation    | WebdriverIO                   |
| API Automation   | Axios                         |
| BDD Framework    | Cucumber                      |
| Assertions       | Node.js assert module         |
| Reporting        | cucumberjs-json + HTML Report |
| CI/CD            | GitHub Actions                |
| Containerization | Docker                        |
| Runtime          | Node.js                       |

---

## Architecture

```text
UI Layer
 └── WebdriverIO + Chrome Headless

API Layer
 └── Axios HTTP Client

BDD Layer
 └── Cucumber Feature Files

Execution Layer
 └── WDIO Runner

Reporting Layer
 └── JSON Report → HTML Report

CI/CD Layer
 └── GitHub Actions
```

---

## Framework Patterns

* Reusable step definitions
* Shared support utilities
* Configuration separation by test type

---

## Design Decisions

### Separate UI and API Configurations

UI and API tests use separate execution configurations:

```text
wdio.ui.conf.js
wdio.api.conf.js
```

Benefits:

* Reduced execution conflicts
* Faster CI execution
* Clear separation of responsibilities
* Reduced browser dependency overhead

---

### Explicit Wait Strategy

Explicit waits are used instead of implicit waits to improve UI test stability.

```js
waitForDisplayed()
browser.waitUntil()
```

This approach helps reduce:

* Timing-related failures
* Stale element references
* Flaky test behavior

---

### Controlled Worker Execution

Worker execution is intentionally limited to improve stability on shared CI runners.

```js
workers: 1
maxInstances: 1
```

---

### Browser State Isolation

Browser state is automatically cleaned before and after each scenario:

* localStorage
* sessionStorage
* browser cookies

This prevents state leakage between test scenarios.

---

### Dockerized API Environment

API tests run inside a Dockerized environment to ensure consistency across executions.

Benefits:

* Reproducible
* Isolated
* Portable
* CI-friendly

---

## Test Strategy

The framework separates UI and API testing to provide:

* Maintainability
* Execution speed
* CI stability
* Debugging efficiency
* Test isolation

### Flaky Test Prevention

Several stability-focused practices were implemented:

* Explicit wait strategies
* Browser state cleanup
* Controlled worker execution
* Headless CI optimization
* Scenario isolation

---

## Prerequisites

| Tool           | Required Version |
| -------------- | ---------------- |
| Node.js        | >= 18            |
| npm            | >= 9             |
| Google Chrome  | Latest           |
| Docker Desktop | Latest           |

---

## Installation

### Clone Repository

```bash
git clone https://github.com/satomirainbows-star/Quiz-QA-Nutthanan.git
cd Quiz-QA-Nutthanan
```
### Install Dependencies

```bash
npm install
```

---

## API Server Setup

### Start API Server

```bash
docker run -d --rm \
  --name qa-practice-api \
  -p 8887:8081 \
  rvancea/qa-practice-api:latest
```

### Verify API Server

```text
http://localhost:8887/swagger-ui.html
```

### Stop API Server

```bash
docker stop qa-practice-api
```

---

## Running Tests

### Run All Tests

```bash
npm test
```

### Run UI Tests

```bash
npm run test:ui
```

### Run UI Tests (Headed Mode)

```bash
npm run test:ui:headed
```

or

```bash
npx wdio run wdio.ui.conf.js --headed
```

### Run API Tests

```bash
npm run test:api
```

---

## Run Tests by Tags

```bash
# Login Tests
npx wdio run wdio.ui.conf.js --cucumberOpts.tags="@step1"

# Product Tests
npx wdio run wdio.ui.conf.js --cucumberOpts.tags="@step2"

# Shipping Tests
npx wdio run wdio.ui.conf.js --cucumberOpts.tags="@step3"

# Address Validation Tests
npx wdio run wdio.ui.conf.js --cucumberOpts.tags="@step4"

# API Tests
npx wdio run wdio.api.conf.js --cucumberOpts.tags="@api"
```

---

## Reporting

Generate the HTML report:

```bash
npm run report
```

---

## Project Structure

```text
Quiz-QA-Nutthanan/
├── .github/
│   └── workflows/
│       └── qa-tests.yml
├── features/
│   ├── ui/
│   └── api/
├── step-definitions/
├── support/
├── reports/
├── generate-report.js
├── wdio.ui.conf.js
├── wdio.api.conf.js
├── package.json
└── README.md
```

---

## Test Scope

### UI Test Coverage

| Area                  | Coverage |
| --------------------- | -------- |
| Login Validation      | ✅        |
| Product Selection     | ✅        |
| Cart Total Validation | ✅        |
| Checkout Navigation   | ✅        |
| Shipping Validation   | ✅        |
| Address Validation    | ✅        |

### API Validation Coverage

| Endpoint                 | Validation |
| ------------------------ | ---------- |
| POST /employees          | ✅          |
| GET /employees/{id}      | ✅          |
| Status Code Validation   | ✅          |
| Error Message Validation | ✅          |

---

## GitHub Actions CI/CD

The workflow automatically runs on:

* Push to `main`
* Pull requests targeting `main`

### CI/CD Pipeline

This project uses GitHub Actions to:

- Install dependencies
- Start Docker API server
- Run UI automation tests
- Run API automation tests
- Generate HTML reports
- Upload test artifacts

### CI Pipeline

| Step                 | Description          |
| -------------------- | -------------------- |
| Checkout             | Download source code |
| Setup Node.js        | Install Node.js 20   |
| Install Dependencies | npm ci               |
| Start API Container  | Docker               |
| Run Tests            | UI + API             |
| Generate Report      | HTML report          |
| Upload Artifact      | Store reports        |

---

## Future Improvements

* Retry strategy optimization for flaky environments
* Test data management strategy
* Allure reporting integration
* API contract/schema validation

---

