const GITHUB_USER = "Xejqelle";
const GITHUB_REPO = "drone_club";
const GITHUB_BRANCH = "main";

// 页面加载时加载所有培训资料
async function loadMaterials(filter = "all") {
  const container = document.getElementById("materials-content");
  container.innerHTML = `<div class="materials-empty">加载中...</div>`;

  try {
    // 调用GitHub API获取uploads文件夹下的所有文件
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/uploads?ref=${GITHUB_BRANCH}`
    );
    const files = await response.json();

    if (!Array.isArray(files) || files.length === 0) {
      container.innerHTML = `
        <div class="materials-empty">
          <div class="empty-icon">📂</div>
          <p>暂无培训资料，点击上方按钮上传</p>
        </div>
      `;
      return;
    }

    // 过滤并渲染文件列表
    const filteredFiles = filter === "all" 
      ? files.filter(file => file.name !== ".gitkeep")
      : files.filter(file => file.name.includes(filter));

    container.innerHTML = "";
    filteredFiles.forEach(file => {
      // 生成永久下载链接
      const downloadUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/uploads/${file.name}`;
      
      const card = document.createElement("div");
      card.className = "material-card";
      card.innerHTML = `
        <div class="material-icon">📄</div>
        <div class="material-info">
          <h4>${file.name}</h4>
          <div class="material-meta">
            <span>大小：${(file.size / 1024).toFixed(1)} KB</span>
          </div>
        </div>
        <div class="material-actions">
          <a href="${downloadUrl}" download="${file.name}" class="btn btn-primary">下载</a>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    container.innerHTML = `
      <div class="materials-empty">
        <div class="empty-icon">❌</div>
        <p>加载失败，请刷新页面重试</p>
      </div>
    `;
    console.error("加载资料失败：", error);
  }
}

// 点击上传按钮跳转到GitHub上传页面
document.getElementById("uploadArea").addEventListener("click", () => {
  // 直接跳转到你仓库的uploads文件夹上传页面
  window.open(`https://github.com/${GITHUB_USER}/${GITHUB_REPO}/upload/main/uploads`, "_blank");
  alert("将跳转到GitHub上传文件，上传后提交Pull Request，审核通过后即可显示");
});

// 隐藏原来的上传确认面板（我们用GitHub原生上传）
document.getElementById("confirmUpload").style.display = "none";
document.getElementById("cancelUpload").style.display = "none";

// 筛选按钮点击事件
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    loadMaterials(btn.dataset.filter);
  });
});

// 页面加载时初始化
document.addEventListener("DOMContentLoaded", () => loadMaterials());
// 兼容app.js的调用
function initMaterials() {
  loadMaterials();
}
