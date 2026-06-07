const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Importação de Rotas (Migradas para módulos MVC)
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/users.routes');
const courseRoutes = require('./modules/courses/courses.routes');
const activityRoutes = require('./modules/activities/activities.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');

const app = express();

// Middlewares Globais de Segurança
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos.'
});
app.use(limiter);

app.use(cors({
  origin: function(origin, callback) {
    // Permite localhost e GitHub Pages
    const allowed = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://gabrielfranca42.github.io'
    ];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Servir arquivos estáticos da pasta uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check
app.get('/', (req, res) => {
  res.status(200).json({ message: "API do SIGAC esta online e a funcionar." });
});

// Registro de Rotas
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

module.exports = app;