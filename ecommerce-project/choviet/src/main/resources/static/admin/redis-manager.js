// Redis Manager JavaScript
const API_BASE = '/admin/redis';
let currentKey = null;
let currentPage = 0;
let currentPattern = '*';
let totalPages = 0;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadRedisInfo();
    searchKeys();
});

// Load Redis overview information
async function loadRedisInfo() {
    try {
        const response = await fetch(`${API_BASE}/info`);
        const data = await response.json();
        
        document.getElementById('totalKeys').textContent = data.totalKeys || 0;
        
        // Display pattern statistics
        if (data.patternStats) {
            let statsHtml = '<div class="d-flex justify-content-between"><span>Tổng Keys:</span><span>' + (data.totalKeys || 0) + '</span></div>';
            for (const [pattern, count] of Object.entries(data.patternStats)) {
                statsHtml += `<div class="d-flex justify-content-between"><span>${pattern}:*</span><span>${count}</span></div>`;
            }
            document.getElementById('redisStats').innerHTML = statsHtml;
        }
    } catch (error) {
        console.error('Error loading Redis info:', error);
        showAlert('Lỗi khi tải thông tin Redis', 'danger');
    }
}

// Search keys with pagination
async function searchKeys(page = 0) {
    const pattern = document.getElementById('searchPattern').value || '*';
    currentPattern = pattern;
    currentPage = page;
    
    try {
        const response = await fetch(`${API_BASE}/keys?pattern=${encodeURIComponent(pattern)}&page=${page}&size=20`);
        const data = await response.json();
        
        displayKeys(data.keys || []);
        updatePagination(data);
        document.getElementById('keyCount').textContent = data.totalElements || 0;
    } catch (error) {
        console.error('Error searching keys:', error);
        showAlert('Lỗi khi tìm kiếm keys', 'danger');
    }
}

// Display keys in sidebar
function displayKeys(keys) {
    const keysList = document.getElementById('keysList');
    
    if (keys.length === 0) {
        keysList.innerHTML = '<div class="p-3 text-center text-muted">Không tìm thấy key nào</div>';
        return;
    }
    
    let html = '';
    keys.forEach(key => {
        html += `
            <div class="key-item p-2 border-bottom cursor-pointer" onclick="selectKey('${key}')">
                <div class="d-flex justify-content-between align-items-center">
                    <span class="text-truncate" style="max-width: 180px;" title="${key}">${key}</span>
                    <i class="fas fa-chevron-right text-muted"></i>
                </div>
            </div>
        `;
    });
    
    keysList.innerHTML = html;
}

// Update pagination
function updatePagination(data) {
    totalPages = data.totalPages || 0;
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    if (currentPage > 0) {
        html += `<li class="page-item"><a class="page-link" href="#" onclick="searchKeys(${currentPage - 1})">‹</a></li>`;
    }
    
    // Page numbers
    const startPage = Math.max(0, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const active = i === currentPage ? 'active' : '';
        html += `<li class="page-item ${active}"><a class="page-link" href="#" onclick="searchKeys(${i})">${i + 1}</a></li>`;
    }
    
    // Next button
    if (currentPage < totalPages - 1) {
        html += `<li class="page-item"><a class="page-link" href="#" onclick="searchKeys(${currentPage + 1})">›</a></li>`;
    }
    
    pagination.innerHTML = html;
}

// Select and display key details
async function selectKey(keyName) {
    currentKey = keyName;
    
    // Highlight selected key
    document.querySelectorAll('.key-item').forEach(item => {
        item.classList.remove('bg-primary', 'text-white');
    });
    event.target.closest('.key-item').classList.add('bg-primary', 'text-white');
    
    try {
        const response = await fetch(`${API_BASE}/key/${encodeURIComponent(keyName)}`);
        const data = await response.json();
        
        displayKeyDetails(keyName, data);
        document.getElementById('keyActions').style.display = 'block';
    } catch (error) {
        console.error('Error loading key details:', error);
        showAlert('Lỗi khi tải chi tiết key', 'danger');
    }
}

