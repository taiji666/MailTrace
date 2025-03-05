document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const elements = {
        // Forms
        queryForm: document.getElementById('queryForm'),
        linkForm: document.getElementById('linkForm'),
        
        // Inputs
        clientId: document.getElementById('clientId'),
        clientIdInput: document.getElementById('clientIdInput'),
        guidInput: document.getElementById('guidInput'),
        imageSelect: document.getElementById('imageSelect'),
        generatedLink: document.getElementById('generatedLink'),
        
        // Results elements
        resultContainer: document.querySelector('.result-container'),
        resultTable: document.querySelector('.result-table'),
        queryResult: document.getElementById('queryResult'),
        resultCount: document.getElementById('resultCount'),
        noResults: document.getElementById('noResults'),
        linkResult: document.getElementById('linkResult'),
        
        // Alerts
        errorAlert: document.getElementById('errorAlert'),
        errorMessage: document.getElementById('errorMessage'),
        successAlert: document.getElementById('successAlert'),
        successMessage: document.getElementById('successMessage'),
        
        // Buttons
        generateGuidBtn: document.getElementById('generateGuid'),
        copyButton: document.getElementById('copyButton')
    };

    // Initialize event listeners
    initEventListeners();
    
    // Functions
    function initEventListeners() {
        // Query form submission
        elements.queryForm.addEventListener('submit', handleQuerySubmit);
        
        // Link form submission
        elements.linkForm.addEventListener('submit', handleLinkGeneration);
        
        // Generate GUID button
        elements.generateGuidBtn.addEventListener('click', generateRandomGuid);
        
        // Copy button
        elements.copyButton.addEventListener('click', copyToClipboard);
    }
    
    // Handle query form submission
    async function handleQuerySubmit(e) {
        e.preventDefault();
        const clientId = elements.clientId.value.trim();
        
        if (!clientId) {
            showError('请输入有效的Client ID');
            return;
        }
        
        try {
            showLoader();
            // API call to get tracking data
            const response = await fetch(`/api/query/${clientId}`);
            
            if (!response.ok) {
                throw new Error('服务器响应错误: ' + response.status);
            }
            
            const data = await response.json();
            displayResults(data);
        } catch (error) {
            showError('查询失败: ' + error.message);
        } finally {
            hideLoader();
        }
    }
    
    // Display query results
    function displayResults(data) {
        elements.queryResult.innerHTML = '';
        elements.resultContainer.style.display = 'block';
        
        const results = Object.values(data);
        elements.resultCount.textContent = results.length;
        
        if (results.length > 0) {
            results.forEach(item => {
                const row = document.createElement('tr');
                const user_agent = item.user_agent ;
                const location = [
                    item.country || '', 
                    item.province || '', 
                    item.city || ''
                ].filter(Boolean).join(' ');
                
                row.innerHTML = `
                    <td>${item.guid || '---'}</td>
                    <td>${item.ip || '---'}</td>
                    <td>${location || '未知'}</td>
                    <td>${formatDateTime(item.time) || '---'}</td>
                    <td>${user_agent || '---'}</td>
                    <td>${item.client_id || '---'}</td>
                    <td>${item.image_id || '---'}</td>
                `;
                elements.queryResult.appendChild(row);
            });
            
            elements.resultTable.style.display = 'block';
            elements.noResults.style.display = 'none';
        } else {
            elements.resultTable.style.display = 'none';
            elements.noResults.style.display = 'block';
        }
    }
    
    // Handle link generation
    function handleLinkGeneration(e) {
        e.preventDefault();
        
        const imageId = elements.imageSelect.value;
        const clientId = elements.clientIdInput.value.trim();
        const guid = elements.guidInput.value.trim();
        
        if (!imageId || !clientId || !guid) {
            showError('请填写所有必填字段');
            return;
        }
        
        const link = `${window.location.origin}/image/${imageId}/?guid=${guid}&client_id=${clientId}`;
        elements.generatedLink.value = link;
        elements.linkResult.style.display = 'block';
        
        showSuccess('链接生成成功');
        
        // Scroll to the generated link
        setTimeout(() => {
            elements.linkResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
    
    // Generate random GUID
    function generateRandomGuid() {
        const hexDigits = '0123456789abcdef';
        let guid = '';
        
        for (let i = 0; i < 32; i++) {
            const randomIndex = Math.floor(Math.random() * 16);
            guid += hexDigits[randomIndex];
            
            if (i === 7 || i === 11 || i === 15 || i === 19) {
                guid += '-';
            }
        }
        
        elements.guidInput.value = guid;
        elements.guidInput.classList.add('highlight');
        
        setTimeout(() => {
            elements.guidInput.classList.remove('highlight');
        }, 1000);
    }
    
    // Copy to clipboard functionality
    function copyToClipboard() {
        const linkInput = elements.generatedLink;
        linkInput.select();
        document.execCommand('copy');
        
        // Change button text temporarily
        const copyBtn = elements.copyButton;
        const originalHTML = copyBtn.innerHTML;
        
        copyBtn.innerHTML = '<i class="fas fa-check me-2"></i>已复制';
        copyBtn.classList.remove('btn-success');
        copyBtn.classList.add('btn-outline-success');
        
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.classList.remove('btn-outline-success');
            copyBtn.classList.add('btn-success');
        }, 2000);
        
        showSuccess('链接已复制到剪贴板');
    }
    
    // Format date time
    function formatDateTime(dateTimeStr) {
        if (!dateTimeStr) return '---';
        
        try {
            const date = new Date(dateTimeStr);
            
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (error) {
            return dateTimeStr;
        }
    }
    
    // Show error alert
    function showError(message) {
        elements.errorMessage.textContent = message;
        elements.errorAlert.classList.add('show');
        
        setTimeout(() => {
            closeAlert();
        }, 5000);
    }
    
    // Show success alert
    function showSuccess(message) {
        elements.successMessage.textContent = message;
        elements.successAlert.classList.add('show');
        
        setTimeout(() => {
            closeAlert();
        }, 3000);
    }
    
    // Close alerts
    window.closeAlert = function() {
        elements.errorAlert.classList.remove('show');
        elements.successAlert.classList.remove('show');
    };
    
    // Show loading indicator
    function showLoader() {
        // Create and show loader (can be implemented if needed)
    }
    
    // Hide loading indicator
    function hideLoader() {
        // Hide loader (can be implemented if needed)
    }
});