const express = require('express');
const cors = require('cors');

// =========================================================================
 
//  As linhas que continham a importação de 'authenticate' 
// (e possivelmente sua duplicação) foram removidas. Middlewares de rota 
// específica não devem ser instanciados na raiz da aplicação, pois isso 
// viola o princípio de Separação de Preocupações (SoC) e estava gerando 
// colisão de nomenclatura sintática no motor V8.
// =========================================================================

const userRoutes = require('./routes/userRoutes');
// const authRoutes = require('./routes/authRoutes');
// const courseRoutes = require('./routes/courseRoutes');

const app = express();

app.use(cors());
app.use(express.json()); 

app.get('/', (req, res) => {
  res.status(200).json({ message: "API do SIGAC esta online e a funcionar." });
});

app.use('/api/v1/users', userRoutes);
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/courses', courseRoutes);

module.exports = app;