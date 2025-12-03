const API_KEY = 'Centro212';
const API_BASE = window.location.origin;
const socket = io();

// Toast Notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// API Call Helper
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
        }
    };

    if (body) options.body = JSON.stringify(body);

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        showToast('Koneksi ke server gagal', 'error');
        return null;
    }
}

// Load Sessions
async function loadSessions() {
    const data = await apiCall('/api/sessions');

    if (!data || !data.success) {
        document.getElementById('sessionsList').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Gagal memuat sesi</p>
            </div>
        `;
        return;
    }

    const sessionsList = document.getElementById('sessionsList');
    const sendSessionSelect = document.getElementById('sendSessionId');

    if (data.sessions.length === 0) {
        sessionsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>Belum ada sesi aktif</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">Buat sesi baru untuk memulai</p>
            </div>
        `;
        sendSessionSelect.innerHTML = '<option value="">Pilih Sesi</option>';
        return;
    }

    sessionsList.innerHTML = '';
    sendSessionSelect.innerHTML = '<option value="">Pilih Sesi</option>';

    data.sessions.forEach(session => {
        const statusMap = {
            connected: { class: 'status-connected', text: 'Terhubung', icon: 'fa-check-circle' },
            qr_ready: { class: 'status-qr', text: 'Scan QR', icon: 'fa-qrcode' },
            initializing: { class: 'status-init', text: 'Memulai...', icon: 'fa-spinner fa-spin' },
            disconnected: { class: 'status-disconnected', text: 'Terputus', icon: 'fa-times-circle' }
        };

        const status = statusMap[session.status] || statusMap.disconnected;

        const card = document.createElement('div');
        card.className = 'session-card';
        card.innerHTML = `
            <div class="session-header">
                <div>
                    <div class="session-name">${session.name}</div>
                    <div class="session-id">ID: ${session.id}</div>
                </div>
                <span class="session-status ${status.class}">
                    <i class="fas ${status.icon}"></i>
                    ${status.text}
                </span>
            </div>
            ${session.phone ? `
                <div class="session-phone">
                    <i class="fas fa-phone"></i>
                    <span>${session.phone}</span>
                </div>
            ` : ''}
            <div class="session-actions">
                ${session.status === 'qr_ready' ? `
                    <button class="btn btn-warning btn-sm" onclick="showQR('${session.id}')">
                        <i class="fas fa-qrcode"></i>
                        Lihat QR
                    </button>
                ` : ''}
                <button class="btn btn-danger btn-sm" onclick="deleteSession('${session.id}')">
                    <i class="fas fa-trash"></i>
                    Hapus
                </button>
            </div>
        `;

        sessionsList.appendChild(card);

        if (session.status === 'connected') {
            const option = document.createElement('option');
            option.value = session.id;
            option.textContent = `${session.name} (${session.phone})`;
            sendSessionSelect.appendChild(option);
        }
    });
}

// Create Session
async function createSession() {
    const sessionId = document.getElementById('newSessionId').value.trim();
    const sessionName = document.getElementById('newSessionName').value.trim();

    if (!sessionId || !sessionName) {
        showToast('Session ID dan Nama harus diisi', 'error');
        return;
    }

    // Validasi format
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validPattern.test(sessionId)) {
        showToast('Session ID hanya boleh huruf, angka, underscore, dan hyphen', 'error');
        return;
    }

    const data = await apiCall('/api/session/create', 'POST', { sessionId, sessionName });

    if (data && data.success) {
        showToast('Sesi berhasil dibuat! Tunggu QR Code...', 'success');
        document.getElementById('newSessionId').value = '';
        document.getElementById('newSessionName').value = '';
        setTimeout(loadSessions, 2000);
    } else {
        showToast(data?.message || 'Gagal membuat sesi', 'error');
    }
}

// Show QR Code
async function showQR(sessionId) {
    const data = await apiCall(`/api/qr/${sessionId}`);

    if (data && data.success && data.qr) {
        const qrContainer = document.getElementById('qrcodeContainer');
        qrContainer.innerHTML = '';

        try {
            if (typeof QRCode !== 'undefined' && QRCode.toCanvas) {
                const canvas = document.createElement('canvas');
                QRCode.toCanvas(canvas, data.qr, {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                }, (error) => {
                    if (error) {
                        qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data.qr)}" alt="QR Code">`;
                    } else {
                        qrContainer.appendChild(canvas);
                    }
                });
            } else {
                qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data.qr)}" alt="QR Code">`;
            }

            document.getElementById('qrModal').classList.add('active');
        } catch (err) {
            console.error('QR Error:', err);
            qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data.qr)}" alt="QR Code">`;
            document.getElementById('qrModal').classList.add('active');
        }
    } else {
        showToast(data?.message || 'QR Code tidak tersedia', 'error');
    }
}

// Close Modal
function closeModal() {
    document.getElementById('qrModal').classList.remove('active');
}

// Delete Session
async function deleteSession(sessionId) {
    if (!confirm('Yakin ingin menghapus sesi ini?')) return;

    const data = await apiCall(`/api/session/${sessionId}`, 'DELETE');

    if (data && data.success) {
        showToast('Sesi berhasil dihapus', 'success');
        loadSessions();
    } else {
        showToast(data?.message || 'Gagal menghapus sesi', 'error');
    }
}

// Send Message
async function sendMessage() {
    const sessionId = document.getElementById('sendSessionId').value;
    const number = document.getElementById('sendNumber').value.trim();
    const message = document.getElementById('sendMessage').value.trim();

    if (!sessionId || !number || !message) {
        showToast('Semua field harus diisi', 'error');
        return;
    }

    const data = await apiCall('/api/send', 'POST', { sessionId, number, message });

    if (data && data.success) {
        showToast('Pesan berhasil dikirim!', 'success');
        document.getElementById('sendNumber').value = '';
        document.getElementById('sendMessage').value = '';
    } else {
        showToast(data?.message || 'Gagal mengirim pesan', 'error');
    }
}

// Socket Events
socket.on('qr', (data) => {
    showToast(`QR Code siap untuk ${data.sessionName}`, 'info');
    loadSessions();
});

socket.on('status', (data) => {
    if (data.status === 'connected') {
        showToast(`Sesi ${data.sessionId} berhasil terhubung!`, 'success');
    }
    loadSessions();
});

// Toggle API Documentation
function toggleApiDocs() {
    const content = document.getElementById('apiDocsContent');
    const icon = document.getElementById('apiDocsIcon');
    const text = document.getElementById('apiDocsText');

    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.className = 'fas fa-chevron-up';
        text.textContent = 'Sembunyikan';
    } else {
        content.style.display = 'none';
        icon.className = 'fas fa-chevron-down';
        text.textContent = 'Lihat';
    }
}

// Close modal on outside click
document.getElementById('qrModal').addEventListener('click', (e) => {
    if (e.target.id === 'qrModal') {
        closeModal();
    }
});

// Enter key handlers
document.getElementById('newSessionId').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') createSession();
});

document.getElementById('newSessionName').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') createSession();
});

document.getElementById('sendMessage').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Initialize
loadSessions();
setInterval(loadSessions, 10000);
