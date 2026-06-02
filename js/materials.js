const GITHUB_USER = "Xejqelle";
const GITHUB_REPO = "drone_club";
const GITHUB_BRANCH = "main";

// 文件名→分类标识
function getFileCategory(filename) {
  if (filename.includes("课件")) return "培训课件";
  if (filename.includes("教程")) return "操作教程";
  if (filename.includes("规则") || filename.includes("参考") || filename.includes("文档")) return "参考资料";
  return "其他";
}

// 格式化大小
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

async function loadMaterials(filter = "all") {
  const container = document.getElementById("materials-content");
  container.innerHTML = `<div class="materials-empty">加载中...</div>`;

  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/uploads?ref=${GITHUB_BRANCH}`);
    const files = await res.json();

    if (!Array.isArray(files)) {
      container.innerHTML = `<div class="materials-empty"><p>加载失败</p></div>`;
      return;
    }

    let valid = files.filter(f => f.name !== ".gitkeep");

    // 关键：filter现在是【培训课件/操作教程/参考资料/其他】中文
    if(filter !== "all"){
      valid = valid.filter(item => getFileCategory(item.name) === filter)
    }

    if(valid.length === 0){
      container.innerHTML = `<div class="materials-empty"><p>该分类暂无文件</p></div>`;
      return;
    }

    container.innerHTML = "";
    valid.forEach(file=>{
      const downUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/uploads/${file.name}`;
      const card = document.createElement("div");
      card.className = "material-card";
      card.innerHTML = `
        <div class="material-icon">📄</div>
        <div class="material-info">
          <h4>${file.name}</h4>
          <div class="material-meta"><span>大小：${formatFileSize(file.size)}</span></div>
        </div>
        <div class="material-actions"><a href="${downUrl}" download="${file.name}" class="btn btn-primary">下载</a></div>
      `;
      container.appendChild(card);
    })

  } catch (err) {
    container.innerHTML = `<div class="materials-empty"><p>加载异常</p></div>`;
    console.error(err);
  }
}

// 上传跳转
document.getElementById("uploadArea").addEventListener("click",()=>{
  alert(`命名规则：
带【课件】→自动分到：培训课件
带【教程】→自动分到：操作教程
带【规则/参考】→自动分到：参考资料
其余 → 其他`);
  window.open(`https://github.com/${GITHUB_USER}/${GITHUB_REPO}/upload/main/uploads`,"_blank")
})

document.addEventListener("DOMContentLoaded",()=>{
  const confirm = document.getElementById("confirmUpload");
  const cancel = document.getElementById("cancelUpload");
  if(confirm) confirm.style.display="none";
  if(cancel) cancel.style.display="none";

  // 按钮点击：data-filter就是按钮文字（中文）
  document.querySelectorAll(".filter-btn").forEach(btn=>{
    btn.onclick = ()=>{
      document.querySelectorAll(".filter-btn").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      loadMaterials(btn.innerText.trim()) // 直接拿按钮文字当筛选值！
    }
  })
  loadMaterials("all");
})

function initMaterials(){loadMaterials()}
