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
  {id:1, ...reimburseList[0], logs:[]}, {id:2, ...reimburseList[1], logs:[{step:"部门领导",opinion:"同意"}]},
  {id:3, ...reimburseList[2], logs:[{step:"部门领导",opinion:"驳回：票据重复"}]},
  {id:4, ...reimburseList[3], logs:[{step:"部门领导",opinion:"同意"},{step:"财务",opinion:"同意"},{step:"院领导",opinion:"同意"}]}
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
function closeModal() { $("#modal").classList.add("hidden"); $("#modal-content").innerHTML=""; }
function showModal(html) {
  $("#modal-content").innerHTML = html + `<button class="close-btn" onclick="closeModal()">×</button>`;
  $("#modal").classList.remove("hidden");
}
window.closeModal = closeModal;
// ========== 页面渲染 ==========
const pageRenders = {
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
$A('.sidebar li.menu > span').forEach(el => {
  el.onclick = () => {
    $A('.sidebar li.menu').forEach(x=>x.classList.remove('active'));
    el.parentNode.classList.add('active');
  }
});
$A('.sidebar li.menu > ul li, .sidebar > ul > li.menu[data-section="setting"]').forEach(el => {
  el.onclick = () => {
    $A('.sidebar li.menu > ul li').forEach(x=>x.classList.remove('active'));
    if (el.parentNode.tagName==="UL") el.classList.add('active');
    loadSection(el.dataset.section);
  }
});
function loadSection(section) {
  if (!pageRenders[section]) {$("#content").innerHTML = "<div style='padding:50px;font-size:1.2em'>页面开发中...</div>"; return;}
  pageRenders[section]();
}
// ========== 预算编制 ==========
function renderBudgetCompilation() {
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
    <table class="table"><thead>
      <tr><th>类型</th><th>年度</th><th>季度</th><th>月度</th><th>科室</th><th>项目</th><th>金额</th><th>状态</th></tr>
    </thead><tbody>
      ${budgets.map(b=>`
        <tr>
          <td>${b.type}</td>
          <td>${b.year||""}</td>
          <td>${b.quarter||""}</td>
          <td>${b.month?b.month+"月":""}</td>
          <td>${b.dept}</td>
          <td>${b.project}</td>
          <td>${b.amount}</td>
          <td><span class="status ${b.status==='已审批'?'approved':b.status==='待审批'?'pending':'rejected'}">${b.status}</span></td>
        </tr>
      `).join('')}
    </tbody></table>
  </div>
  `;
  window.showAddBudgetForm = function() {
    showModal(`
      <h2>新增预算</h2>
      <form id="add-budget-form">
        <label>类型</label>
        <select name="type"><option>年度</option><option>季度</option><option>月度</option></select><br>
        <label>年度</label><input name="year" type="number" value="2025"><br>
        <label>季度</label><select name="quarter"><option value="">--</option><option>1</option><option>2</option><option>3</option><option>4</option></select><br>
        <label>月度</label><select name="month"><option value="">--</option>${[...Array(12).keys()].map(i=>`<option>${i+1}</option>`).join('')}</select><br>
        <label>科室</label><input name="dept"><br>
        <label>项目</label><input name="project"><br>
        <label>金额</label><input name="amount" type="number"><br>
        <button class="btn" type="submit">提交</button>
      </form>
    `);
    $("#add-budget-form").onsubmit = function(e) {
      e.preventDefault();
      const fd = new FormData(e.target);
      budgets.push({
        id: budgets.length+1,
        type: fd.get("type"),
        year: parseInt(fd.get("year")),
        quarter: parseInt(fd.get("quarter")||0),
        month: parseInt(fd.get("month")||0),
        dept: fd.get("dept"),
        project: fd.get("project"),
        amount: parseInt(fd.get("amount")),
        status: "待审批"
      });
      closeModal(); renderBudgetCompilation();
    }
  }
  window.showBudgetTemplate = function() {
    showModal(`
      <h2>预算模板管理</h2>
      <table class="table">
        <thead><tr><th>科室</th><th>项目</th><th>类型</th><th>年度</th><th>金额</th></tr></thead>
        <tbody>${budgetTemplates.map(t=>`
          <tr><td>${t.dept}</td><td>${t.project}</td><td>${t.type}</td><td>${t.year}</td><td>${t.amount}</td></tr>
        `).join('')}</tbody>
      </table>
    `);
  }
  window.showBudgetHistory = function() {
    showModal(`
      <h2>历史预算查询</h2>
      <table class="table">
        <thead><tr><th>年度</th><th>科室</th><th>项目</th><th>金额</th><th>状态</th></tr></thead>
        <tbody>
        ${budgets.map(b=>`
          <tr><td>${b.year}</td><td>${b.dept}</td><td>${b.project}</td><td>${b.amount}</td>
            <td><span class="status ${b.status==='已审批'?'approved':b.status==='待审批'?'pending':'rejected'}">${b.status}</span></td>
          </tr>
        `).join('')}
        </tbody>
      </table>
    `);
  }
}
// ========== 预算调整 ==========
function renderBudgetAdjust() {
  $("#content").innerHTML = `
  <div class="board">
    <div class="board-title">
      <h1>预算调整</h1>
      <button class="btn" onclick="showAddAdjustForm()">新增调整</button>
    </div>
    <table class="table"><thead>
      <tr><th>科室</th><th>项目</th><th>调整前</th><th>调整金额</th><th>调整后</th><th>原因</th><th>状态</th></tr>
    </thead><tbody>
      ${budgetAdjusts.map(a=>`
        <tr>
          <td>${a.dept}</td><td>${a.project}</td><td>${a.before}</td><td>${a.change}</td>
          <td>${a.after}</td><td>${a.reason}</td>
          <td><span class="status ${a.status==='已审批'?'approved':a.status==='待审批'?'pending':'rejected'}">${a.status}</span></td>
        </tr>
      `).join('')}
    </tbody></table>
  </div>
  `;
  window.showAddAdjustForm = function() {
    showModal(`
      <h2>新增预算调整</h2>
      <form id="add-adjust-form">
        <label>科室</label><input name="dept"><br>
        <label>项目</label><input name="project"><br>
        <label>调整前</label><input name="before" type="number"><br>
        <label>调整金额</label><input name="change" type="number"><br>
        <label>调整后</label><input name="after" type="number"><br>
        <label>原因</label><input name="reason"><br>
        <button class="btn" type="submit">提交</button>
      </form>
    `);
    $("#add-adjust-form").onsubmit = function(e) {
      e.preventDefault();
      const fd = new FormData(e.target);
      budgetAdjusts.push({
        id: budgetAdjusts.length+1,
        dept: fd.get("dept"), project: fd.get("project"),
        before: parseInt(fd.get("before")),
        change: parseInt(fd.get("change")),
        after: parseInt(fd.get("after")),
        reason: fd.get("reason"),
        status: "待审批", log:[]
      });
      closeModal(); renderBudgetAdjust();
    }
  }
}
// ========== 预算执行监控 ==========
function renderBudgetMonitor() {
  $("#content").innerHTML = `
  <div class="board">
    <div class="board-title">
      <h1>预算执行监控</h1>
    </div>
    <table class="table"><thead>
      <tr><th>科室</th><th>项目</th><th>已用金额</th><th>余额</th><th>超预算预警</th></tr>
    </thead><tbody>
      ${budgetExec.map(e=>`
        <tr>
          <td>${e.dept}</td><td>${e.project}</td><td>${e.used}</td><td>${e.balance}</td>
          <td>${e.warn?'<span class="status rejected">超预算</span>':'<span class="status approved">正常</span>'}</td>
        </tr>
      `).join('')}
    </tbody></table>
  </div>
  `;
}
// ========== 预算报表 ==========
function renderBudgetReport() {
  $("#content").innerHTML = `
  <div class="board">
    <div class="board-title"><h1>预算执行情况报表</h1></div>
    <table class="table"><thead>
      <tr><th>科室</th><th>项目</th><th>年度预算</th><th>已用</th><th>余额</th></tr>
    </thead><tbody>
      ${budgetExec.map(e=>{
        let bud = budgets.find(b=>b.dept===e.dept&&b.project===e.project);
        return `<tr>
          <td>${e.dept}</td><td>${e.project}</td><td>${bud?bud.amount:0}</td><td>${e.used}</td><td>${e.balance}</td>
        </tr>`;
      }).join('')}
    </tbody></table>
  </div>
  <div class="board">
    <div class="board-title"><h1>各部门预算使用分析</h1></div>
    <table class="table"><thead>
      <tr><th>科室</th><th>预算总额</th><th>已用总额</th><th>余额</th></tr>
    </thead><tbody>
      ${["内科","外科","检验科"].map(d=>{
        let depts = budgetExec.filter(e=>e.dept===d);
        let total = depts.reduce((sum,e)=>sum+(budgets.find(b=>b.dept===d&&b.project===e.project)?.amount||0),0);
        let used = depts.reduce((sum,e)=>sum+e.used,0);
        let bal = depts.reduce((sum,e)=>sum+e.balance,0);
        return `<tr><td>${d}</td><td>${total}</td><td>${used}</td><td>${bal}</td></tr>`;
      }).join('')}
    </tbody></table>
  </div>
  `;
}
// ========== 报销申请 ==========
function renderReimburseApply() {
  $("#content").innerHTML = `
  <div class="board">
    <div class="board-title">
      <h1>报销申请</h1>
      <button class="btn" onclick="showAddReimburseForm()">新增报销</button>
    </div>
    <table class="table"><thead>
      <tr><th>发起人</th><th>科室</th><th>流程名称</th><th>申请日期</th><th>类型</th><th>金额</th><th>状态</th></tr>
    </thead><tbody>
      ${reimburseList.map(r=>`
        <tr>
          <td>${r.name}</td><td>${r.dept}</td><td>${r.flow}</td><td>${r.date}</td>
          <td>${r.type}</td><td>${r.amount}</td>
          <td><span class="status ${r.status==='已审批'?'approved':r.status==='待审批'?'pending':r.status==='已支付'?'paid':'rejected'}">${r.status}</span></td>
        </tr>
      `).join('')}
    </tbody></table>
  </div>
  `;
  window.showAddReimburseForm = function() {
    showModal(`
      <h2>新增报销申请</h2>
      <form id="add-reimburse-form">
        <label>发起人</label><input name="name"><br>
        <label>科室</label><input name="dept"><br>
        <label>流程名称</label><input name="flow"><br>
        <label>申请日期</label><input name="date" type="date"><br>
        <label>类型</label>
        <select name="type">
          <option>差旅</option><option>采购</option>
          <option>医疗耗材</option><option>办公费用</option>
        </select><br>
        <label>金额</label><input name="amount" type="number"><br>
        <label>附件</label><input name="attach" type="file" multiple><br>
        <button class="btn" type="submit">提交</button>
      </form>
    `);
    $("#add-reimburse-form").onsubmit = function(e) {
      e.preventDefault();
      const fd = new FormData(e.target);
      reimburseList.push({
        id: reimburseList.length+1,
        name: fd.get("name"),
        dept: fd.get("dept"),
        flow: fd.get("flow"),
        date: fd.get("date"),
        type: fd.get("type"),
        amount: parseInt(fd.get("amount")),
        status: "待审批",
        attach: []
      });
      closeModal(); renderReimburseApply();
    }
  }
}
// ========== 报销审批 ==========
function renderReimburseApprove() {
  $("#content").innerHTML = `
  <div class="board">
    <div class="board-title">
      <h1>报销审批</h1>
      <div>
        <button class="btn" onclick="renderReimburseApproveTab('pending')">待审批</button>
        <button class="btn" onclick="renderReimburseApproveTab('approved')">已审批</button>
        <button class="btn" onclick="renderReimburseApproveTab('rejected')">驳回</button>
      </div>
    </div>
    <div id="approve-tab"></div>
  </div>
  `;
  renderReimburseApproveTab('pending');
}
window.renderReimburseApproveTab = function(tab) {
  let data = [];
  if (tab === "pending") data = reimburseApprovals.filter(r=>r.status==="待审批");
  else if (tab==="approved") data = reimburseApprovals.filter(r=>r.status==="已审批"||r.status==="已支付");
  else if (tab==="rejected") data = reimburseApprovals.filter(r=>r.status==="驳回");
  let columns = `<th>发起人</th><th>科室</th><th>流程名称</th><th>申请日期</th>`;
  if (tab==="rejected") columns+=`<th>驳回原因</th>`;
  if (tab==="pending") columns+=`<th>操作</th>`;
  $("#approve-tab").innerHTML = `
    <table class="table"><thead><tr>${columns}</tr></thead><tbody>
      ${data.map(r=>`
        <tr>
          <td>${r.name}</td><td>${r.dept}</td><td>${r.flow}</td><td>${r.date}</td>
          ${tab==="rejected"?`<td>${r.rejectReason||"票据问题"}</td>`:""}
          ${tab==="pending"?`<td><button class="btn" onclick="approveReimburse(${r.id},true)">审批通过</button>
          <button class="btn" onclick="approveReimburse(${r.id},false)">驳回</button></td>`:""}
        </tr>
      `).join('')}
    </tbody></table>
  `;
}
window.approveReimburse = function(id, pass) {
  let r = reimburseApprovals.find(x=>x.id===id);
  if (!r) return;
  if (pass) { r.status="已审批"; r.logs.push({step:"审批",opinion:"同意"});}
  else {
    let reason = prompt("请输入驳回原因","");
    r.status="驳回"; r.rejectReason=reason||"无"; r.logs.push({step:"审批",opinion:"驳回："+(reason||"无")});
  }
  renderReimburseApprove();
}
// ========== 资金支付 ==========
function renderReimbursePayment() {
  $("#content").innerHTML = `
  <div class="board">
    <div class="board-title"><h1>资金支付</h1></div>
    <table class="table"><thead>
      <tr><th>报销单号</th><th>发起人</th><th>金额</th><th>支付方式</th><th>支付日期</th><th>凭证</th><th>状态</th></tr>
    </thead><tbody>
      ${paymentRecords.map(p=>{
        let r = reimburseList.find(x=>x.id===p.reimburseId);
        return `<tr>
          <td>${p.reimburseId}</td><td>${r?r.name:""}</td><td>${p.amount}</td>
          <td>${p.method}</td><td>${p.payDate}</td>
          <td>${p.voucher}</td>
          <td><span class="status paid">已支付</span></td>
        </tr>`;
      }).join('')}
    </tbody></table>
  </div>
  `;
}
// ========== 报销查询 ==========
function renderReimburseQuery() {
  $("#content").innerHTML = `
  <div class="board">
    <div class="board-title"><h1>报销查询</h1></div>
    <form id="query-form">
      <label>申请人</label><input name="name">
      <label>科室</label><input name="dept">
      <label>时间</label><input name="date" type="date">
      <button class="btn" type="submit">查询</button>
    </form>
    <div id="query-result"></div>
  </div>
  `;
  $("#query-form").onsubmit = function(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    let data = reimburseList.filter(r=>
      (!fd.get("name")||r.name.includes(fd.get("name"))) &&
      (!fd.get("dept")||r.dept.includes(fd.get("dept"))) &&
      (!fd.get("date")||r.date===fd.get("date"))
    );
    $("#query-result").innerHTML = `
      <table class="table"><thead>
        <tr><th>发起人</th><th>科室</th><th>流程名称</th><th>申请日期</th><th>状态</th></tr>
      </thead><tbody>
        ${data.map(r=>`
          <tr>
            <td>${r.name}</td><td>${r.dept}</td><td>${r.flow}</td><td>${r.date}</td>
            <td><span class="status ${r.status==='已审批'?'approved':r.status==='待审批'?'pending':r.status==='已支付'?'paid':'rejected'}">${r.status}</span></td>
          </tr>
        `).join('')}
      </tbody></table>
    `;
  }
}
// ========== 报销报表 ==========
function renderReimburseReport() {
  $("#content").innerHTML = `
  <div class="board">
    <div class="board-title"><h1>报销金额汇总</h1></div>
    <table class="table"><thead>
      <tr><th>科室</th><th>总报销金额</th></tr>
    </thead><tbody>
      ${["内科","外科","检验科"].map(d=>{
        let sum = reimburseList.filter(r=>r.dept===d).reduce((s,r)=>s+r.amount,0);
        return `<tr><td>${d}</td><td>${sum}</td></tr>`;
      }).join('')}
    </tbody></table>
  </div>
  <div class="board">
    <div class="board-title"><h1>费用类别分析</h1></div>
    <table class="table"><thead>
      <tr><th>类型</th><th>金额合计</th></tr>
    </thead><tbody>
      ${["差旅","采购","医疗耗材","办公费用"].map(t=>{
        let sum = reimburseList.filter(r=>r.type===t).reduce((s,r)=>s+r.amount,0);
        return `<tr><td>${t}</td><td>${sum}</td></tr>`;
      }).join('')}
    </tbody></table>
  </div>
  <div class="board">
    <div class="board-title"><h1>与预算执行对比报表</h1></div>
    <table class="table"><thead>
      <tr><th>科室</th><th>已用预算</th><th>报销金额</th><th>差异</th></tr>
    </thead><tbody>
      ${["内科","外科","检验科"].map(d=>{
        let used = budgetExec.find(e=>e.dept===d)?.used||0;
        let reimb = reimburseList.filter(r=>r.dept===d).reduce((s,r)=>s+r.amount,0);
        return `<tr><td>${d}</td><td>${used}</td><td>${reimb}</td><td>${used-reimb}</td></tr>`;
      }).join('')}
    </tbody></table>
  </div>
  `;
}
// ========== 系统设置 ==========
function renderSetting() {
  $("#content").innerHTML = `
  <div class="board">
    <div class="board-title"><h1>系统设置：报销与财务系统对接配置</h1></div>
    <form id="setting-form">
      <label>财务系统API地址</label><input name="financeApiUrl" value="${systemSettings.financeApiUrl}"><br>
      <label>同步密钥</label><input name="syncKey" type="password" value="${systemSettings.syncKey}"><br>
      <label>自动同步开启</label>
        <select name="enableAutoSync"><option value="true" ${systemSettings.enableAutoSync?"selected":""}>开启</option>
          <option value="false" ${!systemSettings.enableAutoSync?"selected":""}>关闭</option>
        </select><br>
      <button class="btn" type="submit">保存</button>
    </form>
    <h2>对接同步日志</h2>
    <table class="table">
      <thead><tr><th>报销单号</th><th>同步日期</th><th>财务凭证号</th><th>同步状态</th></tr></thead>
      <tbody>
        ${financeSyncLogs.map(l=>`
          <tr><td>${l.reimbId}</td><td>${l.syncDate}</td><td>${l.voucherId}</td><td>${l.status}</td></tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  `;
  $("#setting-form").onsubmit = function(e){
    e.preventDefault();
    const fd = new FormData(e.target);
    systemSettings.financeApiUrl = fd.get("financeApiUrl");
    systemSettings.syncKey = fd.get("syncKey");
    systemSettings.enableAutoSync = fd.get("enableAutoSync")==="true";
    alert("设置已保存！");
  }
}
// ========== 默认显示首页 ==========
window.onload = ()=>{ $("#home").style.display="block";
$('li[data-section="budget-compilation"]').click(); }
$("#modal").onclick = function(e){ if(e.target===this) closeModal(); }

