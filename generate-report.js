const fs = require('fs');
const path = require('path');

const reportsDir = path.join(__dirname, 'reports');

// ── หา folder ล่าสุด ─────────────────────────────────────────────────────────
const folders = fs
  .readdirSync(reportsDir)
  .filter(f => {
    const full = path.join(reportsDir, f);
    return fs.statSync(full).isDirectory() && !f.endsWith('_report');
  })
  .sort()
  .reverse();

if (folders.length === 0) {
  console.error('❌ ไม่พบ folder ผลทดสอบใน reports/ กรุณารัน npm test ก่อน');
  process.exit(1);
}

const latestFolder = folders[0];
const jsonDir = path.join(reportsDir, latestFolder);
const outputFile = path.join(reportsDir, `${latestFolder}_report.html`);

// ── อ่าน JSON ทุกไฟล์ใน folder ──────────────────────────────────────────────
const allFeatures = fs
  .readdirSync(jsonDir)
  .filter(f => f.endsWith('.json'))
  .flatMap(f => {
    try { return JSON.parse(fs.readFileSync(path.join(jsonDir, f), 'utf8')); }
    catch { return []; }
  });

// ── Helper functions ─────────────────────────────────────────────────────────
const ns = d => (d / 1e9).toFixed(2) + 's';

function scenarioStatus(scenario) {
  const steps = (scenario.steps || []).filter(s => s.keyword !== 'Before' && s.keyword !== 'After');
  if (steps.some(s => s.result?.status === 'failed')) return 'failed';
  if (steps.some(s => s.result?.status === 'pending' || s.result?.status === 'skipped')) return 'skipped';
  return 'passed';
}

function featureStats(feature) {
  const scenarios = feature.elements || [];
  const passed = scenarios.filter(s => scenarioStatus(s) === 'passed').length;
  const failed = scenarios.filter(s => scenarioStatus(s) === 'failed').length;
  const total = scenarios.length;
  return { passed, failed, total };
}

function totalStats(features) {
  return features.reduce((acc, f) => {
    const s = featureStats(f);
    acc.passed += s.passed;
    acc.failed += s.failed;
    acc.total += s.total;
    return acc;
  }, { passed: 0, failed: 0, total: 0 });
}

function getStepLabel(tags) {
  const tagNames = (tags || []).map(t => t.name);
  if (tagNames.includes('@step1')) return { num: '1', label: 'เข้าสู่ระบบ (Login)' };
  if (tagNames.includes('@step2')) return { num: '2', label: 'เลือกสินค้า (Select Items)' };
  if (tagNames.includes('@step3')) return { num: '3', label: 'กรอกที่อยู่จัดส่ง (Shipping Details)' };
  if (tagNames.includes('@step4')) return { num: '4', label: 'ตรวจสอบที่อยู่ (Verify Address)' };
  if (tagNames.includes('@post')) return { num: 'POST', label: 'สร้างพนักงาน (POST /employees)' };
  if (tagNames.includes('@get')) return { num: 'GET', label: 'ค้นหาพนักงาน (GET /employees/{id})' };
  return { num: '-', label: '' };
}

function isPositive(tags) {
  return (tags || []).some(t => t.name === '@positive');
}

// ── วันที่และเวลา ─────────────────────────────────────────────────────────────
const [datePart, runPart] = latestFolder.split('_');
const runNum = runPart?.replace('run-', '') || '01';
const now = new Date();
const executedAt = now.toLocaleString('th-TH', {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: '2-digit', minute: '2-digit', second: '2-digit'
});

const stats = totalStats(allFeatures);
const passRate = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;

// ── สร้าง HTML ────────────────────────────────────────────────────────────────
function renderSteps(steps) {
  const visible = steps.filter(s => s.keyword !== 'Before' && s.keyword !== 'After');
  return visible.map(step => {
    const status = step.result?.status || 'skipped';
    const icon = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⏭️';
    const dur = step.result?.duration ? ns(step.result.duration) : '';
    const errMsg = step.result?.error_message
      ? `<div class="step-error">${step.result.error_message.split('\n')[0]}</div>`
      : '';
    return `
      <div class="step step-${status}">
        <span class="step-icon">${icon}</span>
        <span class="step-keyword">${step.keyword}</span>
        <span class="step-name">${step.name || ''}</span>
        ${dur ? `<span class="step-dur">${dur}</span>` : ''}
        ${errMsg}
      </div>`;
  }).join('');
}

