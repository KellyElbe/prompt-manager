// 热点运营常用prompt - 管理后台脚本

class PromptManagerAdmin {
    constructor() {
        this.prompts = [];
        this.categories = [];
        this.deletedCategories = []; // 记录已删除的分类
        this.categoryColors = []; // 记录分类颜色
        this.currentCategory = 'all';
        this.currentView = 'grid';
        this.selectedPrompt = null;
        this.sortBy = 'created';
        this.selectedCategoryForEdit = null; // 当前选中要编辑的分类
        this.draggedElement = null; // 拖拽中的元素
        
        this.init();
        this.loadData();
        this.bindEvents();
        this.initDefaultData();
    }

    init() {
        // 获取DOM元素
        this.elements = {
            // 分类导航
            categoryBtns: document.querySelectorAll('.category-btn'),
            addCategoryBtn: document.getElementById('addCategoryBtn'),
            renameCategoryBtn: document.getElementById('renameCategoryBtn'),
            deleteCategoryBtn: document.getElementById('deleteCategoryBtn'),
            
            // 工具栏
            sortSelect: document.getElementById('sortSelect'),
            viewBtns: document.querySelectorAll('.view-btn'),
            resultCount: document.getElementById('resultCount'),
            
            // 主要容器
            promptsContainer: document.getElementById('promptsContainer'),
            emptyState: document.getElementById('emptyState'),
            
            // 详情面板
            detailPanel: document.getElementById('detailPanel'),
            detailTitle: document.getElementById('detailTitle'),
            detailContent: document.getElementById('detailContent'),
            detailClose: document.getElementById('detailClose'),
            
            // Prompt模态框
            promptModal: document.getElementById('promptModal'),
            modalTitle: document.getElementById('modalTitle'),
            promptForm: document.getElementById('promptForm'),
            modalClose: document.getElementById('modalClose'),
            cancelBtn: document.getElementById('cancelBtn'),
            
            // 分类模态框
            categoryModal: document.getElementById('categoryModal'),
            categoryForm: document.getElementById('categoryForm'),
            categoryModalClose: document.getElementById('categoryModalClose'),
            cancelCategoryBtn: document.getElementById('cancelCategoryBtn'),
            
            // 重命名分类模态框
            renameCategoryModal: document.getElementById('renameCategoryModal'),
            renameCategoryForm: document.getElementById('renameCategoryForm'),
            renameCategoryModalClose: document.getElementById('renameCategoryModalClose'),
            cancelRenameCategoryBtn: document.getElementById('cancelRenameCategoryBtn'),
            
            // 删除分类模态框
            deleteCategoryModal: document.getElementById('deleteCategoryModal'),
            deleteCategoryMessage: document.getElementById('deleteCategoryMessage'),
            cancelDeleteCategoryBtn: document.getElementById('cancelDeleteCategoryBtn'),
            confirmDeleteCategoryBtn: document.getElementById('confirmDeleteCategoryBtn'),
            
            // 删除确认
            deleteModal: document.getElementById('deleteModal'),
            cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
            confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
            
            // 按钮
            addPromptBtn: document.getElementById('addPromptBtn'),
            viewFrontendBtn: document.getElementById('viewFrontendBtn'),
            
            // Toast
            copyToast: document.getElementById('copyToast'),
            
            // 计数器
            countAll: document.getElementById('countAll'),
            countText: document.getElementById('countText'),
            countImage: document.getElementById('countImage'),
            countVideo: document.getElementById('countVideo'),
            countCode: document.getElementById('countCode'),
            countOther: document.getElementById('countOther')
        };
    }

