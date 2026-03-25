require('dotenv').config(); 
const app = require('./app');
const connectDB = require('./config/db'); // 1. Importe o seu ficheiro de conexão

// Teste temporário ignorando o .env
process.env.MONGO_URI = "mongodb://root:rootpassword@127.0.0.1:27017/pi_db?authSource=admin";
connectDB();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor a correr com sucesso na porta ${PORT}.`);
  // Este log agora deve mostrar a string correta, não 'undefined'
  console.log("URI Carregada:", process.env.MONGO_URI); 
});