function renderScenarios(feature) {
  return (feature.elements || []).map((scenario, idx) => {
    const status = scenarioStatus(scenario);
    const icon = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⏭️';
    const positive = isPositive(scenario.tags);
    const typeLabel = positive
      ? '<span class="badge badge-positive">✔ Positive</span>'
      : '<span class="badge badge-negative">✘ Negative</span>';
    const stepInfo = getStepLabel(scenario.tags);
    const stepBadge = stepInfo.num !== '-'
      ? `<span class="badge badge-step">Step ${stepInfo.num}</span>`
      : '';
    const scenarioId = `sc-${feature.name.replace(/\s+/g, '-')}-${idx}`;

    return `
      <div class="scenario scenario-${status}">
        <div class="scenario-header" onclick="toggle('${scenarioId}')">
          <span class="scenario-icon">${icon}</span>
          <div class="scenario-title">
            <div class="scenario-name">${scenario.name}</div>
            <div class="scenario-badges">${stepBadge} ${typeLabel}</div>
          </div>
          <span class="scenario-arrow" id="arrow-${scenarioId}">▶</span>
        </div>
        <div class="scenario-steps" id="${scenarioId}">
          ${renderSteps(scenario.steps || [])}
        </div>
      </div>`;
  }).join('');
}

function renderFeature(feature, featureIdx) {
  const stats = featureStats(feature);
  const isUI = (feature.tags || []).some(t => t.name === '@ui');
  const isAPI = (feature.tags || []).some(t => t.name === '@api');
  const featureIcon = isUI ? '🖥️' : isAPI ? '🔌' : '🧪';
  const featureType = isUI ? 'UI Test' : isAPI ? 'API Test' : 'Test';
  const featureId = `feat-${featureIdx}`;

  return `
    <div class="feature">
      <div class="feature-header" onclick="toggleFeature('${featureId}')">
        <div class="feature-title-row">
          <span class="feature-icon">${featureIcon}</span>
          <div>
            <div class="feature-type">${featureType}</div>
            <div class="feature-name">${feature.name}</div>
            ${feature.description ? `<div class="feature-desc">${feature.description.trim().replace(/\n/g, '<br>')}</div>` : ''}
          </div>
        </div>
        <div class="feature-stats">
          <span class="stat-pass">✅ ${stats.passed} ผ่าน</span>
          <span class="stat-fail">❌ ${stats.failed} ไม่ผ่าน</span>
          <span class="stat-total">รวม ${stats.total}</span>
          <span class="feature-arrow" id="arrow-${featureId}">▼</span>
        </div>
      </div>
      <div class="feature-body" id="${featureId}">
        ${renderScenarios(feature)}
      </div>
    </div>`;
}

// ── จัดเรียง features: UI ก่อน API ──────────────────────────────────────────
const sortedFeatures = [...allFeatures].sort((a, b) => {
  const aUI = (a.tags || []).some(t => t.name === '@ui') ? 0 : 1;
  const bUI = (b.tags || []).some(t => t.name === '@ui') ? 0 : 1;
  return aUI - bUI;
});

const featuresHTML = sortedFeatures.map((f, i) => renderFeature(f, i)).join('');

