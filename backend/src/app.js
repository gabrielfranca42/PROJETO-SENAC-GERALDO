const express = require('express');
const cors = require('cors');
const authenticate = require('../middlewares/auth');

// E possivelmente a declaração que adicionei e você colou embaixo:
const { authenticate } = require('../middlewares/auth'); 
// OU 
const authenticate = require('../middlewares/auth');

// 1. Removemos o // desta linha
const userRoutes = require('./routes/userRoutes');
// const authRoutes = require('./routes/authRoutes');
// const courseRoutes = require('./routes/courseRoutes');

const app = express();

app.use(cors());
app.use(express.json()); 

app.get('/', (req, res) => {
  res.status(200).json({ message: "API do SIGAC esta online e a funcionar." });
});

// 2. Removemos o // desta linha também
app.use('/api/v1/users', userRoutes);
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/courses', courseRoutes);

module.exports = app;