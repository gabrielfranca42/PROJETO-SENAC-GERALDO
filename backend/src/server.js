require('dotenv').config(); 
const app = require('./app');
const connectDB = require('./config/db');

// Variáveis de ambiente com fallbacks para desenvolvimento
process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://root:rootpassword@127.0.0.1:27017/pi_db?authSource=admin";
process.env.JWT_SECRET = process.env.JWT_SECRET || "sigac-dev-secret-key-2026";

const PORT = process.env.PORT || 3000;

// Inicia o servidor primeiro, depois conecta ao DB
app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}.`);
  console.log(`API disponível em: http://localhost:${PORT}/api/v1`);
  await connectDB();
});
const URL_DO_SEU_SITE = "https://projeto-senac-geraldo-2.onrender.com"; 

setInterval(async () => {
  try {
    await fetch(URL_DO_SEU_SITE);
    console.log("Auto-ping feito com sucesso para manter o servidor acordado!");
  } catch (error) {
    console.error("Erro no auto-ping:", error.message);
  }
}, 13 * 60 * 1000); // 13 minutos (um pouco antes dos 15 minutos de limite)
