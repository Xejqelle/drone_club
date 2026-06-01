// 纯本地永久存储问答，不依赖任何外网
const QA_STORAGE_KEY = "drone_club_qa_data";

// 获取所有问答
function getQAData() {
  const data = localStorage.getItem(QA_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// 保存问答
function saveQAData(data) {
  localStorage.setItem(QA_STORAGE_KEY, JSON.stringify(data));
}

// 提交问题
function submitQuestion() {
  const title = document.getElementById("qaQuestion").value.trim();
  const content = document.getElementById("qaContent").value.trim();

  if (!title) {
    alert("请输入问题标题！");
    return;
  }

  const newQuestion = {
    id: "Q" + Date.now(),
    title: title,
    content: content,
    createTime: new Date().toLocaleString(),
    replies: []
  };

  const qaList = getQAData();
  qaList.unshift(newQuestion);
  saveQAData(qaList);

  document.getElementById("qaQuestion").value = "";
  document.getElementById("qaContent").value = "";
  renderQAData();
  alert("提交成功！");
}

// 提交回复
function submitReply(questionId) {
  const replyInput = document.getElementById(`reply-${questionId}`);
  const content = replyInput.value.trim();

  if (!content) {
    alert("请输入回复内容！");
    return;
  }

  const qaList = getQAData();
  const target = qaList.find(q => q.id === questionId);

  if (target) {
    target.replies.push({
      id: "R" + Date.now(),
      content: content,
      createTime: new Date().toLocaleString()
    });
    saveQAData(qaList);
    replyInput.value = "";
    renderQAData();
  }
}

// 渲染到页面
function renderQAData() {
  const container = document.getElementById("qaList");
  const data = getQAData();

  if (data.length === 0) {
    container.innerHTML = `
      <div class="materials-empty">
        <div class="empty-icon">❓</div>
        <p>暂无问答，快来提问吧</p>
      </div>
    `;
    return;
  }

  container.innerHTML = data.map(item => `
    <div class="qa-card">
      <h3 class="qa-question-title">${item.title}</h3>
      <div class="qa-meta">提问时间：${item.createTime}</div>
      <div class="qa-content">${item.content.replace(/\n/g, "<br>")}</div>

      <h4 class="qa-reply-title">回复 (${item.replies.length})</h4>
      ${item.replies.map(r => `
        <div class="qa-reply-item">
          <div class="qa-reply-content">${r.content.replace(/\n/g, "<br>")}</div>
          <div class="qa-reply-meta">回复时间：${r.createTime}</div>
        </div>
      `).join("")}

      <div class="qa-reply-form">
        <textarea id="reply-${item.id}" placeholder="输入你的回复..."></textarea>
        <button class="btn btn-primary btn-sm" onclick="submitReply('${item.id}')">提交回复</button>
      </div>
    </div>
  `).join("");
}

// 初始化
function initQA() {
  renderQAData();

  const btn = document.getElementById("submitQuestion");
  if (btn) {
    btn.addEventListener("click", submitQuestion);
  }
}
