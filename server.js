const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const { body, validationResult } = require('express-validator');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: { origin: "*" }
});

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// ===== KONFIGURASI =====
const API_KEY = "Centro212";
const PORT = 3000;

// ===== STORAGE =====
const sessions = {};
const sessionStatus = {};
const messageLogs = [];

// ===== FUNGSI BUAT CLIENT WHATSAPP =====
const createClient = (sessionId, sessionName) => {
    console.log(`[INIT] Membuat sesi: ${sessionName} (${sessionId})`);
    
    sessionStatus[sessionId] = {
        name: sessionName,
        status: 'initializing',
        qr: null,
        phone: null,
        lastActivity: new Date()
    };

    const client = new Client({
        authStrategy: new LocalAuth({ clientId: sessionId }),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        }
    });

    // Event: QR Code
    client.on('qr', (qr) => {
        console.log(`[QR] QR Code untuk ${sessionName}`);
        sessionStatus[sessionId].status = 'qr_ready';
        sessionStatus[sessionId].qr = qr;
        io.emit('qr', { sessionId, sessionName, qr });
    });

    // Event: Ready
    client.on('ready', async () => {
        const info = client.info;
        console.log(`[READY] ${sessionName} terhubung: ${info.wid.user}`);
        sessionStatus[sessionId].status = 'connected';
        sessionStatus[sessionId].qr = null;
        sessionStatus[sessionId].phone = info.wid.user;
        sessionStatus[sessionId].lastActivity = new Date();
        io.emit('status', { sessionId, status: 'connected', phone: info.wid.user });
    });

    // Event: Disconnected
    client.on('disconnected', (reason) => {
        console.log(`[DISCONNECTED] ${sessionName}: ${reason}`);
        sessionStatus[sessionId].status = 'disconnected';
        sessionStatus[sessionId].qr = null;
        io.emit('status', { sessionId, status: 'disconnected' });
    });

    // Event: Message (untuk log)
    client.on('message', async (msg) => {
        messageLogs.unshift({
            sessionId,
            from: msg.from,
            body: msg.body,
            timestamp: new Date(),
            type: 'received'
        });
        if (messageLogs.length > 100) messageLogs.pop();
    });

    sessions[sessionId] = client;
    client.initialize();
};

// ===== MIDDLEWARE AUTENTIKASI =====
const authenticate = (req, res, next) => {
    const apiKey = req.header('x-api-key') || req.query.apikey;
    if (apiKey === API_KEY) {
        next();
    } else {
        res.status(401).json({ 
            success: false, 
            message: 'API Key tidak valid' 
        });
    }
};

// ===== ROUTES =====

// Dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get All Sessions Status
app.get('/api/sessions', authenticate, (req, res) => {
    const sessionsData = Object.keys(sessionStatus).map(id => ({
        id,
        ...sessionStatus[id],
        qr: sessionStatus[id].qr ? 'available' : null
    }));
    res.json({ success: true, sessions: sessionsData });
});

// Get QR Code
app.get('/api/qr/:sessionId', authenticate, (req, res) => {
    const { sessionId } = req.params;
    if (!sessionStatus[sessionId]) {
        return res.status(404).json({ success: false, message: 'Sesi tidak ditemukan' });
    }
    if (!sessionStatus[sessionId].qr) {
        return res.json({ success: false, message: 'QR Code belum tersedia atau sudah terhubung' });
    }
    res.json({ success: true, qr: sessionStatus[sessionId].qr });
});

// Create New Session
app.post('/api/session/create', authenticate, [
    body('sessionId').notEmpty().withMessage('sessionId wajib diisi'),
    body('sessionName').notEmpty().withMessage('sessionName wajib diisi')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { sessionId, sessionName } = req.body;
    
    // Validasi format sessionId (hanya huruf, angka, underscore, hyphen)
    const validIdPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validIdPattern.test(sessionId)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Session ID hanya boleh mengandung huruf, angka, underscore (_), dan hyphen (-). Tidak boleh ada spasi!' 
        });
    }
    
    if (sessions[sessionId]) {
        return res.status(400).json({ success: false, message: 'Session ID sudah ada' });
    }

    createClient(sessionId, sessionName);
    res.json({ success: true, message: `Sesi ${sessionName} berhasil dibuat` });
});

// Delete Session
app.delete('/api/session/:sessionId', authenticate, async (req, res) => {
    const { sessionId } = req.params;
    
    if (!sessions[sessionId]) {
        return res.status(404).json({ success: false, message: 'Sesi tidak ditemukan' });
    }

    try {
        await sessions[sessionId].destroy();
        delete sessions[sessionId];
        delete sessionStatus[sessionId];
        res.json({ success: true, message: 'Sesi berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal menghapus sesi' });
    }
});

// Send Message
app.post('/api/send', authenticate, [
    body('sessionId').notEmpty().withMessage('sessionId wajib diisi'),
    body('number').notEmpty().withMessage('number wajib diisi'),
    body('message').notEmpty().withMessage('message wajib diisi')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { sessionId, number, message } = req.body;
    const client = sessions[sessionId];

    if (!client) {
        return res.status(404).json({ success: false, message: 'Sesi tidak ditemukan' });
    }

    if (sessionStatus[sessionId].status !== 'connected') {
        return res.status(400).json({ success: false, message: 'Sesi belum terhubung' });
    }

    try {
        const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;
        const isRegistered = await client.isRegisteredUser(formattedNumber);
        
        if (!isRegistered) {
            return res.status(400).json({ success: false, message: 'Nomor tidak terdaftar di WhatsApp' });
        }

        await client.sendMessage(formattedNumber, message);
        
        messageLogs.unshift({
            sessionId,
            to: formattedNumber,
            body: message,
            timestamp: new Date(),
            type: 'sent'
        });
        if (messageLogs.length > 100) messageLogs.pop();

        sessionStatus[sessionId].lastActivity = new Date();
        
        res.json({ 
            success: true, 
            message: 'Pesan berhasil dikirim',
            data: { sessionId, number: formattedNumber }
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: 'Gagal mengirim pesan', error: error.message });
    }
});

// Get Message Logs
app.get('/api/logs', authenticate, (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    res.json({ success: true, logs: messageLogs.slice(0, limit) });
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        status: 'running',
        uptime: process.uptime(),
        sessions: Object.keys(sessions).length
    });
});

// ===== SOCKET.IO =====
io.on('connection', (socket) => {
    console.log('[SOCKET] Client connected');
    
    socket.on('disconnect', () => {
        console.log('[SOCKET] Client disconnected');
    });
});

// ===== START SERVER =====
server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║     WhatsApp Gateway Multi-Device Server              ║
║                                                       ║
║  Server berjalan di: http://localhost:${PORT}         ║
║  API Key: ${API_KEY}                            ║
║                                                       ║
║  Gunakan Ngrok untuk akses publik                    ║
╚═══════════════════════════════════════════════════════╝
    `);
});
