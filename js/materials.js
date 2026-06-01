/**
 * 培训资料模块
 * 文件元信息存储在 localStorage，为后续后端预留接口
 */

const STORAGE_KEY = 'drone_club_materials';
let pendingFiles = [];

/**
 * 获取已存储的资料列表
 */
function getMaterials() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

/**
 * 保存资料列表
 */
function saveMaterials(materials) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
}

/**
 * 添加资料
 * TODO: 后端接口 - POST /api/materials
 */
function addMaterial(material) {
    const materials = getMaterials();
    material.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    material.uploadTime = new Date().toLocaleString('zh-CN');
    materials.unshift(material);
    saveMaterials(materials);
    return material;
}

/**
 * 删除资料
 * TODO: 后端接口 - DELETE /api/materials/:id
 */
function deleteMaterial(id) {
    let materials = getMaterials();
    materials = materials.filter(m => m.id !== id);
    saveMaterials(materials);
}

/**
 * 渲染资料列表
 */
function renderMaterials(filter = 'all') {
    const container = document.getElementById('materials-content');
    let materials = getMaterials();

    if (filter !== 'all') {
        materials = materials.filter(m => m.category === filter);
    }

    if (materials.length === 0) {
        container.innerHTML = `
            <div class="materials-empty">
                <div class="empty-icon">📂</div>
                <p>暂无资料，点击上方区域上传</p>
            </div>
        `;
        return;
    }

    const categoryMap = {
        training: '培训课件',
        tutorial: '操作教程',
        reference: '参考资料',
        other: '其他'
    };

    container.innerHTML = materials.map(m => `
        <div class="material-card" data-id="${m.id}">
            <div class="material-icon">${getMaterialIcon(m.fileName)}</div>
            <div class="material-info">
                <h4>${m.fileName}</h4>
                <div class="material-meta">
                    <span>${categoryMap[m.category] || m.category}</span>
                    <span>${m.fileSize}</span>
                    <span>${m.uploadTime}</span>
                </div>
                ${m.description ? `<p class="material-desc">${m.description}</p>` : ''}
            </div>
            <div class="material-actions">
                ${m.dataUrl ? `<a href="${m.dataUrl}" download="${m.fileName}" class="btn btn-primary">下载</a>` : ''}
                <button class="btn btn-delete" onclick="handleDelete('${m.id}')">删除</button>
            </div>
        </div>
    `).join('');
}

/**
 * 获取资料图标
 */
function getMaterialIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        pdf: '📄', ppt: '📊', pptx: '📊',
        doc: '📝', docx: '📝', jpg: '🖼️',
        png: '🖼️', mp4: '🎬', zip: '📦'
    };
    return icons[ext] || '📎';
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * 处理文件选择
 */
function handleFileSelect(files) {
    if (!files || files.length === 0) return;

    pendingFiles = Array.from(files);
    const uploadMeta = document.getElementById('uploadMeta');

    if (pendingFiles.length === 1) {
        document.getElementById('fileDesc').placeholder = `为"${pendingFiles[0].name}"添加描述`;
    } else {
        document.getElementById('fileDesc').placeholder = `已选择 ${pendingFiles.length} 个文件，添加统一描述`;
    }

    uploadMeta.style.display = 'block';
}

/**
 * 确认上传
 * TODO: 后端实现 - 文件上传至服务器，返回文件URL
 */
function handleConfirmUpload() {
    const category = document.getElementById('fileCategory').value;
    const description = document.getElementById('fileDesc').value;

    pendingFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const material = {
                fileName: file.name,
                fileSize: formatFileSize(file.size),
                category: category,
                description: description,
                dataUrl: e.target.result  // 纯前端方案：base64存储（仅适合小文件）
            };
            addMaterial(material);
            renderMaterials(getCurrentFilter());
        };
        // 对于大文件（>5MB），不存储dataUrl以避免localStorage限制
        if (file.size > 5 * 1024 * 1024) {
            const material = {
                fileName: file.name,
                fileSize: formatFileSize(file.size),
                category: category,
                description: description,
                dataUrl: null  // 大文件需后端存储
            };
            addMaterial(material);
            renderMaterials(getCurrentFilter());
        } else {
            reader.readAsDataURL(file);
        }
    });

    // 重置表单
    pendingFiles = [];
    document.getElementById('uploadMeta').style.display = 'none';
    document.getElementById('fileDesc').value = '';
    document.getElementById('fileInput').value = '';
}

/**
 * 取消上传
 */
function handleCancelUpload() {
    pendingFiles = [];
    document.getElementById('uploadMeta').style.display = 'none';
    document.getElementById('fileDesc').value = '';
    document.getElementById('fileInput').value = '';
}

/**
 * 删除资料
 */
function handleDelete(id) {
    if (confirm('确定要删除这份资料吗？')) {
        deleteMaterial(id);
        renderMaterials(getCurrentFilter());
    }
}

/**
 * 获取当前筛选条件
 */
function getCurrentFilter() {
    const activeBtn = document.querySelector('.filter-btn.active');
    return activeBtn ? activeBtn.dataset.filter : 'all';
}

/**
 * 初始化培训资料模块
 */
function initMaterials() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    // 点击上传
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => handleFileSelect(e.target.files));

    // 拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFileSelect(e.dataTransfer.files);
    });

    // 确认/取消上传
    document.getElementById('confirmUpload').addEventListener('click', handleConfirmUpload);
    document.getElementById('cancelUpload').addEventListener('click', handleCancelUpload);

    // 筛选按钮
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderMaterials(btn.dataset.filter);
        });
    });

    // 初始渲染
    renderMaterials();
}