// ── HTML Template ─────────────────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Quiz QA — ผลการทดสอบ ${latestFolder}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f0f2f5; color: #333; }

  .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    color: #fff; padding: 32px 40px; }
  .header h1 { font-size: 26px; font-weight: 700; margin-bottom: 4px; }
  .header .subtitle { font-size: 14px; color: #a0b4cc; }

  .summary { display: flex; gap: 16px; padding: 24px 40px; flex-wrap: wrap; }
  .card { background: #fff; border-radius: 12px; padding: 20px 28px;
    flex: 1; min-width: 160px; box-shadow: 0 2px 8px rgba(0,0,0,.08); text-align: center; }
  .card .card-num { font-size: 40px; font-weight: 800; line-height: 1; }
  .card .card-label { font-size: 13px; color: #888; margin-top: 6px; }
  .card-total .card-num { color: #1a1a2e; }
  .card-pass .card-num { color: #22c55e; }
  .card-fail .card-num { color: #ef4444; }
  .card-rate .card-num { color: #3b82f6; }
  .progress-bar { height: 8px; background: #e5e7eb; border-radius: 4px;
    margin: 16px 40px 0; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 4px; transition: width .6s ease;
    background: linear-gradient(90deg, #22c55e, #16a34a); }

  .meta { display: flex; gap: 24px; padding: 16px 40px; flex-wrap: wrap;
    background: #fff; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #555; }
  .meta-item { display: flex; align-items: center; gap: 6px; }
  .meta-item strong { color: #333; }

  .content { padding: 24px 40px; }
  .section-title { font-size: 18px; font-weight: 700; color: #1a1a2e;
    margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; }

  .feature { background: #fff; border-radius: 12px; margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,.06); overflow: hidden; }
  .feature-header { display: flex; justify-content: space-between; align-items: flex-start;
    padding: 20px 24px; cursor: pointer; user-select: none;
    border-bottom: 1px solid #f0f0f0; transition: background .2s; }
  .feature-header:hover { background: #f8fafc; }
  .feature-title-row { display: flex; align-items: flex-start; gap: 14px; }
  .feature-icon { font-size: 28px; margin-top: 2px; }
  .feature-type { font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1px; color: #3b82f6; margin-bottom: 4px; }
  .feature-name { font-size: 17px; font-weight: 700; color: #1a1a2e; }
  .feature-desc { font-size: 12px; color: #888; margin-top: 4px; line-height: 1.6; }
  .feature-stats { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
  .stat-pass { color: #22c55e; font-weight: 600; font-size: 14px; }
  .stat-fail { color: #ef4444; font-weight: 600; font-size: 14px; }
  .stat-total { color: #888; font-size: 13px; }
  .feature-arrow { font-size: 12px; color: #aaa; transition: transform .3s; }
  .feature-body { padding: 0 24px 16px; }

  .scenario { border: 1px solid #e5e7eb; border-radius: 10px; margin: 12px 0; overflow: hidden; }
  .scenario-passed { border-left: 4px solid #22c55e; }
  .scenario-failed { border-left: 4px solid #ef4444; }
  .scenario-skipped { border-left: 4px solid #f59e0b; }
  .scenario-header { display: flex; align-items: center; gap: 12px;
    padding: 14px 16px; cursor: pointer; user-select: none;
    background: #fafafa; transition: background .2s; }
  .scenario-header:hover { background: #f0f4ff; }
  .scenario-icon { font-size: 18px; flex-shrink: 0; }
  .scenario-title { flex: 1; }
  .scenario-name { font-size: 14px; font-weight: 600; color: #1a1a2e; line-height: 1.4; }
  .scenario-badges { display: flex; gap: 6px; margin-top: 5px; flex-wrap: wrap; }
  .scenario-arrow { font-size: 11px; color: #aaa; transition: transform .3s; flex-shrink: 0; }

  .badge { font-size: 11px; font-weight: 600; padding: 2px 8px;
    border-radius: 20px; display: inline-block; }
  .badge-positive { background: #dcfce7; color: #16a34a; }
  .badge-negative { background: #fee2e2; color: #dc2626; }
  .badge-step { background: #dbeafe; color: #1d4ed8; }

  .scenario-steps { padding: 12px 16px; background: #fff;
    border-top: 1px solid #f0f0f0; display: none; }
  .step { display: flex; align-items: baseline; gap: 8px;
    padding: 6px 0; border-bottom: 1px dashed #f0f0f0; font-size: 13px; flex-wrap: wrap; }
  .step:last-child { border-bottom: none; }
  .step-icon { flex-shrink: 0; font-size: 14px; }
  .step-keyword { font-weight: 700; color: #6366f1; min-width: 48px; flex-shrink: 0; }
  .step-name { color: #374151; flex: 1; }
  .step-dur { font-size: 11px; color: #aaa; flex-shrink: 0; }
  .step-error { width: 100%; margin-top: 4px; padding: 8px 12px;
    background: #fef2f2; border-left: 3px solid #ef4444;
    color: #dc2626; font-size: 12px; border-radius: 4px; font-family: monospace; }

  .footer { text-align: center; padding: 24px; color: #aaa; font-size: 12px; }

  @media (max-width: 600px) {
    .header, .summary, .meta, .content { padding-left: 16px; padding-right: 16px; }
    .feature-header { flex-direction: column; gap: 12px; }
    .feature-stats { flex-wrap: wrap; }
  }
</style>
</head>
<body>

<div class="header">
  <h1>📋 Quiz QA — ผลการทดสอบอัตโนมัติ</h1>
  <div class="subtitle">วันที่ ${datePart} &nbsp;|&nbsp; ครั้งที่ ${runNum} &nbsp;|&nbsp; ${executedAt}</div>
</div>

<div class="meta">
  <div class="meta-item">🌐 <strong>UI:</strong> qa-practice.razvanvancea.ro</div>
  <div class="meta-item">🔌 <strong>API:</strong> localhost:8887</div>
  <div class="meta-item">🧪 <strong>Framework:</strong> Cucumber + WebdriverIO</div>
  <div class="meta-item">🖥️ <strong>Browser:</strong> Chrome (Headless)</div>
</div>

<div class="summary">
  <div class="card card-total">
    <div class="card-num">${stats.total}</div>
    <div class="card-label">Test Cases ทั้งหมด</div>
  </div>
  <div class="card card-pass">
    <div class="card-num">${stats.passed}</div>
    <div class="card-label">ผ่าน (Passed)</div>
  </div>
  <div class="card card-fail">
    <div class="card-num">${stats.failed}</div>
    <div class="card-label">ไม่ผ่าน (Failed)</div>
  </div>
  <div class="card card-rate">
    <div class="card-num">${passRate}%</div>
    <div class="card-label">อัตราผ่าน (Pass Rate)</div>
  </div>
</div>

<div class="progress-bar">
  <div class="progress-fill" style="width: ${passRate}%"></div>
</div>

<div class="content">
  <div class="section-title">🔍 รายละเอียดผลการทดสอบ</div>
  ${featuresHTML}
</div>

<div class="footer">
  สร้างโดย QA Nutthanan &nbsp;|&nbsp; ${executedAt}
</div>

<script>
  function toggle(id) {
    const el = document.getElementById(id);
    const arrow = document.getElementById('arrow-' + id);
    if (el.style.display === 'block') {
      el.style.display = 'none';
      arrow.style.transform = '';
    } else {
      el.style.display = 'block';
      arrow.style.transform = 'rotate(90deg)';
    }
  }
  function toggleFeature(id) {
    const el = document.getElementById(id);
    const arrow = document.getElementById('arrow-' + id);
    if (el.style.display === 'none') {
      el.style.display = 'block';
      arrow.style.transform = '';
    } else {
      el.style.display = 'none';
      arrow.style.transform = 'rotate(-90deg)';
    }
  }
  document.querySelectorAll('.scenario-failed .scenario-steps').forEach(el => {
    el.style.display = 'block';
    const arrow = el.previousElementSibling?.querySelector('.scenario-arrow');
    if (arrow) arrow.style.transform = 'rotate(90deg)';
  });
</script>
</body>
</html>`;

fs.writeFileSync(outputFile, html, 'utf8');
console.log(`\n✅ HTML report generated: reports/${latestFolder}_report.html`);
console.log(`📂 เปิดไฟล์: reports/${latestFolder}_report.html ด้วย Browser\n`);
