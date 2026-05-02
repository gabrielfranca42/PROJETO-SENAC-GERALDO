const express = require('express');
const cors = require('cors');

// Importação de Rotas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const activityRoutes = require('./routes/activityRoutes');

const app = express();

// Middlewares Globais
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://gabrielfranca42.github.io'
  ],
  credentials: true
}));
app.use(express.json());

// Health Check
app.get('/', (req, res) => {
  res.status(200).json({ message: "API do SIGAC esta online e a funcionar." });
});

// Registro de Rotas
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/activities', activityRoutes);

module.exports = app;