    bindEvents() {
        // 分类导航 - 注意：这里不再为分类按钮绑定事件，因为它们会在renderCategories中动态创建

        // 添加分类
        this.elements.addCategoryBtn.addEventListener('click', () => {
            this.openAddCategoryModal();
        });

        // 重命名分类按钮
        this.elements.renameCategoryBtn.addEventListener('click', () => {
            if (this.selectedCategoryForEdit) {
                this.openRenameCategoryModal();
            }
        });

        // 删除分类按钮
        this.elements.deleteCategoryBtn.addEventListener('click', () => {
            if (this.selectedCategoryForEdit) {
                this.openDeleteCategoryModal();
            }
        });

        // 排序
        this.elements.sortSelect.addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.filterAndRender();
        });

        // 视图切换
        this.elements.viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setView(e.target.dataset.view);
            });
        });

        // 详情面板
        this.elements.detailClose.addEventListener('click', () => {
            this.closeDetailPanel();
        });

        // Prompt模态框
        this.elements.addPromptBtn.addEventListener('click', () => {
            this.openAddPromptModal();
        });

        this.elements.modalClose.addEventListener('click', () => {
            this.closeModal();
        });

        this.elements.cancelBtn.addEventListener('click', () => {
            this.closeModal();
        });

        this.elements.promptForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePrompt();
        });

        // 分类模态框
        this.elements.categoryModalClose.addEventListener('click', () => {
            this.closeCategoryModal();
        });

        this.elements.cancelCategoryBtn.addEventListener('click', () => {
            this.closeCategoryModal();
        });

        this.elements.categoryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCategory();
        });

        // 删除确认
        this.elements.cancelDeleteBtn.addEventListener('click', () => {
            this.closeDeleteModal();
        });

        this.elements.confirmDeleteBtn.addEventListener('click', () => {
            this.confirmDelete();
        });

        // 查看前台
        this.elements.viewFrontendBtn.addEventListener('click', () => {
            window.open('prompt-frontend.html', '_blank');
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'n') {
                    e.preventDefault();
                    this.openAddPromptModal();
                }
            }
            
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeDeleteModal();
                this.closeCategoryModal();
                this.closeDetailPanel();
            }
        });

        // 点击模态框外部关闭
        this.elements.promptModal.addEventListener('click', (e) => {
            if (e.target === this.elements.promptModal) {
                this.closeModal();
            }
        });

        this.elements.categoryModal.addEventListener('click', (e) => {
            if (e.target === this.elements.categoryModal) {
                this.closeCategoryModal();
            }
        });

        this.elements.deleteModal.addEventListener('click', (e) => {
            if (e.target === this.elements.deleteModal) {
                this.closeDeleteModal();
            }
        });
        
        // 重命名分类模态框
        this.elements.renameCategoryModalClose.addEventListener('click', () => {
            this.closeRenameCategoryModal();
        });
        
        this.elements.cancelRenameCategoryBtn.addEventListener('click', () => {
            this.closeRenameCategoryModal();
        });
        
        this.elements.renameCategoryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRenamedCategory();
        });
        
        // 删除分类模态框
        this.elements.cancelDeleteCategoryBtn.addEventListener('click', () => {
            this.closeDeleteCategoryModal();
        });
        
        this.elements.confirmDeleteCategoryBtn.addEventListener('click', () => {
            this.confirmDeleteCategory();
        });
        
        this.elements.renameCategoryModal.addEventListener('click', (e) => {
            if (e.target === this.elements.renameCategoryModal) {
                this.closeRenameCategoryModal();
            }
        });
        
        this.elements.deleteCategoryModal.addEventListener('click', (e) => {
            if (e.target === this.elements.deleteCategoryModal) {
                this.closeDeleteCategoryModal();
            }
        });
    }

    // 数据管理
    loadData() {
        const savedPrompts = localStorage.getItem('hotspot-prompts');
        const savedCategories = localStorage.getItem('hotspot-categories');
        const savedDeletedCategories = localStorage.getItem('hotspot-deleted-categories');
        const savedCategoryColors = localStorage.getItem('hotspot-category-colors');
        
        if (savedPrompts) {
            this.prompts = JSON.parse(savedPrompts);
        }
        
        if (savedCategories) {
            this.categories = JSON.parse(savedCategories);
        }
        
        if (savedDeletedCategories) {
            this.deletedCategories = JSON.parse(savedDeletedCategories);
        }
        
        if (savedCategoryColors) {
            this.categoryColors = JSON.parse(savedCategoryColors);
        }
    }

    saveData() {
        localStorage.setItem('hotspot-prompts', JSON.stringify(this.prompts));
        localStorage.setItem('hotspot-categories', JSON.stringify(this.categories));
        localStorage.setItem('hotspot-deleted-categories', JSON.stringify(this.deletedCategories));
        localStorage.setItem('hotspot-category-colors', JSON.stringify(this.categoryColors));
    }

    // 初始化默认数据
    initDefaultData() {
        if (this.categories.length === 0) {
            this.categories = [
                { id: 'text', name: '生文', icon: '✍️' },
                { id: 'image', name: '生图', icon: '🎨' },
                { id: 'video', name: '生视频', icon: '🎬' },
                { id: 'code', name: '代码', icon: '💻' },
                { id: 'other', name: '其他', icon: '🔧' }
            ];
        }
        
        // 为默认分类生成颜色（如果还没有的话）
        const defaultCategories = ['text', 'image', 'video', 'code', 'other'];
        defaultCategories.forEach(categoryId => {
            if (!this.categoryColors.find(c => c.id === categoryId)) {
                this.categoryColors.push({
                    id: categoryId,
                    color: this.generateUniqueColor()
                });
            }
        });

        if (this.prompts.length === 0) {
            this.prompts = [
                {
                    id: this.generateId(),
                    name: '热点文章写作模板',
                    category: 'text',
                    content: '请帮我写一篇关于 [热点话题] 的文章，要求：\n1. 字数约 [字数] 字\n2. 角度要新颖，观点要鲜明\n3. 结合最新的热点事件和数据\n4. 语言要生动有趣，适合社交媒体传播\n5. 包含以下要点：[要点列表]\n\n请确保文章有吸引力的标题，清晰的结构，并在结尾有引发讨论的话题。',
                    description: '专门用于热点话题文章创作的模板，适合快速响应热点事件',
                    tags: ['热点', '文章', '写作', '社交媒体'],
                    createdAt: new Date('2024-01-15').toISOString(),
                    updatedAt: new Date('2024-01-20').toISOString()
                },
                {
                    id: this.generateId(),
                    name: '热点海报文案生成',
                    category: 'image',
                    content: '为 [热点事件/话题] 设计海报文案：\n\n背景信息：[事件背景]\n目标受众：[受众群体]\n传播平台：[微博/微信/抖音等]\n\n要求：\n1. 主标题要有冲击力，能快速抓住注意力\n2. 副标题补充关键信息\n3. 文案要简洁有力，适合配图\n4. 包含相关话题标签\n5. 体现品牌调性：[品牌调性]\n\n请提供3个不同风格的文案方案。',
                    description: '快速生成热点相关的海报文案，适用于各种社交媒体平台',
                    tags: ['海报', '文案', '热点', '视觉'],
                    createdAt: new Date('2024-01-18').toISOString(),
                    updatedAt: new Date('2024-01-18').toISOString()
                },
                {
                    id: this.generateId(),
                    name: '热点短视频脚本',
                    category: 'video',
                    content: '创作一个关于 [热点话题] 的短视频脚本：\n\n视频信息：\n- 时长：[15秒/30秒/60秒]\n- 平台：[抖音/快手/视频号]\n- 风格：[搞笑/正经/情感/知识科普]\n\n脚本要求：\n1. 开头3秒要有强烈的钩子\n2. 结合热点，角度要独特\n3. 节奏紧凑，信息密度高\n4. 结尾要有互动引导\n5. 适合配音和字幕\n\n请提供详细的分镜脚本和文案。',
                    description: '专门针对热点话题的短视频脚本模板，帮助快速制作爆款内容',
                    tags: ['短视频', '脚本', '热点', '抖音'],
                    createdAt: new Date('2024-01-20').toISOString(),
                    updatedAt: new Date('2024-01-22').toISOString()
                }
            ];
        }

        this.saveData();
        this.updateCounts();
        this.renderCategories();
        this.filterAndRender();
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 分类管理
    setActiveCategory(category) {
        this.currentCategory = category;
        
        // 更新按钮状态
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });

        this.filterAndRender();
    }

    // 选择分类进行编辑
    selectCategoryForEdit(categoryId) {
        // 只有【全部】分类不允许编辑
        if (categoryId === 'all') {
            return;
        }

        this.selectedCategoryForEdit = categoryId;
        
        // 更新按钮状态
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.category === categoryId);
        });
        
        // 添加视觉反馈
        this.elements.renameCategoryBtn.classList.add('active');
        this.elements.deleteCategoryBtn.classList.add('active');
    }

    // 取消分类选择
    clearCategorySelection() {
        this.selectedCategoryForEdit = null;
        
        // 清除选中状态
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // 移除视觉反馈
        this.elements.renameCategoryBtn.classList.remove('active');
        this.elements.deleteCategoryBtn.classList.remove('active');
    }

    renderCategories() {
        const categoryNav = document.querySelector('.category-nav');
        
        // 只清除动态添加的自定义分类按钮（不包括HTML中预定义的分类）
        const dynamicBtns = categoryNav.querySelectorAll('.category-btn[data-dynamic="true"]');
        dynamicBtns.forEach(btn => btn.remove());
        
        // 为HTML中现有的分类按钮添加事件监听器，但要检查是否已被删除
        const existingBtns = categoryNav.querySelectorAll('.category-btn:not([data-dynamic="true"])');
        existingBtns.forEach(btn => {
            const categoryId = btn.dataset.category;
            
            // 如果分类已被删除，隐藏按钮
            if (this.deletedCategories.includes(categoryId)) {
                btn.style.display = 'none';
                return;
            } else {
                btn.style.display = 'block';
            }
            
            // 移除旧的事件监听器，添加新的
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', (e) => {
                // 单击选择编辑（除了【全部】分类）
                if (newBtn.dataset.category !== 'all') {
                    this.selectCategoryForEdit(newBtn.dataset.category);
                }
                // 切换分类显示
                this.setActiveCategory(newBtn.dataset.category);
            });
            
            // 添加拖拽事件（除了【全部】分类）
            if (newBtn.dataset.category !== 'all' && newBtn.draggable) {
                this.bindDragEvents(newBtn);
            }
        });
        
        // 添加动态创建的自定义分类
        this.categories.forEach(category => {
            // 检查是否已经在HTML中存在（避免重复）
            const existingBtn = categoryNav.querySelector(`[data-category="${category.id}"]:not([data-dynamic="true"])`);
            if (existingBtn) {
                return; // 如果已存在，跳过
            }
            
            const btn = document.createElement('button');
            btn.className = 'category-btn';
            btn.dataset.category = category.id;
            btn.dataset.custom = 'true';
            btn.dataset.dynamic = 'true'; // 标记为动态创建的分类
            btn.draggable = true; // 添加拖拽属性
            btn.innerHTML = `
                <span class="category-icon">${category.icon}</span>
                <span class="category-name">${category.name}</span>
                <span class="category-count">(<span id="count${category.id.charAt(0).toUpperCase() + category.id.slice(1)}">0</span>)</span>
            `;
            
            btn.addEventListener('click', (e) => {
                // 单击选择编辑
                this.selectCategoryForEdit(category.id);
                // 切换分类显示
                this.setActiveCategory(category.id);
            });
            
            // 添加拖拽事件
            this.bindDragEvents(btn);
            
            categoryNav.appendChild(btn);
        });
        
        // 重新获取分类按钮
        this.elements.categoryBtns = document.querySelectorAll('.category-btn');
        this.updateCounts();
        this.updateCategorySelect();
    }

    updateCategorySelect() {
        const categorySelect = document.getElementById('promptCategory');
        if (!categorySelect) return;
        
        // 清除现有选项（保留第一个空选项）
        const firstOption = categorySelect.querySelector('option[value=""]');
        categorySelect.innerHTML = '';
        if (firstOption) {
            categorySelect.appendChild(firstOption);
        }
        
        // 添加默认分类选项
        const defaultCategories = [
            { id: 'text', name: '生文' },
            { id: 'image', name: '生图' },
            { id: 'video', name: '生视频' },
            { id: 'code', name: '代码' },
            { id: 'other', name: '其他' }
        ];
        
        defaultCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
        
        // 添加自定义分类选项
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }

    // 视图切换
    setView(view) {
        this.currentView = view;
        
        this.elements.viewBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        this.elements.promptsContainer.classList.toggle('list-view', view === 'list');
    }

    // 过滤和渲染
    filterAndRender() {
        let filteredPrompts = [...this.prompts];

        // 按分类过滤
        if (this.currentCategory !== 'all') {
            filteredPrompts = filteredPrompts.filter(p => p.category === this.currentCategory);
        }

        // 排序
        this.sortPrompts(filteredPrompts);

        // 渲染
        this.renderPrompts(filteredPrompts);
        this.updateResultCount(filteredPrompts.length);
    }

    sortPrompts(prompts) {
        prompts.sort((a, b) => {
            switch (this.sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'updated':
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
                case 'created':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });
    }

    // 渲染 Prompts
    renderPrompts(prompts) {
        if (prompts.length === 0) {
            this.elements.promptsContainer.style.display = 'none';
            this.elements.emptyState.style.display = 'flex';
            return;
        }

        this.elements.promptsContainer.style.display = 'grid';
        this.elements.emptyState.style.display = 'none';

        this.elements.promptsContainer.innerHTML = prompts.map(prompt => 
            this.createPromptCard(prompt)
        ).join('');

        // 绑定卡片事件
        this.bindCardEvents();
    }

    createPromptCard(prompt) {
        const preview = prompt.content.length > 100 
            ? prompt.content.substring(0, 100) + '...' 
            : prompt.content;

        const categoryInfo = this.categories.find(c => c.id === prompt.category) || 
                           { name: prompt.category, icon: '📝' };
        
        const categoryColor = this.getCategoryColor(prompt.category);

        return `
            <div class="prompt-card" data-id="${prompt.id}">
                <div class="card-header">
                    <div>
                        <h3 class="card-title">${this.escapeHtml(prompt.name)}</h3>
                        <span class="card-category ${prompt.category}" style="background-color: ${categoryColor}; color: white;">${categoryInfo.name}</span>
                    </div>
                </div>
                <div class="card-content">
                    <p class="card-description">${this.escapeHtml(prompt.description)}</p>
                    <div class="card-preview">${this.escapeHtml(preview)}</div>
                </div>
                <div class="card-footer">
                    <div class="card-actions">
                        <button class="card-action" data-action="copy" data-id="${prompt.id}" title="复制">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        </button>
                        <button class="card-action" data-action="edit" data-id="${prompt.id}" title="编辑">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="card-action" data-action="delete" data-id="${prompt.id}" title="删除">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="card-meta">
                    <span class="card-date">创建：${this.formatDate(prompt.createdAt)}</span>
                    <span class="card-date">更新：${this.formatDate(prompt.updatedAt)}</span>
                </div>
            </div>
        `;
    }

    bindCardEvents() {
        // 卡片点击事件
        document.querySelectorAll('.prompt-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.card-action')) {
                    const id = card.dataset.id;
                    this.selectPrompt(id);
                }
            });
        });

        // 操作按钮事件
        document.querySelectorAll('.card-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const id = btn.dataset.id;
                
                switch (action) {
                    case 'copy':
                        this.copyPrompt(id);
                        break;
                    case 'edit':
                        this.editPrompt(id);
                        break;
                    case 'delete':
                        this.deletePrompt(id);
                        break;
                }
            });
        });
    }

    // Prompt 操作
    selectPrompt(id) {
        this.selectedPrompt = this.prompts.find(p => p.id === id);
        if (this.selectedPrompt) {
            this.showPromptDetail(this.selectedPrompt);
        }
    }

    copyPrompt(id) {
        const prompt = this.prompts.find(p => p.id === id);
        if (prompt) {
            navigator.clipboard.writeText(prompt.content).then(() => {
                this.showCopyToast();
            });
        }
    }

    editPrompt(id) {
        const prompt = this.prompts.find(p => p.id === id);
        if (prompt) {
            this.openEditPromptModal(prompt);
        }
    }

    deletePrompt(id) {
        this.promptToDelete = id;
        this.openDeleteModal();
    }

    confirmDelete() {
        if (this.promptToDelete) {
            this.prompts = this.prompts.filter(p => p.id !== this.promptToDelete);
            this.saveData();
            this.updateCounts();
            this.filterAndRender();
            this.closeDeleteModal();
            
            // 如果删除的是当前选中的prompt，关闭详情面板
            if (this.selectedPrompt && this.selectedPrompt.id === this.promptToDelete) {
                this.closeDetailPanel();
            }
        }
    }

    // 详情面板
    showPromptDetail(prompt) {
        this.elements.detailTitle.textContent = prompt.name;
        const categoryInfo = this.categories.find(c => c.id === prompt.category) || 
                           { name: prompt.category, icon: '📝' };
        
        this.elements.detailContent.innerHTML = `
            <div class="detail-info">
                <div class="detail-actions">
                    <button class="btn btn-primary" onclick="promptManagerAdmin.copyPrompt('${prompt.id}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        复制内容
                    </button>
                    <button class="btn btn-secondary" onclick="promptManagerAdmin.editPrompt('${prompt.id}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        编辑
                    </button>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>分类</h4>
                <span class="card-category ${prompt.category}">${categoryInfo.name}</span>
            </div>
            
            <div class="detail-section">
                <h4>描述</h4>
                <p class="detail-meta">${this.escapeHtml(prompt.description)}</p>
            </div>
            
            <div class="detail-section">
                <h4>Prompt 内容</h4>
                <div class="detail-prompt-content">${this.escapeHtml(prompt.content)}</div>
            </div>
            
            <div class="detail-section">
                <h4>时间信息</h4>
                <div class="detail-meta">
                    <strong>创建时间：</strong> ${this.formatDate(prompt.createdAt)}<br>
                    <strong>更新时间：</strong> ${this.formatDate(prompt.updatedAt)}
                </div>
            </div>
        `;

        // 更新卡片选中状态
        document.querySelectorAll('.prompt-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.id === prompt.id);
        });
    }

    closeDetailPanel() {
        this.selectedPrompt = null;
        this.elements.detailTitle.textContent = '选择一个 Prompt';
        this.elements.detailContent.innerHTML = `
            <div class="detail-placeholder">
                <div class="placeholder-icon">👈</div>
                <p>点击左侧的 Prompt 卡片查看详细信息</p>
            </div>
        `;

        // 清除卡片选中状态
        document.querySelectorAll('.prompt-card').forEach(card => {
            card.classList.remove('selected');
        });
    }

    // 模态框管理
    openAddPromptModal() {
        this.elements.modalTitle.textContent = '添加 Prompt';
        this.elements.promptForm.reset();
        this.currentEditingId = null;
        this.populateCategorySelect();
        this.showModal();
    }

    openEditPromptModal(prompt) {
        this.elements.modalTitle.textContent = '编辑 Prompt';
        this.currentEditingId = prompt.id;
        
        // 填充表单
        document.getElementById('promptName').value = prompt.name;
        document.getElementById('promptCategory').value = prompt.category;
        document.getElementById('promptContent').value = prompt.content;
        document.getElementById('promptDescription').value = prompt.description;
        document.getElementById('promptTags').value = prompt.tags.join(', ');
        
        this.populateCategorySelect();
        this.showModal();
    }

    populateCategorySelect() {
        const select = document.getElementById('promptCategory');
        const currentValue = select.value;
        
        // 清空现有选项（保留第一个空选项）
        select.innerHTML = '<option value="">选择分类</option>';
        
        // 添加分类选项
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
        
        // 恢复选中值
        if (currentValue) {
            select.value = currentValue;
        }
    }

    showModal() {
        this.elements.promptModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.elements.promptModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // 分类模态框
    openAddCategoryModal() {
        this.elements.categoryForm.reset();
        this.showCategoryModal();
    }

    showCategoryModal() {
        this.elements.categoryModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeCategoryModal() {
        this.elements.categoryModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    saveCategory() {
        const formData = new FormData(this.elements.categoryForm);
        const categoryData = {
            id: this.generateId(),
            name: formData.get('name'),
            icon: formData.get('icon') || '📁',
            color: this.generateUniqueColor() // 生成唯一颜色
        };

        this.categories.push(categoryData);
        
        // 保存颜色信息
        this.categoryColors.push({
            id: categoryData.id,
            color: categoryData.color
        });
        
        this.saveData();
        this.renderCategories();
        this.closeCategoryModal();
    }

    openDeleteModal() {
        this.elements.deleteModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeDeleteModal() {
        this.elements.deleteModal.classList.remove('active');
        document.body.style.overflow = '';
        this.promptToDelete = null;
    }

    savePrompt() {
        const formData = new FormData(this.elements.promptForm);
        const tags = formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag);
        
        const promptData = {
            name: formData.get('name'),
            category: formData.get('category'),
            content: formData.get('content'),
            description: formData.get('description'),
            tags: tags
        };

        if (this.currentEditingId) {
            // 编辑现有 prompt
            const prompt = this.prompts.find(p => p.id === this.currentEditingId);
            if (prompt) {
                Object.assign(prompt, promptData);
                prompt.updatedAt = new Date().toISOString();
            }
        } else {
            // 添加新 prompt
            const newPrompt = {
                id: this.generateId(),
                ...promptData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.prompts.push(newPrompt);
        }

        this.saveData();
        this.updateCounts();
        this.filterAndRender();
        this.closeModal();
    }

    // 工具函数
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateResultCount(count) {
        this.elements.resultCount.textContent = `共 ${count} 个 Prompt`;
    }

    updateCounts() {
        const counts = {
            all: this.prompts.length
        };

        // 计算HTML中预定义分类的数量
        const predefinedCategories = ['text', 'image', 'video', 'code', 'other'];
        predefinedCategories.forEach(categoryId => {
            counts[categoryId] = this.prompts.filter(p => p.category === categoryId).length;
        });

        // 计算动态添加的分类数量
        this.categories.forEach(category => {
            counts[category.id] = this.prompts.filter(p => p.category === category.id).length;
        });

        // 更新显示
        Object.keys(counts).forEach(key => {
            const element = document.getElementById(`count${key.charAt(0).toUpperCase() + key.slice(1)}`);
            if (element) {
                element.textContent = counts[key];
            }
        });
    }

    showCopyToast() {
        this.elements.copyToast.classList.add('show');
        setTimeout(() => {
            this.elements.copyToast.classList.remove('show');
        }, 2000);
    }

    // 重命名分类
    openRenameCategoryModal() {
        if (!this.selectedCategoryForEdit) return;
        
        const category = this.categories.find(c => c.id === this.selectedCategoryForEdit);
        if (!category) return;
        
        // 填充当前分类信息
        document.getElementById('renameCategoryName').value = category.name;
        document.getElementById('renameCategoryIcon').value = category.icon;
        
        this.elements.renameCategoryModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeRenameCategoryModal() {
        this.elements.renameCategoryModal.classList.remove('active');
        document.body.style.overflow = '';
        this.elements.renameCategoryForm.reset();
        this.clearCategorySelection(); // 关闭模态框时清除选择
    }

    saveRenamedCategory() {
        if (!this.selectedCategoryForEdit) return;
        
        const formData = new FormData(this.elements.renameCategoryForm);
        const newName = formData.get('name');
        const newIcon = formData.get('icon');
        
        // 更新categories数组中的分类（如果存在）
        const category = this.categories.find(c => c.id === this.selectedCategoryForEdit);
        if (category) {
            category.name = newName;
            category.icon = newIcon || category.icon;
        }
        
        // 更新DOM中的分类按钮
        const categoryBtn = document.querySelector(`[data-category="${this.selectedCategoryForEdit}"]`);
        if (categoryBtn) {
            const nameSpan = categoryBtn.querySelector('.category-name');
            const iconSpan = categoryBtn.querySelector('.category-icon');
            if (nameSpan) nameSpan.textContent = newName;
            if (iconSpan && newIcon) iconSpan.textContent = newIcon;
        }
        
        this.saveData();
        this.renderCategories();
        this.updateCategorySelect();
        this.closeRenameCategoryModal();
        
        // 如果当前有选中的prompt，刷新详情显示
        if (this.selectedPrompt) {
            this.showPromptDetail(this.selectedPrompt);
        }
    }

    // 删除分类
    openDeleteCategoryModal() {
        if (!this.selectedCategoryForEdit) return;
        
        const category = this.categories.find(c => c.id === this.selectedCategoryForEdit);
        if (!category) return;
        
        // 计算该分类下的prompt数量
        const promptCount = this.prompts.filter(p => p.category === this.selectedCategoryForEdit).length;
        
        this.elements.deleteCategoryMessage.textContent = 
            `确定要删除分类"${category.name}"吗？${promptCount > 0 ? `该分类下有 ${promptCount} 个 Prompt。` : ''}`;
        
        this.elements.deleteCategoryModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeDeleteCategoryModal() {
        this.elements.deleteCategoryModal.classList.remove('active');
        document.body.style.overflow = '';
        this.clearCategorySelection(); // 关闭模态框时清除选择
    }

    confirmDeleteCategory() {
        if (!this.selectedCategoryForEdit) return;
        
        // 获取要删除的分类信息
        const categoryToDelete = this.selectedCategoryForEdit;
        
        // 记录已删除的分类
        if (!this.deletedCategories.includes(categoryToDelete)) {
            this.deletedCategories.push(categoryToDelete);
        }
        
        // 删除该分类下的所有prompt
        this.prompts = this.prompts.filter(prompt => prompt.category !== categoryToDelete);
        
        // 从categories数组中删除分类（如果存在）
        this.categories = this.categories.filter(c => c.id !== categoryToDelete);
        
        // 从DOM中删除对应的分类按钮
        const categoryBtn = document.querySelector(`[data-category="${categoryToDelete}"]`);
        if (categoryBtn) {
            categoryBtn.remove();
        }
        
        // 如果当前显示的就是被删除的分类，切换到"全部"
        if (this.currentCategory === categoryToDelete) {
            this.currentCategory = 'all';
        }
        
        // 清除选中状态
        this.clearCategorySelection();
        
        this.saveData();
        this.renderCategories();
        this.updateCounts();
        this.filterAndRender();
        this.closeDeleteCategoryModal();
        
        // 重新设置活动分类
        this.setActiveCategory(this.currentCategory);
    }
    
    // 拖拽功能
    bindDragEvents(element) {
        element.addEventListener('dragstart', (e) => {
            this.draggedElement = element;
            element.style.opacity = '0.5';
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', element.outerHTML);
        });
        
        element.addEventListener('dragend', (e) => {
            element.style.opacity = '1';
            this.draggedElement = null;
        });
        
        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });
        
        element.addEventListener('drop', (e) => {
            e.preventDefault();
            if (this.draggedElement && this.draggedElement !== element) {
                this.reorderCategories(this.draggedElement, element);
            }
        });
    }
    
    reorderCategories(draggedElement, targetElement) {
        const categoryNav = document.querySelector('.category-nav');
        const allButtons = Array.from(categoryNav.querySelectorAll('.category-btn'));
        
        // 获取拖拽元素和目标元素的位置
        const draggedIndex = allButtons.indexOf(draggedElement);
        const targetIndex = allButtons.indexOf(targetElement);
        
        if (draggedIndex > targetIndex) {
            categoryNav.insertBefore(draggedElement, targetElement);
        } else {
            categoryNav.insertBefore(draggedElement, targetElement.nextSibling);
        }
        
        // 保存新的顺序到categories数组（如果需要的话）
        this.saveCategoryOrder();
    }
    
    saveCategoryOrder() {
        const categoryNav = document.querySelector('.category-nav');
        const buttons = categoryNav.querySelectorAll('.category-btn[data-dynamic="true"]');
        const newOrder = [];
        
        buttons.forEach(btn => {
            const categoryId = btn.dataset.category;
            const category = this.categories.find(c => c.id === categoryId);
            if (category) {
                newOrder.push(category);
            }
        });
        
        this.categories = newOrder;
        this.saveData();
    }
    
    // 颜色生成功能
    generateUniqueColor() {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
            '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
        ];
        
        // 获取已使用的颜色
        const usedColors = this.categoryColors.map(c => c.color);
        
        // 找到未使用的颜色
        const availableColors = colors.filter(color => !usedColors.includes(color));
        
        if (availableColors.length > 0) {
            return availableColors[Math.floor(Math.random() * availableColors.length)];
        } else {
            // 如果所有颜色都用完了，随机返回一个
            return colors[Math.floor(Math.random() * colors.length)];
        }
    }
    
    getCategoryColor(categoryId) {
        const colorInfo = this.categoryColors.find(c => c.id === categoryId);
        return colorInfo ? colorInfo.color : '#6c757d'; // 默认灰色
    }
}

// 初始化应用
let promptManagerAdmin;
document.addEventListener('DOMContentLoaded', () => {
    promptManagerAdmin = new PromptManagerAdmin();
});

// 全局函数（供HTML调用）
window.openAddPromptModal = () => promptManagerAdmin.openAddPromptModal();
window.promptManagerAdmin = promptManagerAdmin;