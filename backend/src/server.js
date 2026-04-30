require('dotenv').config(); 
const app = require('./app');
const connectDB = require('./config/db');

// Variáveis de ambiente com fallbacks para desenvolvimento
process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://root:rootpassword@127.0.0.1:27017/pi_db?authSource=admin";
process.env.JWT_SECRET = process.env.JWT_SECRET || "sigac-dev-secret-key-2026";

connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}.`);
  console.log(`API disponível em: http://localhost:${PORT}/api/v1`);
});