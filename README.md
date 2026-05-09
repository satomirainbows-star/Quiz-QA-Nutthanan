# Quiz QA — Automation Testing Project

โปรเจกต์ทดสอบอัตโนมัติสำหรับ Web UI และ REST API โดยใช้แนวทาง Behavior-Driven Development (BDD) ด้วย Cucumber

รองรับทั้ง:

* ✅ UI Automation Testing
* ✅ API Automation Testing
* ✅ HTML Reporting
* ✅ GitHub Actions CI/CD
* ✅ Docker-based API Integration Testing

---

# 🚀 Technologies Used

| Layer           | Technology                    |
| --------------- | ----------------------------- |
| UI Automation   | WebdriverIO                   |
| API Automation  | Axios                         |
| BDD Framework   | Cucumber                      |
| Assertions      | Node.js Assert                |
| Reporting       | cucumberjs-json + HTML Report |
| CI/CD           | GitHub Actions                |
| API Environment | Docker                        |
| Runtime         | Node.js                       |

---

# 🏗 Project Architecture

โปรเจกต์นี้ออกแบบให้แยก UI Tests และ API Tests ออกจากกันอย่างชัดเจน เพื่อให้:

* ลด flaky tests
* รันบน CI/CD ได้เสถียร
* ดูแลรักษาง่าย
* scale automation ได้ในอนาคต

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

# ⚙️ CI Stability Improvements

โปรเจกต์นี้มีการปรับแต่งสำหรับ GitHub Actions และ Linux runner โดยเฉพาะ

### ✔ Chrome Headless Mode

ใช้ Chrome แบบ headless เพื่อลด resource usage และเพิ่มความเร็วในการรัน

### ✔ Dedicated Config Separation

แยก config ระหว่าง:

* `wdio.ui.conf.js`
* `wdio.api.conf.js`

ช่วยลดปัญหา browser capability conflict

### ✔ Worker Limitation

จำกัดจำนวน workers เพื่อป้องกัน flaky tests บน shared CI runner

```js
maxInstances: 1
workers: 1
```

### ✔ Automatic Screenshot Capture

เมื่อ UI test fail ระบบจะ capture screenshot อัตโนมัติ

```text
reports/error-<timestamp>.png
```

### ✔ Dockerized API Testing

API tests ใช้ Docker container เพื่อให้ environment เหมือนกันทุกครั้ง

---

# 📦 Prerequisites

กรุณาติดตั้งเครื่องมือดังต่อไปนี้ก่อนเริ่มใช้งาน

| Tool           | Required Version |
| -------------- | ---------------- |
| Node.js        | >= 18            |
| npm            | >= 9             |
| Google Chrome  | Latest           |
| Docker Desktop | Latest           |

---

# 🔍 Verify Installation

ตรวจสอบว่า environment พร้อมใช้งาน

```bash
node -v
npm -v
docker -v
```

ตัวอย่าง:

```bash
v20.x.x
9.x.x
Docker version xx.x.x
```

---

# 📥 Installation

## 1. Clone Repository

```bash
git clone https://github.com/<your-username>/quiz-qa.git
cd quiz-qa
```

---

## 2. Install Dependencies

```bash
npm install
```

---

# 🐳 API Server Setup

API tests จำเป็นต้องใช้ Docker container

## Start API Server

```bash
docker run -d --rm \
--name qa-practice-api \
-p 8887:8081 \
rvancea/qa-practice-api:latest
```

---

## Verify API Server

เปิด browser ไปที่:

```text
http://localhost:8887/swagger-ui.html
```

หากเห็น Swagger UI แสดงว่า API พร้อมใช้งาน

---

## Stop API Server

```bash
docker stop qa-practice-api
```

---

# ▶ Running Tests

# Run All Tests

```bash
npm test
```

รันทั้ง:

* UI Tests
* API Tests

---

# Run UI Tests Only

```bash
npm run test:ui
```

ใช้ Chrome Headless mode โดยอัตโนมัติ

---

# Run UI Tests (Headed Mode)

สำหรับ debug หรือ demo

```bash
npm run test:ui:headed
```

หรือ

```bash
npx wdio run wdio.ui.conf.js --headed
```

---

# Run API Tests Only

```bash
npm run test:api
```

> ต้อง start Docker API server ก่อน

---

