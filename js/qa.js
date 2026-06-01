/**
 * Q&A 问答模块
 * 数据存储在 localStorage，支持提问、回复功能
 */
const QA_STORAGE_KEY = 'drone_club_qa';

/**
 * 获取所有问答数据
 */
function getQAData() {
    const data = localStorage.getItem(QA_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

/**
 * 保存问答数据
 */
function saveQAData(qaList) {
    localStorage.setItem(QA_STORAGE_KEY, JSON.stringify(qaList));
}

/**
 * 提交新问题
 */
function submitQuestion() {
    const questionTitle = document.getElementById('qaQuestion').value.trim();
    const questionContent = document.getElementById('qaContent').value.trim();

    if (!questionTitle) {
        alert('请输入问题标题！');
        return;
    }

    // 构造问题数据
    const newQuestion = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        title: questionTitle,
        content: questionContent,
        createTime: new Date().toLocaleString('zh-CN'),
        replies: [] // 回复列表
    };

    // 保存并刷新列表
    const qaList = getQAData();
    qaList.unshift(newQuestion); // 最新的问题在最前面
    saveQAData(qaList);
    renderQAData();

    // 清空表单
    document.getElementById('qaQuestion').value = '';
    document.getElementById('qaContent').value = '';
    alert('问题提交成功！');
}

/**
 * 提交回复
 */
function submitReply(questionId) {
    const replyContent = document.getElementById(`replyContent-${questionId}`).value.trim();
    if (!replyContent) {
        alert('请输入回复内容！');
        return;
    }

    // 构造回复数据
    const newReply = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 4),
        content: replyContent,
        createTime: new Date().toLocaleString('zh-CN')
    };

    // 更新问答数据
    const qaList = getQAData();
    const targetQuestion = qaList.find(item => item.id === questionId);
    if (targetQuestion) {
        targetQuestion.replies.push(newReply);
        saveQAData(qaList);
        renderQAData();
    }

    // 清空回复框
    document.getElementById(`replyContent-${questionId}`).value = '';
}

/**
 * 渲染问答列表
 */
function renderQAData() {
    const qaList = getQAData();
    const container = document.getElementById('qaList');

    // 无数据时显示占位
    if (qaList.length === 0) {
        container.innerHTML = `
            <div class="materials-empty">
                <div class="empty-icon">❓</div>
                <p>暂无问答内容，快来提出第一个问题吧！</p>
            </div>
        `;
        return;
    }

    // 渲染问答卡片
    container.innerHTML = qaList.map(qa => `
        <div class="qa-card" data-id="${qa.id}">
            <div class="qa-question">
                <h3 class="qa-question-title">${qa.title}</h3>
                <div class="qa-meta">提问时间：${qa.createTime}</div>
                <div class="qa-content">${qa.content.replace(/\n/g, '<br>')}</div>
            </div>

            <!-- 回复区域 -->
            <div class="qa-replies">
                <h4 class="qa-reply-title">回复 (${qa.replies.length})</h4>
                ${qa.replies.length > 0 
                    ? qa.replies.map(reply => `
                        <div class="qa-reply-item">
                            <div class="qa-reply-content">${reply.content.replace(/\n/g, '<br>')}</div>
                            <div class="qa-reply-meta">回复时间：${reply.createTime}</div>
                        </div>
                      `).join('') 
                    : '<div class="qa-no-reply">暂无回复，快来第一个解答吧！</div>'
                }
                
                <!-- 回复表单 -->
                <div class="qa-reply-form">
                    <textarea id="replyContent-${qa.id}" rows="2" placeholder="输入你的回复..."></textarea>
                    <button class="btn btn-primary btn-sm" onclick="submitReply('${qa.id}')">提交回复</button>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * 初始化 Q&A 模块
 */
function initQA() {
    // 绑定提交问题事件
    document.getElementById('submitQuestion')?.addEventListener('click', submitQuestion);
    // 初始渲染问答列表
    renderQAData();
}