// 热点运营常用prompt - 前台展示脚本

class PromptFrontend {
    constructor() {
        this.prompts = [];
        this.categories = [];
        this.categoryColors = []; // 添加颜色数据
        this.currentCategory = 'all';
        this.currentView = 'grid';
        this.selectedPrompt = null;
        this.sortBy = 'created';
        
        this.init();
        this.loadData();
        this.bindEvents();
        this.renderAll();
    }

    init() {
        // 获取DOM元素
        this.elements = {
            // 分类导航
            categoryBtns: document.querySelectorAll('.category-btn'),
            
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
            
            // Toast
            copyToast: document.getElementById('copyToast'),
            
            // 计数器
            countAll: document.getElementById('countAll')
        };
    }

    bindEvents() {
        // 分类导航
        this.elements.categoryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveCategory(e.target.closest('.category-btn').dataset.category);
            });
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

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeDetailPanel();
            }
        });

        // 定期检查数据更新
        setInterval(() => {
            this.checkForUpdates();
        }, 5000); // 每5秒检查一次
    }

    // 数据管理
    loadData() {
        const savedPrompts = localStorage.getItem('hotspot-prompts');
        const savedCategories = localStorage.getItem('hotspot-categories');
        const savedCategoryColors = localStorage.getItem('hotspot-category-colors');
        
        if (savedPrompts) {
            this.prompts = JSON.parse(savedPrompts);
        }
        
        if (savedCategories) {
            this.categories = JSON.parse(savedCategories);
        }
        
        if (savedCategoryColors) {
            this.categoryColors = JSON.parse(savedCategoryColors);
        }
    }

    checkForUpdates() {
        const savedPrompts = localStorage.getItem('hotspot-prompts');
        const savedCategories = localStorage.getItem('hotspot-categories');
        const savedCategoryColors = localStorage.getItem('hotspot-category-colors');
        
        let needsUpdate = false;
        
        if (savedPrompts && JSON.stringify(this.prompts) !== savedPrompts) {
            this.prompts = JSON.parse(savedPrompts);
            needsUpdate = true;
        }
        
        if (savedCategories && JSON.stringify(this.categories) !== savedCategories) {
            this.categories = JSON.parse(savedCategories);
            needsUpdate = true;
        }
        
        if (savedCategoryColors && JSON.stringify(this.categoryColors) !== savedCategoryColors) {
            this.categoryColors = JSON.parse(savedCategoryColors);
            needsUpdate = true;
        }
        
        if (needsUpdate) {
            this.renderAll();
        }
    }

    renderAll() {
        this.updateCounts();
        this.renderCategories();
        this.filterAndRender();
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

    renderCategories() {
        const categoryNav = document.querySelector('.category-nav');
        const allButton = categoryNav.querySelector('[data-category="all"]');
        
        // 清除除了"全部"按钮之外的所有按钮
        const existingBtns = categoryNav.querySelectorAll('.category-btn:not([data-category="all"])');
        existingBtns.forEach(btn => btn.remove());
        
        // 添加默认分类（如果它们还存在的话）
        const defaultCategories = [
            { id: 'text', name: '生文', icon: '✍️' },
            { id: 'image', name: '生图', icon: '🎨' },
            { id: 'video', name: '生视频', icon: '🎬' },
            { id: 'code', name: '代码', icon: '💻' },
            { id: 'other', name: '其他', icon: '🔧' }
        ];
        
        // 检查哪些默认分类还有对应的prompts或者在categories数组中
        const activeCategories = [];
        
        defaultCategories.forEach(defaultCat => {
            // 检查是否有该分类的prompts
            const hasPrompts = this.prompts.some(p => p.category === defaultCat.id);
            // 检查是否在categories数组中（可能被重命名了）
            const categoryData = this.categories.find(c => c.id === defaultCat.id);
            
            if (hasPrompts || categoryData) {
                // 使用自定义的名称和图标（如果有的话）
                const category = categoryData || defaultCat;
                activeCategories.push({
                    id: defaultCat.id,
                    name: category.name,
                    icon: category.icon
                });
            }
        });
        
        // 添加其他自定义分类
        this.categories.forEach(category => {
            // 如果不是默认分类，直接添加
            if (!defaultCategories.some(dc => dc.id === category.id)) {
                activeCategories.push(category);
            }
        });
        
        // 渲染所有活跃的分类
        activeCategories.forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'category-btn';
            btn.dataset.category = category.id;
            btn.innerHTML = `
                <span class="category-icon">${category.icon}</span>
                <span class="category-name">${category.name}</span>
                <span class="category-count">(<span id="count${category.id.charAt(0).toUpperCase() + category.id.slice(1)}">0</span>)</span>
            `;
            
            btn.addEventListener('click', () => {
                this.setActiveCategory(category.id);
            });
            
            categoryNav.appendChild(btn);
        });
        
        // 重新获取分类按钮
        this.elements.categoryBtns = document.querySelectorAll('.category-btn');
        this.updateCounts();
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

        // 复制按钮事件
        document.querySelectorAll('.card-action[data-action="copy"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                this.copyPrompt(id);
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
            }).catch(() => {
                // 降级方案：使用传统方法复制
                const textArea = document.createElement('textarea');
                textArea.value = prompt.content;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showCopyToast();
            });
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
                    <button class="btn btn-primary" onclick="promptFrontend.copyPrompt('${prompt.id}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        复制内容
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
    
    getCategoryColor(categoryId) {
        const colorInfo = this.categoryColors.find(c => c.id === categoryId);
        return colorInfo ? colorInfo.color : '#6c757d'; // 默认灰色
    }
}

// 初始化应用
let promptFrontend;
document.addEventListener('DOMContentLoaded', () => {
    promptFrontend = new PromptFrontend();
});

// 全局函数（供HTML调用）
window.promptFrontend = promptFrontend;