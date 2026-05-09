@ui
Feature: ทดสอบระบบ E-Commerce Shop (UI)
  เว็บไซต์ทดสอบ: https://qa-practice.razvanvancea.ro/auth_ecommerce.html
  ครอบคลุม: Login, เลือกสินค้า, กรอกที่อยู่จัดส่ง, ตรวจสอบที่อยู่

  Background:
    Given I navigate to the shop login page

  # ════════════════════════════════════════════════════════
  #  STEP 1 — เข้าสู่ระบบ (Login)
  # ════════════════════════════════════════════════════════

  @step1 @positive
  Scenario: [Step 1 - Positive] เข้าสู่ระบบด้วย Email และ Password ที่ถูกต้อง
    When I login with username "admin@admin.com" and password "admin123"
    Then I should see the products page

  @step1 @negative
  Scenario: [Step 1 - Negative] เข้าสู่ระบบด้วย Email และ Password ที่ไม่ถูกต้อง
    When I login with username "wrong@wrong.com" and password "wrong123"
    Then I should see a login error message

  # ════════════════════════════════════════════════════════
  #  STEP 2 — เลือกสินค้าและตรวจสอบราคารวม
  # ════════════════════════════════════════════════════════

  @step2 @positive
  Scenario: [Step 2 - Positive] เลือกสินค้า Dior x2 และ Gucci x3 แล้วตรวจสอบราคารวมถูกต้อง
    When I login with username "admin@admin.com" and password "admin123"
    And I add 2 units of "Dior J'adore"
    And I add 3 units of "Gucci Bloom Eau de"
    Then the total cost should equal the sum of item prices times quantities

  @step2 @positive
  Scenario: [Step 2 - Positive] กดปุ่ม Proceed to Checkout เพื่อไปหน้ากรอกที่อยู่จัดส่ง
    When I login with username "admin@admin.com" and password "admin123"
    And I add 2 units of "Dior J'adore"
    And I add 3 units of "Gucci Bloom Eau de"
    And I click Proceed to Checkout
    Then I should see the shopping details form

  # ════════════════════════════════════════════════════════
  #  STEP 3 — กรอกข้อมูลที่อยู่จัดส่ง (Shipping Details)
  # ════════════════════════════════════════════════════════

  @step3 @positive
  Scenario: [Step 3 - Positive] กรอกข้อมูลที่อยู่จัดส่งครบทุกช่อง สามารถ Submit Order ได้สำเร็จ
    When I login with username "admin@admin.com" and password "admin123"
    And I add 2 units of "Dior J'adore"
    And I click Proceed to Checkout
    And I fill in all required shipping fields
    Then I should be able to submit the order successfully

  @step3 @negative
  Scenario: [Step 3 - Negative] ไม่กรอกข้อมูลที่อยู่จัดส่ง ระบบต้องไม่ยอมให้ Submit Order
    When I login with username "admin@admin.com" and password "admin123"
    And I add 2 units of "Dior J'adore"
    And I click Proceed to Checkout
    And I submit the order without filling required fields
    Then the order submission should be prevented

  # ════════════════════════════════════════════════════════ 
  #  STEP 4 — ตรวจสอบข้อความยืนยันคำสั่งซื้อ
  # ════════════════════════════════════════════════════════

@step4 @positive
Scenario: [Step 4 - Positive] ตรวจสอบ Validation ของข้อความยืนยันคำสั่งซื้อและที่อยู่จัดส่ง
  When I login with username "admin@admin.com" and password "admin123"
  And I add 2 units of "Dior J'adore"
  And I click Proceed to Checkout
  And I fill in all required shipping fields
  And I submit the order successfully
  Then the order confirmation message should be displayed correctly
  And the displayed address should match "Street, City - Country" format
