const { Given, When, Then } = require('@wdio/cucumber-framework');
const { expect } = require('@wdio/globals');
const axios = require('axios');

const API_BASE = 'http://localhost:8887/api/v1';

const validEmployee = () => ({
  firstName: 'Test',
  lastName: 'User',
  email: `test.user.${Date.now()}@example.com`
});

// ─── POST /api/v1/employees ───────────────────────────────────────────────────

When('I send a POST request to {string} with valid employee data', async (endpoint) => {
  try {
    const res = await axios.post(`${API_BASE}${endpoint}`, validEmployee());
    global.scenarioContext.response = { status: res.status, data: res.data };
  } catch (err) {
    global.scenarioContext.response = {
      status: err.response?.status,
      data: err.response?.data
    };
  }
});

When('I send a POST request to {string} with invalid email {string}', async (endpoint, invalidEmail) => {
  try {
    const payload = { ...validEmployee(), email: invalidEmail };
    const res = await axios.post(`${API_BASE}${endpoint}`, payload);
    global.scenarioContext.response = { status: res.status, data: res.data };
  } catch (err) {
    global.scenarioContext.response = {
      status: err.response?.status,
      data: err.response?.data
    };
  }
});

// ─── GET /api/v1/employees/{id} ───────────────────────────────────────────────

Given('an employee exists in the system', async () => {
  // POST returns 201 with empty body — fetch all employees and use the last id
  await axios.post(`${API_BASE}/employees`, validEmployee());
  const listRes = await axios.get(`${API_BASE}/employees`);
  const employees = listRes.data;
  global.scenarioContext.existingId = employees[employees.length - 1].id;
});

When('I send a GET request to {string} with the existing id', async (endpoint) => {
  const id = global.scenarioContext.existingId;
  const url = endpoint.replace('{id}', id);
  try {
    const res = await axios.get(`${API_BASE}${url}`);
    global.scenarioContext.response = { status: res.status, data: res.data };
  } catch (err) {
    global.scenarioContext.response = {
      status: err.response?.status,
      data: err.response?.data
    };
  }
});

When('I send a GET request to {string}', async (endpoint) => {
  try {
    const res = await axios.get(`${API_BASE}${endpoint}`, {
      // Accept plain text for 404 responses
      validateStatus: () => true,
      responseType: 'text',
      transformResponse: [(data) => data]
    });
    global.scenarioContext.response = { status: res.status, data: res.data };
  } catch (err) {
    global.scenarioContext.response = {
      status: err.response?.status,
      data: err.response?.data
    };
  }
});

// ─── Shared Assertions ────────────────────────────────────────────────────────

Then('the response status code should be {int}', async (expectedStatus) => {
  expect(global.scenarioContext.response.status).toBe(expectedStatus);
});

Then('the response should contain defaultMessage {string}', async (expectedMsg) => {
  const data = global.scenarioContext.response.data;
  const errors = data?.errors || data?.fieldErrors || [];
  const messages = errors.map(e => e.defaultMessage || e.message || '');
  const found = messages.some(m => m.includes(expectedMsg));
  expect(found).toBe(true);
});

Then('the response body message should be {string}', async (expectedMsg) => {
  // 404 returns plain text: "Employee not found with ID 99999"
  const data = global.scenarioContext.response.data;
  const actual = typeof data === 'string' ? data : (data?.message || data?.error || '');
  expect(actual).toContain(expectedMsg);
});
