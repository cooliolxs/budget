// ========== 示例数据 ==========
const budgetTemplates = [
  {id: 1, dept: "内科", project: "设备购置", type: "采购", year: 2025, amount: 500000},
  {id: 2, dept: "外科", project: "培训", type: "办公", year: 2025, amount: 120000},
];
const budgets = [
  {id: 1, type: "年度", dept: "内科", project: "设备购置", amount: 500000, status: "已审批", year: 2025, month: 0, quarter: 0},
  {id: 2, type: "季度", dept: "外科", project: "培训", amount: 30000, status: "已审批", year: 2025, month: 0, quarter: 2},
  {id: 3, type: "月度", dept: "检验科", project: "试剂采购", amount: 15000, status: "待审批", year: 2025, month: 5, quarter: 0},
];
const budgetAdjusts = [
  {id: 1, dept: "内科", project: "设备购置", before: 500000, change: 50000, after: 550000, reason: "设备涨价", status: "待审批", log: []}
];
const budgetExec = [
  {id: 1, dept: "内科", project: "设备购置", used: 200000, balance: 350000, warn: false},
  {id: 2, dept: "外科", project: "培训", used: 60000, balance: 60000, warn: false},
  {id: 3, dept: "检验科", project: "试剂采购", used: 14500, balance: 500, warn: true},
];
const reimburseList = [
  {id:1, name:"李明", dept:"内科", flow:"差旅报销", date:"2025-06-11", amount:2100, status:"待审批", type:"差旅", attach:["invoice.pdf"]},
  {id:2, name:"张蕾", dept:"外科", flow:"采购报销", date:"2025-05-25", amount:8500, status:"已审批", type:"采购", attach:["invoice.jpg","contract.docx"]},
  {id:3, name:"王刚", dept:"检验科", flow:"耗材报销", date:"2025-05-20", amount:670, status:"驳回", type:"医疗耗材", rejectReason:"票据重复"},
  {id:4, name:"王强", dept:"内科", flow:"办公费报销", date:"2025-04-20", amount:750, status:"已支付", type:"办公费用", attach:["invoice2.pdf"]},
];
const reimburseApprovals = [
  {id:1, ...reimburseList[0], logs:[]},
  {id:2, ...reimburseList[1], logs:[{step:"部门领导", opinion:"同意"}]},
  {id:3, ...reimburseList[2], logs:[{step:"部门领导", opinion:"驳回：票据重复"}]},
  {id:4, ...reimburseList[3], logs:[{step:"部门领导", opinion:"同意"},{step:"财务", opinion:"同意"},{step:"院领导", opinion:"同意"}]},
];
const paymentRecords = [
  {id:1, reimburseId:2, method:"银行转账", payDate:"2025-06-01", voucher:"voucher20250601.pdf", amount:8500, status:"已支付"},
  {id:2, reimburseId:4, method:"现金", payDate:"2025-05-01", voucher:"voucher20250501.pdf", amount:750, status:"已支付"},
];
const financeSyncLogs = [
  {id:1, reimbId:2, syncDate:"2025-06-01", voucherId:"F20250601", status:"同步成功"},
];
const systemSettings = {
  financeApiUrl: "https://finance.hospital.com/api",
  syncKey: "****",
  enableAutoSync: true
};

// ========== 工具函数 ==========
function $(sel) { return document.querySelector(sel); }
function $A(sel) { return Array.from(document.querySelectorAll(sel)); }
function closeModal() { $("#modal").classList.add("hidden"); $("#modal-content").innerHTML = ""; }
function showModal(html) {
  $("#modal-content").innerHTML = html + `<button class="close-btn" onclick="closeModal()">×</button>`;
  $("#modal").classList.remove("hidden");
}
window.closeModal = closeModal;

// ========== 页面渲染注册 ==========
const pageRenders = {
  "home": renderHome,
  "budget-compilation": renderBudgetCompilation,
  "budget-adjust": renderBudgetAdjust,
  "budget-monitor": renderBudgetMonitor,
  "budget-report": renderBudgetReport,
  "reimburse-apply": renderReimburseApply,
  "reimburse-approve": renderReimburseApprove,
  "reimburse-payment": renderReimbursePayment,
  "reimburse-query": renderReimburseQuery,
  "reimburse-report": renderReimburseReport,
  "setting": renderSetting,
};

// ========== 路由切换 & 菜单激活 ==========
function loadSection(section) {
  if (!pageRenders[section]) {
    $("#content").innerHTML = "<div style='padding:50px;font-size:1.2em'>页面开发中...</div>";
  } else {
    pageRenders[section]();
  }
  // 激活菜单
  $A('[data-section]').forEach(el => {
    el.classList.toggle("active", el.getAttribute("data-section") === section);
  });
}

