require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', limiter);

// Serve static files
app.use(express.static('public'));

// MongoDB connection (optional for now)
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log('✅ MongoDB connected');
    }).catch(err => {
        console.error('MongoDB connection error:', err);
    });
}

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK',
        message: 'Viurl API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Serve the main app
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    if (require('fs').existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Viurl - Decentralized Truth</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
            color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        }
        
        .bg-animation {
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 0;
        }
        
        .bg-animation::before {
            content: '';
            position: absolute;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, #39ff14 0%, transparent 70%);
            opacity: 0.05;
            animation: pulse 10s ease-in-out infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -50%) scale(1.2); }
        }
        
        .container {
            text-align: center;
            z-index: 1;
            padding: 2rem;
            max-width: 800px;
        }
        
        .logo {
            font-size: 5rem;
            font-weight: bold;
            background: linear-gradient(45deg, #39ff14, #00ff88);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 0 30px rgba(57, 255, 20, 0.5);
            margin-bottom: 1rem;
            animation: glow 2s ease-in-out infinite;
        }
        
        @keyframes glow {
            0%, 100% { filter: brightness(1); }
            50% { filter: brightness(1.2); }
        }
        
        .tagline {
            font-size: 1.5rem;
            color: #39ff14;
            margin-bottom: 2rem;
            letter-spacing: 2px;
        }
        
        .description {
            font-size: 1.1rem;
            line-height: 1.6;
            color: #e0e0e0;
            margin-bottom: 3rem;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 2rem;
            margin: 3rem 0;
        }
        
        .stat {
            padding: 1.5rem;
            background: rgba(57, 255, 20, 0.1);
            border: 1px solid rgba(57, 255, 20, 0.3);
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        
        .stat-value {
            font-size: 2rem;
            color: #39ff14;
            font-weight: bold;
        }
        
        .stat-label {
            font-size: 0.9rem;
            color: #a0a0a0;
            margin-top: 0.5rem;
        }
        
        .cta-button {
            display: inline-block;
            padding: 1rem 3rem;
            background: linear-gradient(45deg, #39ff14, #00ff88);
            color: #0a0a0a;
            text-decoration: none;
            border-radius: 50px;
            font-weight: bold;
            font-size: 1.1rem;
            transition: all 0.3s ease;
            box-shadow: 0 5px 20px rgba(57, 255, 20, 0.3);
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(57, 255, 20, 0.5);
        }
        
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin: 3rem 0;
        }
        
        .feature {
            padding: 1.5rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            transition: all 0.3s ease;
        }
        
        .feature:hover {
            background: rgba(57, 255, 20, 0.1);
            transform: translateY(-5px);
        }
        
        .feature-icon {
            font-size: 2rem;
            margin-bottom: 1rem;
        }
        
        .feature-title {
            font-size: 1.2rem;
            color: #39ff14;
            margin-bottom: 0.5rem;
        }
        
        .feature-desc {
            color: #a0a0a0;
            font-size: 0.9rem;
        }
        
        .status {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 0.5rem 1rem;
            background: rgba(57, 255, 20, 0.2);
            border: 1px solid #39ff14;
            border-radius: 20px;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .status-dot {
            width: 8px;
            height: 8px;
            background: #39ff14;
            border-radius: 50%;
            animation: blink 2s infinite;
        }
        
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }
    </style>
</head>
<body>
    <div class="bg-animation"></div>
    
    <div class="status">
        <span class="status-dot"></span>
        <span>System Online</span>
    </div>
    
    <div class="container">
        <h1 class="logo">VIURL</h1>
        <p class="tagline">TRUTH VERIFIED BY CONSENSUS</p>
        
        <p class="description">
            The world's first decentralized truth verification protocol. 
            Combining blockchain technology with community consensus to combat 
            misinformation and reward authentic content.
        </p>
        
        <div class="features">
            <div class="feature">
                <div class="feature-icon">🔐</div>
                <div class="feature-title">Secure</div>
                <div class="feature-desc">Byzantine fault tolerant consensus</div>
            </div>
            <div class="feature">
                <div class="feature-icon">⚡</div>
                <div class="feature-title">Fast</div>
                <div class="feature-desc">Sub-second verification</div>
            </div>
            <div class="feature">
                <div class="feature-icon">💎</div>
                <div class="feature-title">Rewarding</div>
                <div class="feature-desc">Earn tokens for truth</div>
            </div>
            <div class="feature">
                <div class="feature-icon">🌍</div>
                <div class="feature-title">Decentralized</div>
                <div class="feature-desc">No single point of control</div>
            </div>
        </div>
        
        <div class="stats">
            <div class="stat">
                <div class="stat-value" id="validators">1,000+</div>
                <div class="stat-label">Validators</div>
            </div>
            <div class="stat">
                <div class="stat-value" id="verifications">10M+</div>
                <div class="stat-label">Verifications</div>
            </div>
            <div class="stat">
                <div class="stat-value" id="rewards">$5M+</div>
                <div class="stat-label">Rewards Distributed</div>
            </div>
        </div>
        
        <a href="#" class="cta-button" onclick="alert('Mainnet launching soon! Join our waitlist.')">
            ENTER APP
        </a>
    </div>
    
    <script>
        // Add some interactivity
        console.log('Viurl Protocol v1.0.0 - Initializing...');
        
        // Simulate live stats
        setInterval(() => {
            const validators = document.getElementById('validators');
            const current = parseInt(validators.textContent);
            validators.textContent = (current + Math.floor(Math.random() * 3)) + '+';
        }, 5000);
    </script>
</body>
</html>
        `);
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    ╔══════════════════════════════════════╗
    ║                                      ║
    ║         VIURL SERVER v1.0.0          ║
    ║                                      ║
    ║   🚀 Server running on port ${PORT}     ║
    ║   🌐 http://localhost:${PORT}           ║
    ║   ✅ Ready for connections           ║
    ║                                      ║
    ╚══════════════════════════════════════╝
    `);
});

module.exports = app;
