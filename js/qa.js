// 直接使用materials.js中已经声明的全局变量
const GITHUB_BRANCH = "main";

// 页面加载时加载所有Q&A
async function loadQA() {
  const list = document.getElementById("qaList");
  if (!list) return;
  list.innerHTML = `<div class="materials-empty">加载中...</div>`;

  try {
    // 使用合法标签名qa，添加时间戳防止缓存
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/issues?labels=qa&state=all&t=${Date.now()}`
    );

    if (response.status === 403) {
      throw new Error("GitHub访问过于频繁，请1小时后再试");
    }
    if (!response.ok) throw new Error(`API错误：${response.status}`);
    
    const issues = await response.json();

    if (!Array.isArray(issues) || issues.length === 0) {
      list.innerHTML = `
        <div class="materials-empty">
          <div class="empty-icon">❓</div>
          <p>暂无问题，快来提问吧！</p>
        </div>
      `;
      return;
    }

    list.innerHTML = "";
    issues.forEach(issue => {
      const card = document.createElement("div");
      card.className = "qa-card";
      card.innerHTML = `
        <h3 class="qa-question-title">${issue.title}</h3>
        <div class="qa-meta">提问者：${issue.user.login} | ${new Date(issue.created_at).toLocaleString()}</div>
        <div class="qa-content">${issue.body?.replace(/\n/g, '<br>') || ""}</div>
        
        <h4 class="qa-reply-title">回答 (${issue.comments})</h4>
        <div id="replies-${issue.number}" class="qa-replies">
          <div class="qa-no-reply">加载回答中...</div>
        </div>
        
        <a href="${issue.html_url}" target="_blank" class="btn btn-sm btn-primary" style="margin-top: 16px;">
          去GitHub回答此问题
        </a>
      `;
      list.appendChild(card);
      loadReplies(issue.number);
    });
  } catch (error) {
    list.innerHTML = `
      <div class="materials-empty">
        <div class="empty-icon">❌</div>
        <p>加载失败：${error.message}</p>
      </div>
    `;
    console.error("加载问答失败：", error);
  }
}

// 加载单个问题的回答
async function loadReplies(issueNumber) {
  const repliesContainer = document.getElementById(`replies-${issueNumber}`);
  if (!repliesContainer) return;
  
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/issues/${issueNumber}/comments?t=${Date.now()}`
    );
    if (!response.ok) throw new Error(`回答加载失败：${response.status}`);
    
    const comments = await response.json();

    if (!Array.isArray(comments) || comments.length === 0) {
      repliesContainer.innerHTML = '<div class="qa-no-reply">暂无回答，点击上方按钮去GitHub回复</div>';
      return;
    }

    repliesContainer.innerHTML = "";
    comments.forEach(comment => {
      const replyItem = document.createElement("div");
      replyItem.className = "qa-reply-item";
      replyItem.innerHTML = `
        <div class="qa-reply-content">${comment.body?.replace(/\n/g, '<br>') || ""}</div>
        <div class="qa-reply-meta">回答者：${comment.user.login} | ${new Date(comment.created_at).toLocaleString()}</div>
      `;
      repliesContainer.appendChild(replyItem);
    });
  } catch (error) {
    repliesContainer.innerHTML = `<div class="qa-no-reply">加载回答失败：${error.message}</div>`;
    console.error("加载回答失败：", error);
  }
}

// 提交问题逻辑
function bindSubmitEvent() {
  let submitBtn = document.getElementById("submitQuestion");
  if (!submitBtn) {
    console.error("未找到submitQuestion按钮");
    return;
  }

  // 彻底清除所有旧事件
  const newBtn = submitBtn.cloneNode(true);
  submitBtn.parentNode.replaceChild(newBtn, submitBtn);
  submitBtn = newBtn;

  submitBtn.addEventListener("click", () => {
    const questionInput = document.getElementById("qaQuestion");
    const contentInput = document.getElementById("qaContent");
    if (!questionInput || !contentInput) {
      alert("未找到提问表单元素");
      return;
    }

    const question = questionInput.value.trim();
    const content = contentInput.value.trim();

    if (!question) {
      alert("请输入问题标题");
      return;
    }

    // 使用合法标签名qa
    const title = encodeURIComponent(question);
    const body = encodeURIComponent(content || "");
    const issueUrl = `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/issues/new?labels=qa&title=${title}&body=${body}`;
    
    // 先打开窗口，再提示，避免被拦截
    const newWindow = window.open(issueUrl, "_blank");
    if (!newWindow) {
      alert("弹窗被浏览器拦截！请手动打开：\n" + issueUrl);
      navigator.clipboard.writeText(issueUrl).then(() => {
        alert("链接已复制到剪贴板！");
      });
    } else {
      alert("已跳转到GitHub提交问题，提交后刷新本页面即可看到");
    }

    // 清空表单
    questionInput.value = "";
    contentInput.value = "";
  });
}

// 页面加载初始化
document.addEventListener("DOMContentLoaded", () => {
  bindSubmitEvent();
  loadQA();
});