// 给所有带 data-section 的节点绑定点击事件
document.addEventListener("DOMContentLoaded", () => {
  $A('[data-section]').forEach(el => {
    el.addEventListener("click", () => {
      const sec = el.getAttribute("data-section");
      loadSection(sec);
    });
  });

  // 点击遮罩层空白关闭弹窗
  $("#modal").addEventListener("click", e => {
    if (e.target === $("#modal")) closeModal();
  });

  // 默认进入首页
  loadSection("home");
});

// ========== 首页门户 ==========
function renderHome() {
  const pendingBudgets = budgets.filter(b => b.status === '待审批').length;
  const pendingReimb = reimburseList.filter(r => r.status === '待审批').length;
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalUsed = budgetExec.reduce((sum, e) => sum + e.used, 0);
  const totalBalance = budgetExec.reduce((sum, e) => sum + e.balance, 0);
  const warnCount = budgetExec.filter(e => e.warn).length;

  $("#content").innerHTML = `
    <div class="board" style="margin-bottom:24px">
      <div class="board-title"><h1>门户总览</h1></div>
      <div class="portal-grid">
        <div class="portal-card" onclick="loadSection('budget-compilation')">
          <div class="portal-num">${pendingBudgets}</div>
          <div class="portal-label">待审批预算</div>
        </div>
        <div class="portal-card" onclick="loadSection('reimburse-approve')">
          <div class="portal-num">${pendingReimb}</div>
          <div class="portal-label">待审批报销</div>
        </div>
        <div class="portal-card" onclick="loadSection('budget-report')">
          <div class="portal-num">${totalBudget.toLocaleString()}</div>
          <div class="portal-label">年度预算总额</div>
        </div>
        <div class="portal-card" onclick="loadSection('budget-monitor')">
          <div class="portal-num">${totalUsed.toLocaleString()}</div>
          <div class="portal-label">已用预算金额</div>
        </div>
        <div class="portal-card" onclick="loadSection('budget-monitor')">
          <div class="portal-num">${totalBalance.toLocaleString()}</div>
          <div class="portal-label">预算余额</div>
        </div>
        <div class="portal-card" onclick="loadSection('budget-monitor')">
          <div class="portal-num" style="color:${warnCount>0?'#d12c2c':'#12814d'}">${warnCount}</div>
          <div class="portal-label">超预算预警</div>
        </div>
      </div>
    </div>
    <div class="tip" style="color:#888;margin-top:12px;">点击卡片可跳转对应功能</div>
  `;
}

