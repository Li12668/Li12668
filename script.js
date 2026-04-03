document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generate-btn');
    const clearBtn = document.getElementById('clear-btn');
    const executeWorkflowBtn = document.getElementById('execute-workflow-btn');
    const workflowInput = document.getElementById('workflow-input');
    const workflowResult = document.getElementById('workflow-result');
    const apiCalls = document.getElementById('api-calls');
    const workflowHistory = document.getElementById('workflow-history');
    const categoryFilter = document.getElementById('category-filter');
    const exampleCards = document.querySelectorAll('.example-card');
    
    // 存储当前生成的工作流步骤
    let currentWorkflowSteps = [];
    // 存储当前过滤的分类
    let currentCategory = 'all';
    
    // 认证相关元素
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const apiKeyBtn = document.getElementById('api-key-btn');
    const userInfo = document.getElementById('user-info');
    const authButtons = document.getElementById('auth-buttons');
    const usernameElement = document.getElementById('username');
    
    // 模态框元素
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const apiKeyModal = document.getElementById('api-key-modal');
    const closeBtns = document.querySelectorAll('.close-btn');
    
    // API设置表单
    const apiKeyForm = document.getElementById('api-key-form');
    const apiKeyInput = document.getElementById('api-key');
    const apiModelSelect = document.getElementById('api-model');
    
    // 表单元素
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // 检查用户登录状态
    checkUserStatus();
    
    // 加载工作流历史记录
    loadWorkflowHistory();
    
    // 打开登录模态框
    loginBtn.addEventListener('click', function() {
        loginModal.style.display = 'block';
    });
    
    // 打开注册模态框
    registerBtn.addEventListener('click', function() {
        registerModal.style.display = 'block';
    });
    
    // 关闭模态框
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
            apiKeyModal.style.display = 'none';
        });
    });
    
    // 打开API密钥设置模态框
    apiKeyBtn.addEventListener('click', function() {
        // 加载已保存的API密钥和模型
        const savedApiKey = localStorage.getItem('zhipuApiKey');
        const savedApiModel = localStorage.getItem('zhipuApiModel') || 'glm-4-flash';
        
        if (savedApiKey) {
            apiKeyInput.value = savedApiKey;
        }
        apiModelSelect.value = savedApiModel;
        
        apiKeyModal.style.display = 'block';
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', function(event) {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (event.target === registerModal) {
            registerModal.style.display = 'none';
        }
        if (event.target === apiKeyModal) {
            apiKeyModal.style.display = 'none';
        }
    });
    
    // 登录表单提交
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // 表单验证
        if (!email || !password) {
            alert('请填写所有必填字段');
            return;
        }
        
        // 模拟登录验证
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // 保存登录状态
            localStorage.setItem('currentUser', JSON.stringify(user));
            checkUserStatus();
            loginModal.style.display = 'none';
            showSuccessMessage('登录成功！');
        } else {
            showErrorMessage('邮箱或密码错误');
        }
    });
    
    // 注册表单提交
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        // 表单验证
        if (!name || !email || !password) {
            alert('请填写所有必填字段');
            return;
        }
        
        // 邮箱格式验证
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showErrorMessage('请输入有效的邮箱地址');
            return;
        }
        
        // 密码长度验证
        if (password.length < 6) {
            showErrorMessage('密码长度至少为6位');
            return;
        }
        
        // 模拟注册
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const existingUser = users.find(u => u.email === email);
        
        if (existingUser) {
            showErrorMessage('该邮箱已被注册');
        } else {
            const newUser = { id: Date.now(), name, email, password };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            // 自动登录
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            checkUserStatus();
            registerModal.style.display = 'none';
            showSuccessMessage('注册成功！');
        }
    });
    
    // 退出登录
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        checkUserStatus();
        showSuccessMessage('已退出登录');
    });
    
    // 显示成功消息
    function showSuccessMessage(message) {
        // 创建消息元素
        const messageElement = document.createElement('div');
        messageElement.className = 'message success';
        messageElement.textContent = message;
        
        // 添加到页面
        document.body.appendChild(messageElement);
        
        // 2秒后自动移除
        setTimeout(() => {
            messageElement.remove();
        }, 2000);
    }
    
    // 显示错误消息
    function showErrorMessage(message) {
        // 创建消息元素
        const messageElement = document.createElement('div');
        messageElement.className = 'message error';
        messageElement.textContent = message;
        
        // 添加到页面
        document.body.appendChild(messageElement);
        
        // 3秒后自动移除
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }
    
    // API密钥表单提交
    apiKeyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const apiKey = apiKeyInput.value.trim();
        const apiModel = apiModelSelect.value;
        
        if (!apiKey) {
            showErrorMessage('请输入API密钥');
            return;
        }
        
        // 保存API密钥和模型设置到localStorage
        localStorage.setItem('zhipuApiKey', apiKey);
        localStorage.setItem('zhipuApiModel', apiModel);
        
        apiKeyModal.style.display = 'none';
        showSuccessMessage('API密钥设置保存成功！');
    });
    
    // 检查用户状态
    function checkUserStatus() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            // 已登录
            userInfo.style.display = 'flex';
            authButtons.style.display = 'none';
            usernameElement.textContent = currentUser.name;
        } else {
            // 未登录
            userInfo.style.display = 'none';
            authButtons.style.display = 'flex';
        }
    }
    
    // 配置API密钥
    // 从localStorage中获取API密钥和模型设置
    const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    
    function getApiKey() {
        return localStorage.getItem('zhipuApiKey') || '';
    }
    
    function getApiModel() {
        return localStorage.getItem('zhipuApiModel') || 'glm-4-flash';
    }
    
    // 清空按钮功能
    clearBtn.addEventListener('click', function() {
        workflowInput.value = '';
        workflowResult.innerHTML = '<p class="placeholder">请输入工作流描述并点击生成按钮</p>';
        apiCalls.innerHTML = '<p class="placeholder">生成工作流后将显示API调用详情</p>';
        executeWorkflowBtn.style.display = 'none';
        currentWorkflowSteps = [];
    });
    
    // 执行工作流按钮功能
    executeWorkflowBtn.addEventListener('click', function() {
        if (currentWorkflowSteps.length === 0) {
            showErrorMessage('没有可执行的工作流');
            return;
        }
        
        // 执行工作流
        executeWorkflow();
    });
    
    // 示例工作流程卡片点击功能
    exampleCards.forEach(card => {
        card.addEventListener('click', function() {
            const exampleText = this.getAttribute('data-example');
            workflowInput.value = exampleText;
        });
    });
    
    // 分类过滤器事件监听器
    categoryFilter.addEventListener('change', function() {
        currentCategory = this.value;
        loadWorkflowHistory();
    });
    
    // 生成工作流按钮功能
    generateBtn.addEventListener('click', function() {
        const workflowDescription = workflowInput.value.trim();
        
        if (!workflowDescription) {
            showErrorMessage('请输入工作流程描述');
            return;
        }
        
        const apiKey = getApiKey();
        if (!apiKey) {
            showErrorMessage('请先设置您的智谱AI API密钥');
            return;
        }
        
        // 显示加载状态
        workflowResult.innerHTML = '<div class="loading"></div>';
        apiCalls.innerHTML = '<div class="loading"></div>';
        
        // 调用智谱AI API
        callZhipuAIAPI(workflowDescription)
            .then(data => {
                processWorkflowResponse(data, workflowDescription);
            })
            .catch(error => {
                console.error('API调用错误:', error);
                workflowResult.innerHTML = '<p class="error">API调用失败，请检查网络连接或API密钥</p>';
                apiCalls.innerHTML = '<p class="error">无法获取API调用详情</p>';
                showErrorMessage('API调用失败，请检查网络连接或API密钥');
            });
    });
    
    // 调用智谱AI API
    async function callZhipuAIAPI(description) {
        const prompt = `
请将以下工作流程描述分解为具体的执行步骤，并列出需要调用的API：

工作流程描述：${description}

请按照以下格式返回结果：
1. 工作流程步骤：
- 步骤1：[步骤名称] - [步骤描述]
- 步骤2：[步骤名称] - [步骤描述]
...

2. 需要调用的API：
- API1：[API名称] - [API用途]
- API2：[API名称] - [API用途]
...
`;
        
        const apiKey = getApiKey();
        const apiModel = getApiModel();
        
        const response = await fetch(ZHIPU_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: apiModel, // 使用用户选择的模型
                messages: [
                    { role: 'system', content: '你是一个智能工作流自动化助手，擅长将自然语言需求分解为具体的工作流程步骤和API调用。' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });
        
        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    }
    
    // 处理API响应
    function processWorkflowResponse(data, description) {
        try {
            const content = data.choices[0].message.content;
            
            // 解析响应内容
            const workflowSteps = parseWorkflowSteps(content);
            const apiCallList = parseApiCalls(content);
            
            // 存储当前工作流步骤
            currentWorkflowSteps = workflowSteps;
            
            // 显示工作流结果
            workflowResult.innerHTML = '';
            if (workflowSteps.length > 0) {
                workflowSteps.forEach((step, index) => {
                    const stepElement = document.createElement('div');
                    stepElement.className = 'workflow-step';
                    stepElement.innerHTML = `
                        <h3>步骤 ${index + 1}: ${step.name}</h3>
                        <p>${step.description}</p>
                        <div class="step-status" id="step-${index}">待执行</div>
                    `;
                    workflowResult.appendChild(stepElement);
                });
                // 显示执行按钮
                executeWorkflowBtn.style.display = 'block';
            } else {
                workflowResult.innerHTML = '<p class="error">无法解析工作流程步骤</p>';
                executeWorkflowBtn.style.display = 'none';
            }
            
            // 显示API调用
            apiCalls.innerHTML = '';
            if (apiCallList.length > 0) {
                apiCallList.forEach((api, index) => {
                    const apiElement = document.createElement('div');
                    apiElement.className = 'api-call';
                    apiElement.innerHTML = `
                        <h3>API ${index + 1}: ${api.name}</h3>
                        <p>${api.description}</p>
                    `;
                    apiCalls.appendChild(apiElement);
                });
            } else {
                apiCalls.innerHTML = '<p class="error">无法解析API调用</p>';
            }
            
            // 添加到工作流历史
            addToHistory(description);
            
        } catch (error) {
            console.error('处理响应错误:', error);
            workflowResult.innerHTML = '<p class="error">处理响应失败，请重试</p>';
            apiCalls.innerHTML = '<p class="error">无法获取API调用详情</p>';
            executeWorkflowBtn.style.display = 'none';
        }
    }
    
    // 解析工作流程步骤
    function parseWorkflowSteps(content) {
        const steps = [];
        const stepsMatch = content.match(/1\. 工作流程步骤：[\s\S]*?2\. 需要调用的API：/);
        
        if (stepsMatch) {
            const stepsText = stepsMatch[0];
            const stepRegex = /- 步骤\d+：([^-]+) - (.*)/g;
            let match;
            
            while ((match = stepRegex.exec(stepsText)) !== null) {
                steps.push({
                    name: match[1].trim(),
                    description: match[2].trim()
                });
            }
        }
        
        return steps;
    }
    
    // 解析API调用
    function parseApiCalls(content) {
        const apis = [];
        const apisMatch = content.match(/2\. 需要调用的API：[\s\S]*/);
        
        if (apisMatch) {
            const apisText = apisMatch[0];
            const apiRegex = /- API\d+：([^-]+) - (.*)/g;
            let match;
            
            while ((match = apiRegex.exec(apisText)) !== null) {
                apis.push({
                    name: match[1].trim(),
                    description: match[2].trim()
                });
            }
        }
        
        return apis;
    }
    
    function addToHistory(description, category = 'other') {
        const now = new Date();
        const timestamp = now.toLocaleString();
        
        // 创建历史记录对象
        const historyItem = {
            description: description,
            timestamp: timestamp,
            id: Date.now(),
            category: category
        };
        
        // 从localStorage中获取历史记录
        let history = JSON.parse(localStorage.getItem('workflowHistory') || '[]');
        
        // 添加新的历史记录到开头
        history.unshift(historyItem);
        
        // 限制历史记录数量为10条
        if (history.length > 10) {
            history = history.slice(0, 10);
        }
        
        // 保存到localStorage
        localStorage.setItem('workflowHistory', JSON.stringify(history));
        
        // 更新界面
        updateHistoryUI(history);
    }
    
    // 从localStorage加载工作流历史记录
    function loadWorkflowHistory() {
        const history = JSON.parse(localStorage.getItem('workflowHistory') || '[]');
        updateHistoryUI(history);
    }
    
    // 更新历史记录界面
    function updateHistoryUI(history) {
        // 清空历史记录容器
        workflowHistory.innerHTML = '';
        
        // 根据当前分类过滤历史记录
        const filteredHistory = currentCategory === 'all' 
            ? history 
            : history.filter(item => item.category === currentCategory);
        
        if (filteredHistory.length === 0) {
            // 显示占位符
            workflowHistory.innerHTML = '<p class="placeholder">暂无工作流历史记录</p>';
            return;
        }
        
        // 添加历史记录项
        filteredHistory.forEach(item => {
            const historyElement = document.createElement('div');
            historyElement.className = 'history-item';
            historyElement.innerHTML = `
                <div class="history-header">
                    <h3>工作流</h3>
                    <span class="category-tag">${getCategoryName(item.category)}</span>
                </div>
                <p>${item.description}</p>
                <p class="timestamp">生成时间: ${item.timestamp}</p>
                <div class="history-actions">
                    <button class="edit-btn" data-id="${item.id}">编辑</button>
                    <button class="delete-btn" data-id="${item.id}">删除</button>
                </div>
            `;
            workflowHistory.appendChild(historyElement);
        });
        
        // 添加编辑和删除按钮的事件监听器
        addHistoryItemListeners();
    }
    
    // 获取分类名称
    function getCategoryName(category) {
        const categoryMap = {
            'personal': '个人',
            'work': '工作',
            'other': '其他'
        };
        return categoryMap[category] || '其他';
    }
    
    // 添加历史记录项的事件监听器
    function addHistoryItemListeners() {
        // 编辑按钮
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                editHistoryItem(id);
            });
        });
        
        // 删除按钮
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                deleteHistoryItem(id);
            });
        });
    }
    
    // 编辑历史记录项
    function editHistoryItem(id) {
        const history = JSON.parse(localStorage.getItem('workflowHistory') || '[]');
        const item = history.find(item => item.id === id);
        
        if (item) {
            // 将历史记录项的描述填充到输入框
            workflowInput.value = item.description;
            showSuccessMessage('已加载工作流到编辑区');
        }
    }
    
    // 删除历史记录项
    function deleteHistoryItem(id) {
        if (confirm('确定要删除这条工作流记录吗？')) {
            let history = JSON.parse(localStorage.getItem('workflowHistory') || '[]');
            history = history.filter(item => item.id !== id);
            localStorage.setItem('workflowHistory', JSON.stringify(history));
            updateHistoryUI(history);
            showSuccessMessage('工作流记录已删除');
        }
    }
    
    // 执行工作流
    function executeWorkflow() {
        let stepIndex = 0;
        
        function executeNextStep() {
            if (stepIndex >= currentWorkflowSteps.length) {
                // 所有步骤执行完成
                showSuccessMessage('工作流执行完成！');
                return;
            }
            
            // 获取当前步骤元素
            const stepElement = document.getElementById(`step-${stepIndex}`);
            if (stepElement) {
                // 更新状态为运行中
                stepElement.textContent = '运行中';
                stepElement.className = 'step-status running';
                
                // 模拟执行过程（1-3秒随机时间）
                const executionTime = Math.floor(Math.random() * 2000) + 1000;
                
                setTimeout(() => {
                    // 更新状态为已完成
                    stepElement.textContent = '已完成';
                    stepElement.className = 'step-status completed';
                    
                    // 执行下一步
                    stepIndex++;
                    executeNextStep();
                }, executionTime);
            } else {
                // 步骤元素不存在，执行下一步
                stepIndex++;
                executeNextStep();
            }
        }
        
        // 开始执行第一个步骤
        executeNextStep();
    }
});