const GITHUB_USER = "Xejqelle";
const GITHUB_REPO = "drone_club";
const GITHUB_BRANCH = "main";

// 按文件名自动分类
function getFileCategory(filename) {
  if (filename.includes("培训课件") || filename.includes("课件")) return "training";
  if (filename.includes("操作教程") || filename.includes("教程")) return "tutorial";
  if (filename.includes("参考资料") || filename.includes("规则") || filename.includes("文档")) return "reference";
  return "other";
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// 页面加载时加载所有培训资料
async function loadMaterials(filter = "all") {
  const container = document.getElementById("materials-content");
  container.innerHTML = `<div class="materials-empty">加载中...</div>`;

  try {
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

    // 基础过滤
    let validFiles = files.filter(file => file.name !== ".gitkeep");

    // 分类筛选（核心！恢复4个分类功能）
    if (filter !== "all") {
      validFiles = validFiles.filter(file => getFileCategory(file.name) === filter);
    }

    if (validFiles.length === 0) {
      container.innerHTML = `
        <div class="materials-empty">
          <div class="empty-icon">📂</div>
          <p>该分类下暂无资料</p>
        </div>
      `;
      return;
    }

    // 渲染文件
    container.innerHTML = "";
    validFiles.forEach(file => {
      const downloadUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/uploads/${file.name}`;
      
      const card = document.createElement("div");
      card.className = "material-card";
      card.innerHTML = `
        <div class="material-icon">📄</div>
        <div class="material-info">
          <h4>${file.name}</h4>
          <div class="material-meta">
            <span>大小：${formatFileSize(file.size)}</span>
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

// 上传按钮
document.getElementById("uploadArea").addEventListener("click", () => {
  alert("将跳转到GitHub上传文件，直接上传到 uploads 文件夹即可，自动分类！");
  window.open(`https://github.com/${GITHUB_USER}/${GITHUB_REPO}/upload/main/uploads`, "_blank");
});

// 隐藏无用按钮
document.addEventListener("DOMContentLoaded", () => {
  const confirmBtn = document.getElementById("confirmUpload");
  const cancelBtn = document.getElementById("cancelUpload");
  if (confirmBtn) confirmBtn.style.display = "none";
  if (cancelBtn) cancelBtn.style.display = "none";

  // 筛选按钮绑定
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      loadMaterials(btn.dataset.filter);
    });
  });

  loadMaterials();
});

// 兼容调用
function initMaterials() {
  loadMaterials();
}