// ========== 预算编制 ==========
function renderBudgetCompilation() {
  const years = [...new Set(budgets.map(b => b.year))].sort();
  const types = [...new Set(budgets.map(b => b.type))];
  const depts = [...new Set(budgets.map(b => b.dept))];
  const statuses = [...new Set(budgets.map(b => b.status))];

  $("#content").innerHTML = `
    <div class="board">
      <div class="board-title">
        <h1>预算编制</h1>
        <div>
          <button class="btn" onclick="showAddBudgetForm()">新增预算</button>
          <button class="btn" onclick="showBudgetTemplate()">预算模板管理</button>
          <button class="btn" onclick="showBudgetHistory()">历史预算查询</button>
        </div>
      </div>
      <div class="search-panel">
        <h3>搜索筛选</h3>
        <form id="budget-search-form" class="search-form">
          <div class="form-row">
            <div class="form-group">
              <label>年度</label>
              <select name="year">
                <option value="">全部</option>
                ${years.map(y => `<option value="${y}">${y}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>类型</label>
              <select name="type">
                <option value="">全部</option>
                ${types.map(t => `<option value="${t}">${t}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>科室</label>
              <select name="dept">
                <option value="">全部</option>
                ${depts.map(d => `<option value="${d}">${d}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>项目</label>
              <input type="text" name="project" placeholder="输入关键字">
            </div>
            <div class="form-group">
              <label>状态</label>
              <select name="status">
                <option value="">全部</option>
                ${statuses.map(s => `<option value="${s}">${s}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-buttons">
            <button type="submit" class="btn">搜索</button>
            <button type="reset" class="btn btn-secondary" onclick="resetBudgetSearch()">重置</button>
          </div>
        </form>
      </div>
      <div id="budget-list">
        <table class="table">
          <thead>
            <tr>
              <th>类型</th><th>年度</th><th>季度</th><th>月度</th>
              <th>科室</th><th>项目</th><th>金额</th><th>状态</th><th>操作</th>
            </tr>
          </thead>
          <tbody id="budget-table-body">
            ${renderBudgetTableRows(budgets)}
          </tbody>
        </table>
      </div>
    </div>
  `;

  $("#budget-search-form").onsubmit = function(e) {
    e.preventDefault();
    const fd = new FormData(this);
    const filters = {
      year: fd.get("year"),
      type: fd.get("type"),
      dept: fd.get("dept"),
      project: fd.get("project"),
      status: fd.get("status")
    };
    $("#budget-table-body").innerHTML = renderBudgetTableRows(filterBudgets(budgets, filters));
  };
}
function filterBudgets(list, f) {
  return list.filter(b => {
    if (f.year && b.year.toString() !== f.year) return false;
    if (f.type && b.type !== f.type) return false;
    if (f.dept && b.dept !== f.dept) return false;
    if (f.project && !b.project.toLowerCase().includes(f.project.toLowerCase())) return false;
    if (f.status && b.status !== f.status) return false;
    return true;
  });
}
function renderBudgetTableRows(list) {
  if (!list.length) {
    return `<tr><td colspan="9" class="no-data">没有找到符合条件的预算记录</td></tr>`;
  }
  return list.map(b => `
    <tr>
      <td>${b.type}</td><td>${b.year || ""}</td><td>${b.quarter || ""}</td><td>${b.month?b.month+"月":""}</td>
      <td>${b.dept}</td><td>${b.project}</td><td>${b.amount.toLocaleString()}</td>
      <td><span class="status ${b.status==='已审批'?'approved':b.status==='待审批'?'pending':'rejected'}">${b.status}</span></td>
      <td>
        <button class="btn btn-small" onclick="viewBudgetDetail(${b.id})">查看</button>
        ${b.status==='待审批'
          ? `<button class="btn btn-small" onclick="approveBudget(${b.id})">通过</button>
             <button class="btn btn-small" onclick="rejectBudget(${b.id})">驳回</button>`
          : b.status==='已审批'
            ? ``
            : ``}
        ${b.status==='待审批'?`<button class="btn btn-small" onclick="editBudget(${b.id})">编辑</button>`:""}
      </td>
    </tr>
  `).join('');
}

function resetBudgetSearch() {
  $("#budget-search-form").reset();
  $("#budget-table-body").innerHTML = renderBudgetTableRows(budgets);
}
function viewBudgetDetail(id) {
  const b = budgets.find(x => x.id === id);
  if (!b) return;
  showModal(`
    <h2>预算详情</h2>
    <div class="detail-info">
      <p><strong>类型:</strong> ${b.type}</p>
      <p><strong>年度:</strong> ${b.year}</p>
      ${b.quarter?`<p><strong>季度:</strong> ${b.quarter}</p>`:""}
      ${b.month?`<p><strong>月度:</strong> ${b.month}月</p>`:""}
      <p><strong>科室:</strong> ${b.dept}</p>
      <p><strong>项目:</strong> ${b.project}</p>
      <p><strong>金额:</strong> ${b.amount.toLocaleString()}</p>
      <p><strong>状态:</strong> ${b.status}</p>
    </div>
  `);
}
function editBudget(id) {
  const b = budgets.find(x => x.id === id);
  if (!b) return;
  showModal(`
    <h2>编辑预算</h2>
    <form id="edit-budget-form">
      <input type="hidden" name="id" value="${b.id}">
      <div class="form-group">
        <label>类型</label>
        <select name="type">
          <option value="年度" ${b.type==='年度'?'selected':""}>年度</option>
          <option value="季度" ${b.type==='季度'?'selected':""}>季度</option>
          <option value="月度" ${b.type==='月度'?'selected':""}>月度</option>
        </select>
      </div>
      <div class="form-group">
        <label>年度</label>
        <input name="year" type="number" value="${b.year}" required>
      </div>
      <div class="form-group quarter-group" style="${b.type==='季度'?'':'display:none'}">
        <label>季度</label>
        <select name="quarter">
          ${[1,2,3,4].map(q=>`<option value="${q}" ${b.quarter===q?'selected':""}>${q}</option>`).join("")}
        </select>
      </div>
      <div class="form-group month-group" style="${b.type==='月度'?'':'display:none'}">
        <label>月度</label>
        <select name="month">
          ${Array.from({length:12},(_,i)=>`<option value="${i+1}" ${b.month===i+1?'selected':""}>${i+1}月</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label>科室</label>
        <input name="dept" value="${b.dept}" required>
      </div>
      <div class="form-group">
        <label>项目</label>
        <input name="project" value="${b.project}" required>
      </div>
      <div class="form-group">
        <label>金额</label>
        <input name="amount" type="number" value="${b.amount}" required>
      </div>
      <div class="form-buttons">
        <button class="btn" type="submit">保存</button>
        <button class="btn btn-secondary" type="button" onclick="closeModal()">取消</button>
      </div>
    </form>
  `);
  const form = $("#edit-budget-form");
  const typeSel = form.querySelector("select[name=type]");
  const quarterG = form.querySelector(".quarter-group");
  const monthG = form.querySelector(".month-group");
  typeSel.onchange = () => {
    quarterG.style.display = typeSel.value==='季度'?'block':'none';
    monthG.style.display = typeSel.value==='月度'?'block':'none';
  };
  form.onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(form);
    const idx = budgets.findIndex(x => x.id === b.id);
    budgets[idx] = {
      id: b.id,
      type: fd.get("type"),
      year: +fd.get("year"),
      quarter: fd.get("type")==="季度"? +fd.get("quarter"):0,
      month: fd.get("type")==="月度"? +fd.get("month"):0,
      dept: fd.get("dept"),
      project: fd.get("project"),
      amount: +fd.get("amount"),
      status: budgets[idx].status
    };
    closeModal();
    renderBudgetCompilation();
  };
}

// ========== 预算调整 ==========
function renderBudgetAdjust() {
  $("#content").innerHTML = `
    <div class="board">
      <div class="board-title">
        <h1>预算调整</h1>
        <div>
          <button class="btn" onclick="showAddAdjustForm()">新增调整</button>
          <button class="btn" onclick="showApproveAdjustForm()">调整审批</button>
        </div>
      </div>
      <table class="table">
        <thead><tr><th>科室</th><th>项目</th><th>调整前</th><th>调整金额</th><th>调整后</th><th>原因</th><th>状态</th></tr></thead>
        <tbody>
          ${budgetAdjusts.map(a=>`
            <tr>
              <td>${a.dept}</td><td>${a.project}</td><td>${a.before}</td><td>${a.change}</td>
              <td>${a.after}</td><td>${a.reason}</td>
              <td><span class="status ${a.status==='已审批'?'approved':a.status==='待审批'?'pending':'rejected'}">${a.status}</span></td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}
function showAddAdjustForm() {
  const approved = budgets.filter(b => b.status==="已审批");
  if (!approved.length) return alert("暂无已审批的预算可调整");
  showModal(`
    <h2>新增预算调整</h2>
    <form id="add-adjust-form">
      <label>预算项目</label>
      <select id="select-budget" name="budgetId">${approved.map(b=>`<option value="${b.id}">${b.dept} - ${b.project} (${b.amount})</option>`).join("")}</select><br>
      <input type="hidden" name="dept"><input type="hidden" name="project">
      <label>调整前</label><input name="before" id="before-amount" readonly><br>
      <label>调整金额</label><input name="change" id="change-amount" value="0"><br>
      <label>调整后</label><input name="after" id="after-amount" readonly><br>
      <label>原因</label><input name="reason" required><br>
      <button class="btn" type="submit">提交</button>
    </form>
  `);
  const form = $("#add-adjust-form");
  const sel = $("#select-budget"), bef = $("#before-amount"), cha = $("#change-amount"), aft = $("#after-amount");
  function upd() {
    const b = budgets.find(x=>x.id===+sel.value);
    form.querySelector("input[name=dept]").value = b.dept;
    form.querySelector("input[name=project]").value = b.project;
    bef.value = b.amount;
    aft.value = b.amount + (+cha.value||0);
  }
  sel.onchange = upd; cha.oninput = upd; upd();
  form.onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(form), before = +fd.get("before"), change = +fd.get("change"), after = +fd.get("after");
    if (!change) return alert("调整金额不能为0");
    budgetAdjusts.push({
      id: budgetAdjusts.length+1,
      budgetId: +fd.get("budgetId"),
      dept: fd.get("dept"),
      project: fd.get("project"),
      before, change, after,
      reason: fd.get("reason"),
      status: "待审批", log: []
    });
    closeModal(); renderBudgetAdjust();
  };
}
function showApproveAdjustForm() {
  const pend = budgetAdjusts.filter(a=>a.status==="待审批");
  if (!pend.length) return alert("暂无待审批调整");
  showModal(`
    <h2>调整审批</h2>
    <table class="table"><thead>
      <tr><th>科室</th><th>项目</th><th>前</th><th>调整</th><th>后</th><th>原因</th><th>操作</th></tr>
    </thead><tbody>
      ${pend.map(a=>`
        <tr>
          <td>${a.dept}</td><td>${a.project}</td><td>${a.before}</td><td>${a.change}</td><td>${a.after}</td><td>${a.reason}</td>
          <td>
            <button class="btn" onclick="approveAdjust(${a.id}, true)">通过</button>
            <button class="btn" onclick="approveAdjust(${a.id}, false)">驳回</button>
          </td>
        </tr>`).join("")}
    </tbody></table>
  `);
}
function approveAdjust(id, ok) {
  const a = budgetAdjusts.find(x=>x.id===id);
  if (!a) return;
  if (ok) {
    a.status="已审批"; a.log.push({time:new Date().toISOString(),action:"通过",user:"当前用户"});
    const b = budgets.find(x=>x.dept===a.dept&&x.project===a.project);
    if (b) { b.amount = a.after; const e = budgetExec.find(x=>x.dept===a.dept&&x.project===a.project); if (e) { e.balance += a.change; e.warn = e.balance<0; }}
    alert("通过，已更新金额");
  } else {
    const r = prompt("请输入驳回原因：")||"无";
    a.status="驳回"; a.log.push({time:new Date().toISOString(),action:"驳回",reason:r,user:"当前用户"});
    alert("已驳回");
  }
  closeModal(); renderBudgetAdjust();
}

// ========== 预算执行监控 ==========
function renderBudgetMonitor() {
  $("#content").innerHTML = `
    <div class="board"><div class="board-title"><h1>预算执行监控</h1></div>
      <table class="table"><thead>
        <tr><th>科室</th><th>项目</th><th>已用</th><th>余额</th><th>预警</th></tr>
      </thead><tbody>
        ${budgetExec.map(e=>`
          <tr><td>${e.dept}</td><td>${e.project}</td><td>${e.used}</td><td>${e.balance}</td>
            <td><span class="status ${e.warn?'rejected':'approved'}">${e.warn?'超预算':'正常'}</span></td>
          </tr>`).join("")}
      </tbody></table>
    </div>
  `;
}

// ========== 预算报表 ==========
function renderBudgetReport() {
  $("#content").innerHTML = `
    <div class="board"><div class="board-title"><h1>预算执行情况报表</h1></div>
      <table class="table"><thead><tr><th>科室</th><th>项目</th><th>预算</th><th>已用</th><th>余额</th></tr></thead>
        <tbody>${budgetExec.map(e=>{
          const b = budgets.find(x=>x.dept===e.dept&&x.project===e.project) || {};
          return `<tr><td>${e.dept}</td><td>${e.project}</td><td>${b.amount||0}</td><td>${e.used}</td><td>${e.balance}</td></tr>`;
        }).join("")}</tbody>
      </table>
    </div>
    <div class="board"><div class="board-title"><h1>部门预算使用分析</h1></div>
      <table class="table"><thead><tr><th>科室</th><th>总预算</th><th>总已用</th><th>总余额</th></tr></thead>
        <tbody>${["内科","外科","检验科"].map(d=>{
          const arr = budgetExec.filter(e=>e.dept===d);
          const total = arr.reduce((s,e)=>s+(budgets.find(b=>b.dept===d&&b.project===e.project)?.amount||0),0);
          const used = arr.reduce((s,e)=>s+e.used,0);
          const bal = arr.reduce((s,e)=>s+e.balance,0);
          return `<tr><td>${d}</td><td>${total}</td><td>${used}</td><td>${bal}</td></tr>`;
        }).join("")}</tbody>
      </table>
    </div>
  `;
}

// ========== 报销申请 ==========
function renderReimburseApply() {
  $("#content").innerHTML = `
    <div class="board">
      <div class="board-title"><h1>报销申请</h1><button class="btn" onclick="showAddReimburseForm()">新增报销</button></div>
      <table class="table"><thead><tr><th>发起人</th><th>科室</th><th>流程</th><th>日期</th><th>类型</th><th>金额</th><th>状态</th></tr></thead>
        <tbody>${reimburseList.map(r=>`
          <tr>
            <td>${r.name}</td><td>${r.dept}</td><td>${r.flow}</td><td>${r.date}</td>
            <td>${r.type}</td><td>${r.amount}</td>
            <td><span class="status ${r.status==='已审批'?'approved':r.status==='待审批'?'pending':r.status==='已支付'?'paid':'rejected'}">${r.status}</span></td>
          </tr>`).join("")}</tbody>
      </table>
    </div>
  `;
}
function showAddReimburseForm() {
  showModal(`
    <h2>新增报销申请</h2>
    <form id="add-reimburse-form">
      <label>发起人</label><input name="name" required><br>
      <label>科室</label><input name="dept" required><br>
      <label>流程名称</label><input name="flow" required><br>
      <label>申请日期</label><input name="date" type="date" required><br>
      <label>类型</label>
      <select name="type">
        <option>差旅</option><option>采购</option><option>医疗耗材</option><option>办公费用</option>
      </select><br>
      <label>金额</label><input name="amount" type="number" required><br>
      <label>附件</label><input name="attach" type="file" multiple><br>
      <button class="btn" type="submit">提交</button>
    </form>
  `);
  $("#add-reimburse-form").onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    reimburseList.push({
      id: reimburseList.length+1,
      name: fd.get("name"),
      dept: fd.get("dept"),
      flow: fd.get("flow"),
      date: fd.get("date"),
      type: fd.get("type"),
      amount: +fd.get("amount"),
      status: "待审批",
      attach: []
    });
    closeModal(); renderReimburseApply();
  };
}

// ========== 报销审批 ==========
function renderReimburseApprove() {
  $("#content").innerHTML = `
    <div class="board">
      <div class="board-title"><h1>报销审批</h1>
        <div>
          <button class="btn" onclick="renderReimburseApproveTab('pending')">待审批</button>
          <button class="btn" onclick="renderReimburseApproveTab('approved')">已审批</button>
          <button class="btn" onclick="renderReimburseApproveTab('rejected')">驳回</button>
        </div>
      </div>
      <div id="approve-tab"></div>
    </div>
  `;
  renderReimburseApproveTab("pending");
}
function renderReimburseApproveTab(tab) {
  let data = [];
  if (tab==="pending") data = reimburseApprovals.filter(r=>r.status==="待审批");
  else if (tab==="approved") data = reimburseApprovals.filter(r=>r.status==="已审批"||r.status==="已支付");
  else data = reimburseApprovals.filter(r=>r.status==="驳回");
  const cols = ["发起人","科室","流程","日期"].concat(
    tab==="rejected"?["驳回原因"] : [],
    tab==="pending"?["操作"] : []
  ).map(h=>`<th>${h}</th>`).join("");
  $("#approve-tab").innerHTML = `
    <table class="table"><thead><tr>${cols}</tr></thead><tbody>
      ${data.map(r=>`
        <tr>
          <td>${r.name}</td><td>${r.dept}</td><td>${r.flow}</td><td>${r.date}</td>
          ${tab==="rejected"?`<td>${r.rejectReason||"无"}</td>`:""}
          ${tab==="pending"?`<td>
            <button class="btn" onclick="approveReimburse(${r.id},true)">通过</button>
            <button class="btn" onclick="approveReimburse(${r.id},false)">驳回</button>
          </td>`:""}
        </tr>`).join("")}
    </tbody></table>
  `;
}
function approveReimburse(id, ok) {
  const r = reimburseApprovals.find(x=>x.id===id);
  if (!r) return;
  if (ok) {
    r.status="已审批"; r.logs.push({step:"审批",opinion:"同意"});
  } else {
    const reason = prompt("输入驳回原因：")||"无";
    r.status="驳回"; r.rejectReason=reason; r.logs.push({step:"审批",opinion:"驳回："+reason});
  }
  renderReimburseApprove();
}

// ========== 资金支付 ==========
function renderReimbursePayment() {
  $("#content").innerHTML = `
    <div class="board"><div class="board-title"><h1>资金支付</h1></div>
      <table class="table"><thead>
        <tr><th>报销单号</th><th>发起人</th><th>金额</th><th>方式</th><th>日期</th><th>凭证</th><th>状态</th></tr>
      </thead><tbody>
        ${paymentRecords.map(p=>{
          const u = reimburseList.find(r=>r.id===p.reimburseId);
          return `<tr>
            <td>${p.reimburseId}</td><td>${u?u.name:""}</td><td>${p.amount}</td><td>${p.method}</td><td>${p.payDate}</td>
            <td><a href="uploads/${p.voucher}" target="_blank">${p.voucher}</a></td><td><span class="status paid">已支付</span></td>
          </tr>`;
        }).join("")}
      </tbody></table>
    </div>
  `;
}

// ========== 报销查询 ==========
function renderReimburseQuery() {
  $("#content").innerHTML = `
    <div class="board"><div class="board-title"><h1>报销查询</h1></div>
      <form id="query-form">
        <label>申请人</label><input name="name"><label>科室</label><input name="dept"><label>日期</label><input name="date" type="date">
        <button class="btn" type="submit">查询</button>
      </form>
      <div id="query-result"></div>
    </div>
  `;
  $("#query-form").onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const res = reimburseList.filter(r =>
      (!fd.get("name")||r.name.includes(fd.get("name"))) &&
      (!fd.get("dept")||r.dept.includes(fd.get("dept"))) &&
      (!fd.get("date")||r.date===fd.get("date"))
    );
    $("#query-result").innerHTML = `
      <table class="table"><thead><tr><th>发起人</th><th>科室</th><th>流程</th><th>日期</th><th>状态</th></tr></thead>
      <tbody>
        ${res.map(r=>`
          <tr>
            <td>${r.name}</td><td>${r.dept}</td><td>${r.flow}</td><td>${r.date}</td>
            <td><span class="status ${r.status==='已审批'?'approved':r.status==='待审批'?'pending':r.status==='已支付'?'paid':'rejected'}">${r.status}</span></td>
          </tr>`).join("")}
      </tbody></table>
    `;
  };
}

// ========== 报销报表 ==========
function renderReimburseReport() {
  $("#content").innerHTML = `
    <div class="board"><div class="board-title"><h1>报销金额汇总</h1></div>
      <table class="table"><thead><tr><th>科室</th><th>总金额</th></tr></thead>
        <tbody>${["内科","外科","检验科"].map(d=>{
          const sum = reimburseList.filter(r=>r.dept===d).reduce((s,r)=>s+r.amount,0);
          return `<tr><td>${d}</td><td>${sum}</td></tr>`;
        }).join("")}</tbody>
      </table>
    </div>
    <div class="board"><div class="board-title"><h1>费用类别分析</h1></div>
      <table class="table"><thead><tr><th>类型</th><th>金额合计</th></tr></thead>
        <tbody>${["差旅","采购","医疗耗材","办公费用"].map(t=>{
          const sum = reimburseList.filter(r=>r.type===t).reduce((s,r)=>s+r.amount,0);
          return `<tr><td>${t}</td><td>${sum}</td></tr>`;
        }).join("")}</tbody>
      </table>
    </div>
    <div class="board"><div class="board-title"><h1>与预算执行对比报表</h1></div>
      <table class="table"><thead><tr><th>科室</th><th>已用预算</th><th>报销金额</th><th>差异</th></tr></thead>
        <tbody>${["内科","外科","检验科"].map(d=>{
          const used = budgetExec.find(e=>e.dept===d)?.used||0;
          const reimb = reimburseList.filter(r=>r.dept===d).reduce((s,r)=>s+r.amount,0);
          return `<tr><td>${d}</td><td>${used}</td><td>${reimb}</td><td>${used-reimb}</td></tr>`;
        }).join("")}</tbody>
      </table>
    </div>
  `;
}

// ========== 系统设置 ==========
function renderSetting() {
  $("#content").innerHTML = `
    <div class="board"><div class="board-title"><h1>系统设置：报销与财务对接</h1></div>
      <form id="setting-form">
        <label>API 地址</label><input name="financeApiUrl" value="${systemSettings.financeApiUrl}"><br>
        <label>同步密钥</label><input name="syncKey" type="password" value="${systemSettings.syncKey}"><br>
        <label>自动同步</label>
        <select name="enableAutoSync">
          <option value="true" ${systemSettings.enableAutoSync?"selected":""}>开启</option>
          <option value="false" ${!systemSettings.enableAutoSync?"selected":""}>关闭</option>
        </select><br>
        <button class="btn" type="submit">保存</button>
      </form>
      <h2>同步日志</h2>
      <table class="table"><thead><tr><th>单号</th><th>日期</th><th>凭证号</th><th>状态</th></tr></thead>
        <tbody>${financeSyncLogs.map(l=>`<tr><td>${l.reimbId}</td><td>${l.syncDate}</td><td>${l.voucherId}</td><td>${l.status}</td></tr>`).join("")}</tbody>
      </table>
    </div>
  `;
  $("#setting-form").onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    systemSettings.financeApiUrl = fd.get("financeApiUrl");
    systemSettings.syncKey = fd.get("syncKey");
    systemSettings.enableAutoSync = fd.get("enableAutoSync")==="true";
    alert("设置已保存！");
  };
}

// ========== 预算编制 弹窗：新增/模板/历史 ==========
function showAddBudgetForm() {
  showModal(`
    <h2>新增预算</h2>
    <form id="add-budget-form">
      <div class="form-group">
        <label>类型</label>
        <select name="type" id="new-type">
          <option value="年度">年度</option>
          <option value="季度">季度</option>
          <option value="月度">月度</option>
        </select>
      </div>
      <div class="form-group">
        <label>年度</label>
        <input name="year" type="number" required>
      </div>
      <div class="form-group quarter-group" style="display:none">
        <label>季度</label>
        <select name="quarter">
          ${[1,2,3,4].map(n=>`<option value="${n}">${n}</option>`).join("")}
        </select>
      </div>
      <div class="form-group month-group" style="display:none">
        <label>月度</label>
        <select name="month">
          ${Array.from({length:12},(_,i)=>`<option value="${i+1}">${i+1}月</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label>科室</label>
        <input name="dept" required>
      </div>
      <div class="form-group">
        <label>项目</label>
        <input name="project" required>
      </div>
      <div class="form-group">
        <label>金额</label>
        <input name="amount" type="number" required>
      </div>
      <div class="form-buttons">
        <button class="btn" type="submit">提交</button>
        <button class="btn btn-secondary" type="button" onclick="closeModal()">取消</button>
      </div>
    </form>
  `);
  const form = $("#add-budget-form");
  const sel = $("#new-type"), qg = form.querySelector(".quarter-group"), mg = form.querySelector(".month-group");
  sel.onchange = () => {
    qg.style.display = sel.value==='季度'?'block':'none';
    mg.style.display = sel.value==='月度'?'block':'none';
  };
  form.onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(form);
    budgets.push({
      id: budgets.length+1,
      type: fd.get("type"),
      year: +fd.get("year"),
      quarter: fd.get("type")==="季度"? +fd.get("quarter"):0,
      month: fd.get("type")==="月度"? +fd.get("month"):0,
      dept: fd.get("dept"),
      project: fd.get("project"),
      amount: +fd.get("amount"),
      status: "待审批"
    });
    closeModal(); renderBudgetCompilation();
  };
}
function showBudgetTemplate() {
  showModal(`
    <h2>预算模板管理</h2>
    <button class="btn" id="add-template-btn">新增模板</button>
    <table class="table" style="margin-top:10px">
      <thead><tr><th>ID</th><th>科室</th><th>项目</th><th>类型</th><th>年度</th><th>金额</th></tr></thead>
      <tbody id="template-table-body">
        ${budgetTemplates.map(t=>`
          <tr>
            <td>${t.id}</td><td>${t.dept}</td><td>${t.project}</td><td>${t.type}</td><td>${t.year}</td><td>${t.amount.toLocaleString()}</td>
          </tr>`).join("")}
      </tbody>
    </table>
  `);
  $("#add-template-btn").onclick = () => {
    showModal(`
      <h2>新增预算模板</h2>
      <form id="add-template-form">
        <div class="form-group"><label>科室</label><input name="dept" required></div>
        <div class="form-group"><label>项目</label><input name="project" required></div>
        <div class="form-group"><label>类型</label><input name="type" required></div>
        <div class="form-group"><label>年度</label><input name="year" type="number" required></div>
        <div class="form-group"><label>金额</label><input name="amount" type="number" required></div>
        <div class="form-buttons">
          <button class="btn" type="submit">提交</button>
          <button class="btn btn-secondary" type="button" onclick="showBudgetTemplate()">取消</button>
        </div>
      </form>
    `);
    $("#add-template-form").onsubmit = e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      budgetTemplates.push({
        id: budgetTemplates.length+1,
        dept: fd.get("dept"),
        project: fd.get("project"),
        type: fd.get("type"),
        year: +fd.get("year"),
        amount: +fd.get("amount")
      });
      showBudgetTemplate();
    };
  };
}
function showBudgetHistory() {
  const rows = budgets.map(b=>`
    <tr>
      <td>${b.id}</td><td>${b.type}</td><td>${b.year}</td><td>${b.quarter||""}</td><td>${b.month?b.month+"月":""}</td>
      <td>${b.dept}</td><td>${b.project}</td><td>${b.amount.toLocaleString()}</td><td>${b.status}</td>
    </tr>`).join("");
  showModal(`
    <h2>历史预算查询</h2>
    <table class="table">
      <thead><tr><th>ID</th><th>类型</th><th>年度</th><th>季度</th><th>月度</th><th>科室</th><th>项目</th><th>金额</th><th>状态</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `);
}
// 通过审批
function approveBudget(id) {
  const idx = budgets.findIndex(b => b.id === id);
  if (idx < 0) return alert("未找到该预算");
  budgets[idx].status = "已审批";
  // 如果需要，进入这里同步更新 budgetExec 中的 balance
  const exec = budgetExec.find(e => e.dept===budgets[idx].dept && e.project===budgets[idx].project);
  if (exec) {
    exec.balance = exec.balance; // 不变，或根据需求调整
    exec.warn = exec.balance < 0;
  }
  renderBudgetCompilation();
  alert("已通过审批");
}

// 驳回审批
function rejectBudget(id) {
  const idx = budgets.findIndex(b => b.id === id);
  if (idx < 0) return alert("未找到该预算");
  const reason = prompt("请输入驳回原因：") || "无";
  budgets[idx].status = "驳回";
  // 可选：为预算对象添加 rejectReason 字段
  budgets[idx].rejectReason = reason;
  renderBudgetCompilation();
  alert("已驳回：" + reason);
}
