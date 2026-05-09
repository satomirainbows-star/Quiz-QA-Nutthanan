@api
Feature: ทดสอบระบบ Employee API (Backend)
  API Server: http://localhost:8887/swagger-ui.html
  ครอบคลุม: สร้างพนักงาน (POST), ค้นหาพนักงาน (GET)

  # ════════════════════════════════════════════════════════
  #  POST /api/v1/employees — สร้างข้อมูลพนักงานใหม่
  # ════════════════════════════════════════════════════════

  @post @positive
  Scenario: [POST - Positive] สร้างพนักงานใหม่ด้วยข้อมูลถูกต้อง ระบบต้องตอบกลับ 201 Created
    When I send a POST request to "/employees" with valid employee data
    Then the response status code should be 201

  @post @negative
  Scenario: [POST - Negative] สร้างพนักงานด้วย Email ผิดรูปแบบ ระบบต้องตอบกลับ 400 พร้อม error message
    When I send a POST request to "/employees" with invalid email "not-an-email"
    Then the response status code should be 400
    And the response should contain defaultMessage "must be a well-formed email address"

  # ════════════════════════════════════════════════════════
  #  GET /api/v1/employees/{id} — ค้นหาพนักงานตาม ID
  # ════════════════════════════════════════════════════════

  @get @positive
  Scenario: [GET - Positive] ค้นหาพนักงานที่มีอยู่ในระบบ ต้องตอบกลับ 200 พร้อมข้อมูลพนักงาน
    Given an employee exists in the system
    When I send a GET request to "/employees/{id}" with the existing id
    Then the response status code should be 200

  @get @negative
  Scenario: [GET - Negative] ค้นหาพนักงานที่ไม่มีในระบบ ต้องตอบกลับ 404 พร้อมข้อความแจ้งเตือน
    When I send a GET request to "/employees/99999"
    Then the response status code should be 404
    And the response body message should be "Employee not found with ID 99999"
