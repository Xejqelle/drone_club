const GITHUB_USER = "Xejqelle";
const GITHUB_REPO = "drone_club";

// 页面加载时加载所有Q&A
async function loadQA() {
  const list = document.getElementById("qaList");
  list.innerHTML = `<div class="materials-empty">加载中...</div>`;

  try {
    // 调用GitHub API获取所有带q&a标签的Issues
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/issues?labels=q&a&state=all`
    );
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
        <div class="qa-content">${issue.body}</div>
        
        <h4 class="qa-reply-title">回答 (${issue.comments})</h4>
        <div id="replies-${issue.number}" class="qa-replies">
          <div class="qa-no-reply">加载回答中...</div>
        </div>
        
        <a href="${issue.html_url}" target="_blank" class="btn btn-sm btn-primary" style="margin-top: 16px;">
          去GitHub回答此问题
        </a>
      `;
      list.appendChild(card);

      // 加载该问题的所有回答
      loadReplies(issue.number);
    });
  } catch (error) {
    list.innerHTML = `
      <div class="materials-empty">
        <div class="empty-icon">❌</div>
        <p>加载失败，请刷新页面重试</p>
      </div>
    `;
    console.error("加载问答失败：", error);
  }
}

// 加载单个问题的回答
async function loadReplies(issueNumber) {
  const repliesContainer = document.getElementById(`replies-${issueNumber}`);
  
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/issues/${issueNumber}/comments`
    );
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
        <div class="qa-reply-content">${comment.body}</div>
        <div class="qa-reply-meta">回答者：${comment.user.login} | ${new Date(comment.created_at).toLocaleString()}</div>
      `;
      repliesContainer.appendChild(replyItem);
    });
  } catch (error) {
    repliesContainer.innerHTML = '<div class="qa-no-reply">加载回答失败</div>';
    console.error("加载回答失败：", error);
  }
}

// 提交问题按钮点击事件
document.getElementById("submitQuestion").addEventListener("click", () => {
  const question = document.getElementById("qaQuestion").value.trim();
  const content = document.getElementById("qaContent").value.trim();

  if (!question) {
    alert("请输入问题标题");
    return;
  }

  // 自动跳转到GitHub新建Issue页面，预填内容和标签
  const issueUrl = `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/issues/new?labels=q&a&title=${encodeURIComponent(question)}&body=${encodeURIComponent(content)}`;
  window.open(issueUrl, "_blank");
  
  // 清空表单
  document.getElementById("qaQuestion").value = "";
  document.getElementById("qaContent").value = "";
  
  alert("将跳转到GitHub提交问题，提交成功后刷新页面即可看到");
});

// 页面加载时初始化
document.addEventListener("DOMContentLoaded", loadQA);