// Display key details
function displayKeyDetails(keyName, data) {
    if (!data.exists) {
        document.getElementById('keyDetails').innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                <p>Key "${keyName}" không tồn tại</p>
            </div>
        `;
        return;
    }
    
    const typeColor = getTypeColor(data.type);
    const ttlDisplay = data.ttl === -1 ? 'Permanent' : (data.ttl === -2 ? 'Expired' : `${data.ttl}s`);
    
    let valueDisplay = '';
    try {
        valueDisplay = JSON.stringify(data.value, null, 2);
    } catch (e) {
        valueDisplay = String(data.value);
    }
    
    const html = `
        <div class="row">
            <div class="col-md-6">
                <h5>Thông tin Key</h5>
                <table class="table table-sm">
                    <tr>
                        <td><strong>Key:</strong></td>
                        <td><code>${keyName}</code></td>
                    </tr>
                    <tr>
                        <td><strong>Type:</strong></td>
                        <td><span class="badge ${typeColor} key-type-badge">${data.type}</span></td>
                    </tr>
                    <tr>
                        <td><strong>TTL:</strong></td>
                        <td><span class="badge bg-info ttl-badge">${ttlDisplay}</span></td>
                    </tr>
                </table>
            </div>
            <div class="col-md-6">
                <h5>Value</h5>
                <div class="json-viewer">${valueDisplay}</div>
            </div>
        </div>
    `;
    
    document.getElementById('keyDetails').innerHTML = html;
}

// Get color for key type
function getTypeColor(type) {
    const colors = {
        'string': 'bg-success',
        'list': 'bg-primary',
        'set': 'bg-warning',
        'hash': 'bg-info',
        'zset': 'bg-purple',
        'stream': 'bg-dark'
    };
    return colors[type] || 'bg-secondary';
}

// Show add key modal
function showAddKeyModal() {
    document.getElementById('keyModalTitle').textContent = 'Thêm Key Mới';
    document.getElementById('keyName').value = '';
    document.getElementById('keyValue').value = '';
    document.getElementById('keyTTL').value = '';
    document.getElementById('keyTTLUnit').value = 'SECONDS';
    document.getElementById('keyName').readOnly = false;
    
    new bootstrap.Modal(document.getElementById('keyModal')).show();
}

// Show edit key modal
function showEditKeyModal() {
    if (!currentKey) return;
    
    document.getElementById('keyModalTitle').textContent = 'Sửa Key';
    document.getElementById('keyName').value = currentKey;
    document.getElementById('keyName').readOnly = true;
    
    // Load current value
    loadKeyForEdit();
    
    new bootstrap.Modal(document.getElementById('keyModal')).show();
}

// Load key data for editing
async function loadKeyForEdit() {
    try {
        const response = await fetch(`${API_BASE}/key/${encodeURIComponent(currentKey)}`);
        const data = await response.json();
        
        if (data.exists) {
            try {
                document.getElementById('keyValue').value = JSON.stringify(data.value, null, 2);
            } catch (e) {
                document.getElementById('keyValue').value = String(data.value);
            }
        }
    } catch (error) {
        console.error('Error loading key for edit:', error);
    }
}

// Save key (add or edit)
async function saveKey() {
    const keyName = document.getElementById('keyName').value.trim();
    const keyValue = document.getElementById('keyValue').value.trim();
    const ttl = document.getElementById('keyTTL').value;
    const ttlUnit = document.getElementById('keyTTLUnit').value;
    
    if (!keyName || !keyValue) {
        showAlert('Vui lòng nhập đầy đủ thông tin', 'warning');
        return;
    }
    
    try {
        let value;
        try {
            value = JSON.parse(keyValue);
        } catch (e) {
            value = keyValue;
        }
        
        const requestBody = { value };
        if (ttl && ttl > 0) {
            requestBody.timeout = parseInt(ttl);
            requestBody.unit = ttlUnit;
        }
        
        const response = await fetch(`${API_BASE}/key/${encodeURIComponent(keyName)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (response.ok) {
            showAlert('Key đã được lưu thành công', 'success');
            bootstrap.Modal.getInstance(document.getElementById('keyModal')).hide();
            refreshData();
            if (currentKey === keyName) {
                selectKey(keyName);
            }
        } else {
            throw new Error('Failed to save key');
        }
    } catch (error) {
        console.error('Error saving key:', error);
        showAlert('Lỗi khi lưu key', 'danger');
    }
}

// Show set TTL modal
function showSetTTLModal() {
    if (!currentKey) return;
    
    document.getElementById('ttlValue').value = '';
    document.getElementById('ttlUnit').value = 'SECONDS';
    
    new bootstrap.Modal(document.getElementById('ttlModal')).show();
}

// Set TTL for current key
async function setKeyTTL() {
    const ttlValue = document.getElementById('ttlValue').value;
    const ttlUnit = document.getElementById('ttlUnit').value;
    
    if (!ttlValue || ttlValue <= 0) {
        showAlert('Vui lòng nhập giá trị TTL hợp lệ', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/key/${encodeURIComponent(currentKey)}/expire?timeout=${ttlValue}&unit=${ttlUnit}`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            showAlert('TTL đã được cập nhật', 'success');
            bootstrap.Modal.getInstance(document.getElementById('ttlModal')).hide();
            selectKey(currentKey); // Refresh key details
        } else {
            throw new Error('Failed to set TTL');
        }
    } catch (error) {
        console.error('Error setting TTL:', error);
        showAlert('Lỗi khi set TTL', 'danger');
    }
}

// Delete current key
async function deleteCurrentKey() {
    if (!currentKey) return;
    
    if (!confirm(`Bạn có chắc chắn muốn xóa key "${currentKey}"?`)) return;
    
    try {
        const response = await fetch(`${API_BASE}/key/${encodeURIComponent(currentKey)}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showAlert('Key đã được xóa', 'success');
            currentKey = null;
            document.getElementById('keyDetails').innerHTML = `
                <div class="text-center text-muted py-5">
                    <i class="fas fa-key fa-3x mb-3"></i>
                    <p>Chọn một key để xem chi tiết</p>
                </div>
            `;
            document.getElementById('keyActions').style.display = 'none';
            refreshData();
        } else {
            throw new Error('Failed to delete key');
        }
    } catch (error) {
        console.error('Error deleting key:', error);
        showAlert('Lỗi khi xóa key', 'danger');
    }
}

// Confirm flush all keys
function confirmFlushAll() {
    const confirmation = prompt('Để xác nhận xóa TẤT CẢ keys, vui lòng nhập "DELETE ALL":');
    if (confirmation === 'DELETE ALL') {
        flushAllKeys();
    } else if (confirmation !== null) {
        showAlert('Xác nhận không đúng', 'warning');
    }
}

// Flush all keys
async function flushAllKeys() {
    try {
        const response = await fetch(`${API_BASE}/flush`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showAlert('Tất cả keys đã được xóa', 'success');
            refreshData();
            currentKey = null;
            document.getElementById('keyDetails').innerHTML = `
                <div class="text-center text-muted py-5">
                    <i class="fas fa-key fa-3x mb-3"></i>
                    <p>Chọn một key để xem chi tiết</p>
                </div>
            `;
            document.getElementById('keyActions').style.display = 'none';
        } else {
            throw new Error('Failed to flush keys');
        }
    } catch (error) {
        console.error('Error flushing keys:', error);
        showAlert('Lỗi khi xóa tất cả keys', 'danger');
    }
}

// Refresh all data
function refreshData() {
    loadRedisInfo();
    searchKeys(0);
}

// Show alert message
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert-custom');
    existingAlerts.forEach(alert => alert.remove());
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show alert-custom`;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.maxWidth = '400px';
    
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Handle Enter key in search
document.getElementById('searchPattern').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchKeys(0);
    }
});

// Add cursor pointer style
const style = document.createElement('style');
style.textContent = '.cursor-pointer { cursor: pointer; }';
document.head.appendChild(style);
