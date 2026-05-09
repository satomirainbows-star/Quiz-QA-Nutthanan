# Quiz QA — Cucumber Automation Project

โปรเจกต์ทดสอบอัตโนมัติสำหรับ Website และ API ด้วย **Cucumber + WebdriverIO** (UI) และ **Axios** (API)

---

## 📋 สารบัญ

1. [สิ่งที่ต้องติดตั้งก่อนใช้งาน](#1-สิ่งที่ต้องติดตั้งก่อนใช้งาน)
2. [ดาวน์โหลดและติดตั้งโปรเจกต์](#2-ดาวน์โหลดและติดตั้งโปรเจกต์)
3. [เตรียม API Server (สำหรับ API Tests)](#3-เตรียม-api-server-สำหรับ-api-tests)
4. [รัน Tests](#4-รัน-tests)
5. [ดู HTML Report](#5-ดู-html-report)
6. [โครงสร้างโปรเจกต์](#6-โครงสร้างโปรเจกต์)
7. [Test Scenarios ทั้งหมด](#7-test-scenarios-ทั้งหมด)
8. [GitHub Actions (CI/CD)](#8-github-actions-cicd)

---

## 1. สิ่งที่ต้องติดตั้งก่อนใช้งาน

ตรวจสอบให้แน่ใจว่าติดตั้งครบทุกอย่างก่อนเริ่มต้น

| เครื่องมือ | Version | ลิงก์ดาวน์โหลด |
|-----------|---------|----------------|
| Node.js | >= 18 | https://nodejs.org |
| npm | >= 9 | ติดตั้งมาพร้อมกับ Node.js |
| Google Chrome | Latest | https://www.google.com/chrome |
| Docker Desktop | Latest | https://www.docker.com/products/docker-desktop |

> **วิธีตรวจสอบว่าติดตั้งแล้วหรือยัง** เปิด Terminal แล้วพิมพ์คำสั่งเหล่านี้
> ```bash
> node -v      # ควรแสดง v18.x.x หรือสูงกว่า
> npm -v       # ควรแสดง 9.x.x หรือสูงกว่า
> docker -v    # ควรแสดง Docker version x.x.x
> ```

---

## 2. ดาวน์โหลดและติดตั้งโปรเจกต์

**ขั้นตอนที่ 1** — Clone โปรเจกต์จาก GitHub มาไว้ที่เครื่อง

```bash
git clone https://github.com/<your-username>/quiz-qa.git
cd quiz-qa
```

**ขั้นตอนที่ 2** — ติดตั้ง dependencies ทั้งหมด (ทำครั้งเดียวตอนแรก)

```bash
npm install
```

> รอสักครู่จนกว่าจะติดตั้งเสร็จ จะเห็นข้อความ `added xxx packages`

---

## 3. เตรียม API Server (สำหรับ API Tests)

> ⚠️ **ต้องทำทุกครั้งก่อนรัน API Tests** — ถ้ารันแค่ UI Tests ข้ามขั้นตอนนี้ได้

**ขั้นตอนที่ 1** — เปิด Docker Desktop ให้รันอยู่ก่อน จากนั้นรันคำสั่งนี้เพื่อเริ่ม API Server

```bash
docker run -d --rm --name qa-practice-api -p 8887:8081 rvancea/qa-practice-api:latest
```

**ขั้นตอนที่ 2** — ตรวจสอบว่า API พร้อมใช้งานแล้ว โดยเปิด Browser ไปที่

```
http://localhost:8887/swagger-ui.html
```

> ถ้าเห็นหน้า Swagger UI แสดงว่า API พร้อมแล้ว ✅

**เมื่อทดสอบเสร็จแล้ว** — หยุด API Server ด้วยคำสั่ง

```bash
docker stop qa-practice-api
```

---

## 4. รัน Tests

### 4.1 รันทั้งหมด (UI + API) — แนะนำสำหรับการทดสอบครบชุด

> ต้องเริ่ม API Server ก่อน (ดูขั้นตอนที่ 3)

```bash
npm test
```

---

### 4.2 รันเฉพาะ UI Tests

ทดสอบการทำงานของ Website อย่างเดียว ไม่ต้องเริ่ม Docker

```bash
npm run test:ui
```

> โดยค่าเริ่มต้น Chrome จะรันแบบ **Headless** (ไม่เปิดหน้าต่าง Browser) เพื่อความเร็ว

---

### 4.3 รัน UI Tests แบบเปิดหน้าต่าง Chrome (Headed Mode)

ใช้เมื่อต้องการ **ดูการทำงานของ Test แบบ Real-time** บนหน้าจอ เหมาะสำหรับ Debug หรือ Demo

```bash
npm run test:ui:headed
```

หรือระบุ `--headed` flag โดยตรง

```bash
npx wdio run wdio.conf.js --spec 'features/ui/**/*.feature' --headed
```

> **หมายเหตุ:** Headed mode จะเปิดหน้าต่าง Chrome ให้เห็นการคลิก กรอกข้อมูล และนำทางแบบ Real-time
> ไม่แนะนำให้ใช้ใน CI/CD เพราะช้ากว่า Headless

---

### 4.4 รันเฉพาะ API Tests

ทดสอบ API อย่างเดียว ต้องเริ่ม Docker ก่อน (ดูขั้นตอนที่ 3)

```bash
npm run test:api
```

---

### 4.5 รันเฉพาะบาง Step หรือบาง Tag

เลือกรันเฉพาะ Test ที่ต้องการโดยใช้ Tag

```bash
# รันเฉพาะ Step 1 (Login)
npx wdio run wdio.conf.js --cucumberOpts.tagExpression="@step1"

# รันเฉพาะ Step 2 (เลือกสินค้า)
npx wdio run wdio.conf.js --cucumberOpts.tagExpression="@step2"

# รันเฉพาะ Step 3 (กรอกข้อมูล Shipping)
npx wdio run wdio.conf.js --cucumberOpts.tagExpression="@step3"

# รันเฉพาะ Step 4 (ตรวจสอบ Address)
npx wdio run wdio.conf.js --cucumberOpts.tagExpression="@step4"

# รันเฉพาะ Positive cases ทั้งหมด
npx wdio run wdio.conf.js --cucumberOpts.tagExpression="@positive"

# รันเฉพาะ Negative cases ทั้งหมด
npx wdio run wdio.conf.js --cucumberOpts.tagExpression="@negative"

# รันเฉพาะ API tests ทั้งหมด
npx wdio run wdio.conf.js --cucumberOpts.tagExpression="@api"
```

---

## 5. ดู HTML Report

หลังจากรัน Tests เสร็จแล้ว สร้าง HTML Report ด้วยคำสั่ง

```bash
npm run report
```

ไฟล์ report จะถูกสร้างใน folder `reports/` โดยตั้งชื่อตาม **วันที่** และ **ครั้งที่รัน** อัตโนมัติ

```
reports/
├── 2026-05-09_run-01/          ← JSON data จากการรันครั้งที่ 1
├── 2026-05-09_run-01_report/   ← HTML report ครั้งที่ 1
│   └── index.html              ← ← เปิดไฟล์นี้ด้วย Browser
├── 2026-05-09_run-02/
├── 2026-05-09_run-02_report/
│   └── index.html
└── ...
```

เปิด `index.html` ใน folder `_report` ด้วย Browser เพื่อดูผลลัพธ์

> Report จะแสดงสรุปผลการทดสอบทั้งหมด พร้อมรายละเอียดแต่ละ Scenario ว่า ✅ Pass หรือ ❌ Fail

---

## 6. โครงสร้างโปรเจกต์

```
quiz-qa/
├── .github/
│   └── workflows/
│       └── qa-tests.yml        # GitHub Actions CI/CD pipeline
├── features/
│   ├── ui/
│   │   └── shop.feature        # UI test scenarios (Step 1–4)
│   └── api/
│       └── employees.feature   # API test scenarios (POST & GET)
├── step-definitions/
│   ├── ui.steps.js             # โค้ดขั้นตอนการทดสอบ UI
│   └── api.steps.js            # โค้ดขั้นตอนการทดสอบ API
├── support/
│   ├── selectors.js            # CSS selectors สำหรับระบุ Element บนหน้าเว็บ
│   └── hooks.js                # Setup และ Teardown ก่อน/หลังแต่ละ Scenario
├── reports/                    # ผลลัพธ์ JSON และ HTML report
├── generate-report.js          # Script สร้าง HTML report
├── wdio.conf.js                # WebdriverIO configuration
└── package.json                # Dependencies และ npm scripts
```

**อธิบายแต่ละส่วน:**

| โฟลเดอร์/ไฟล์ | หน้าที่ |
|--------------|--------|
| `features/` | เขียน Test Scenarios ด้วยภาษา Gherkin (Given/When/Then) |
| `step-definitions/` | โค้ด JavaScript ที่แปลง Gherkin เป็นการกระทำจริง |
| `support/selectors.js` | เก็บ CSS Selector ของ Element ต่าง ๆ บนหน้าเว็บ |
| `support/hooks.js` | รันโค้ด Setup/Teardown อัตโนมัติก่อน-หลังแต่ละ Test |
| `wdio.conf.js` | ตั้งค่า Browser, Framework, Reporter |
| `reports/` | เก็บผลลัพธ์การทดสอบในรูปแบบ JSON และ HTML |

---

## 7. Test Scenarios ทั้งหมด

### UI Tests — https://qa-practice.razvanvancea.ro/auth_ecommerce.html

| Tag | Scenario | ประเภท |
|-----|----------|--------|
| `@step1` | Login ด้วย Email และ Password ที่ถูกต้อง | ✅ Positive |
| `@step1` | Login ด้วย Email และ Password ที่ผิด | ❌ Negative |
| `@step2` | เลือกสินค้า Dior ×2 และ Gucci ×3 พร้อมตรวจสอบราคารวม | ✅ Positive |
| `@step2` | กดปุ่ม Proceed to Checkout | ✅ Positive |
| `@step3` | กรอกข้อมูล Shipping ครบทุก Field แล้ว Submit | ✅ Positive |
| `@step3` | กรอกข้อมูล Shipping ไม่ครบแล้ว Submit | ❌ Negative |
| `@step4` | ตรวจสอบ Address แสดงในรูปแบบ `Street, City - Country` | ✅ Positive |

### API Tests — http://localhost:8887/swagger-ui.html

| Tag | Endpoint | Scenario | ประเภท |
|-----|----------|----------|--------|
| `@post` | POST `/api/v1/employees` | สร้าง Employee สำเร็จ → 201 | ✅ Positive |
| `@post` | POST `/api/v1/employees` | Email format ผิด → 400 + defaultMessage | ❌ Negative |
| `@get` | GET `/api/v1/employees/{id}` | ค้นหา Employee ที่มีอยู่ → 200 | ✅ Positive |
| `@get` | GET `/api/v1/employees/{id}` | ค้นหา Employee ที่ไม่มีอยู่ → 404 + message | ❌ Negative |

### Test Accounts (UI)

| Email | Password | หมายเหตุ |
|-------|----------|---------|
| `admin@admin.com` | `admin123` | บัญชีที่ใช้งานได้ (Valid) |
| `wrong@wrong.com` | `wrong123` | บัญชีที่ใช้ไม่ได้ สำหรับ Negative Test |

---

## 8. GitHub Actions (CI/CD)

Pipeline จะทำงานอัตโนมัติทุกครั้งที่มีการ **Push** หรือ **Pull Request** ไปที่ branch `main`

**ขั้นตอนที่ Pipeline ทำงาน:**

| ลำดับ | ขั้นตอน | รายละเอียด |
|-------|---------|-----------|
| 1 | Checkout code | ดึงโค้ดล่าสุดจาก GitHub |
| 2 | Setup Node.js 20 | ติดตั้ง Node.js environment |
| 3 | `npm ci` | ติดตั้ง dependencies |
| 4 | Start Docker | เริ่ม API Server สำหรับ API Tests |
| 5 | `npm test` | รัน Tests ทั้งหมด |
| 6 | `npm run report` | สร้าง HTML Report |
| 7 | Upload Artifact | อัปโหลด Report ให้ดาวน์โหลดได้ |

**วิธีดู Report จาก GitHub Actions:**

1. ไปที่ Tab **Actions** ใน GitHub Repository
2. คลิกที่ Workflow run ล่าสุด
3. เลื่อนลงไปที่ส่วน **Artifacts**
4. คลิก **cucumber-html-report** เพื่อดาวน์โหลด
