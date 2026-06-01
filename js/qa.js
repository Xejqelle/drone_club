const GITHUB_USER = "Xejqelle";
const GITHUB_REPO = "drone_club";

// 页面加载时加载所有Q&A
async function loadQA() {
  const list = document.getElementById("qaList");
  if (!list) return; // 避免DOM不存在报错
  list.innerHTML = `<div class="materials-empty">加载中...</div>`;

  try {
    // 修复1：标签参数编码（q&a标签需把&转成%26，若为两个标签则用labels=q,a）
    const labels = encodeURIComponent("q&a"); // 关键：编码特殊字符
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/issues?labels=${labels}&state=all`
    );

    // 兼容GitHub API返回的错误（比如404/403）
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
      `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/issues/${issueNumber}/comments`
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

// 提交问题逻辑（修复弹窗拦截+参数编码）
function bindSubmitEvent() {
  const submitBtn = document.getElementById("submitQuestion");
  if (!submitBtn) {
    console.error("未找到submitQuestion按钮");
    return;
  }

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

    // 修复2：正确编码标签和内容（避免特殊字符导致URL失效）
    const labels = encodeURIComponent("q&a");
    const title = encodeURIComponent(question);
    const body = encodeURIComponent(content || "");
    
    const issueUrl = `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/issues/new?labels=${labels}&title=${title}&body=${body}`;
    
    // 修复3：避免弹窗拦截（先提示，再打开）
    alert("即将跳转到GitHub提交问题，请允许弹窗！");
    const newWindow = window.open(issueUrl, "_blank");
    if (!newWindow) {
      // 弹窗被拦截时，给出备用链接
      alert("弹窗被浏览器拦截！请手动打开：\n" + issueUrl);
      // 复制链接到剪贴板（可选）
      navigator.clipboard.writeText(issueUrl).then(() => {
        alert("链接已复制到剪贴板！");
      });
    }

    // 清空表单
    questionInput.value = "";
    contentInput.value = "";
  });
}

// 页面加载初始化（确保DOM完全加载）
document.addEventListener("DOMContentLoaded", () => {
  // 先解绑旧事件（避免和旧qa.js冲突）
  const submitBtn = document.getElementById("submitQuestion");
  if (submitBtn) submitBtn.onclick = null;
  
  bindSubmitEvent(); // 绑定新的提交事件
  loadQA(); // 加载问答列表
});