# 🎯 Run By Tags

รองรับการรันแบบ selective execution

## Run Login Tests

```bash
npx wdio run wdio.ui.conf.js --cucumberOpts.tagExpression="@step1"
```

## Run Cart Tests

```bash
npx wdio run wdio.ui.conf.js --cucumberOpts.tagExpression="@step2"
```

## Run Shipping Tests

```bash
npx wdio run wdio.ui.conf.js --cucumberOpts.tagExpression="@step3"
```

## Run Validation Tests

```bash
npx wdio run wdio.ui.conf.js --cucumberOpts.tagExpression="@step4"
```

## Run Positive Tests

```bash
npx wdio run wdio.ui.conf.js --cucumberOpts.tagExpression="@positive"
```

## Run Negative Tests

```bash
npx wdio run wdio.ui.conf.js --cucumberOpts.tagExpression="@negative"
```

## Run API Tests By Tag

```bash
npx wdio run wdio.api.conf.js --cucumberOpts.tagExpression="@api"
```

---

# 📊 HTML Reporting

หลังจากรัน tests เสร็จ:

```bash
npm run report
```

---

# 📁 Report Structure

ระบบจะสร้าง report แยกตาม:

* วันที่
* รอบการรัน

ตัวอย่าง:

```text
reports/
├── 2026-05-09_run-01/
├── 2026-05-09_run-01_report/
│   └── index.html
├── 2026-05-09_run-02/
└── ...
```

---

# 🖼 Failure Screenshots

เมื่อ UI tests fail:

```text
reports/error-<timestamp>.png
```

จะถูกสร้างอัตโนมัติ

---

# 📂 Project Structure

```text
quiz-qa/
├── .github/
│   └── workflows/
│       └── qa-tests.yml
│
├── features/
│   ├── ui/
│   │   └── shop.feature
│   └── api/
│       └── employees.feature
│
├── step-definitions/
│   ├── ui.steps.js
│   └── api.steps.js
│
├── support/
│   ├── hooks.js
│   └── selectors.js
│
├── reports/
│
├── generate-report.js
├── wdio.ui.conf.js
├── wdio.api.conf.js
├── package.json
└── README.md
```

---

# 🧪 Test Coverage

# UI Test Coverage

เว็บไซต์:

```text
https://qa-practice.razvanvancea.ro/auth_ecommerce.html
```

| Area                  | Coverage |
| --------------------- | -------- |
| Login Validation      | ✅        |
| Product Selection     | ✅        |
| Cart Total Validation | ✅        |
| Checkout Navigation   | ✅        |
| Shipping Validation   | ✅        |
| Address Validation    | ✅        |

---

# API Test Coverage

API:

```text
http://localhost:8887/swagger-ui.html
```

| Endpoint                 | Validation |
| ------------------------ | ---------- |
| POST /employees          | ✅          |
| GET /employees/{id}      | ✅          |
| Status Code Validation   | ✅          |
| Error Message Validation | ✅          |

---

# 🔄 GitHub Actions CI/CD

Workflow จะทำงานอัตโนมัติเมื่อ:

* push ไปที่ `main`
* pull request เข้า `main`

---

# CI Pipeline Steps

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

# 📥 Download Reports From GitHub Actions

1. เปิดแท็บ **Actions**
2. เลือก workflow ล่าสุด
3. ไปที่ section **Artifacts**
4. ดาวน์โหลด report

---

# 🧠 Design Decisions

## Why Separate UI/API Config?

เพื่อ:

* ลด dependency conflict
* ลด browser startup สำหรับ API tests
* ทำให้ CI เร็วขึ้น
* แยก responsibility ชัดเจน

---

## Why Axios For API Testing?

เพราะ:

* lightweight
* เร็วกว่า browser-based API testing
* เหมาะกับ integration testing
* maintain ง่าย

---

## Why Single Worker?

ลด flaky tests บน CI environments

```js
workers: 1
```

---

# 👨‍💻 Author

Nutthanan — QA Automation Engineer

---

# 📌 GitHub Actions Status

[![QA Tests](https://github.com/satomirainbows-star/Quiz-QA-Nutthanan/actions/workflows/qa-tests.yml/badge.svg)](https://github.com/satomirainbows-star/Quiz-QA-Nutthanan/actions/workflows/qa-tests.yml)
