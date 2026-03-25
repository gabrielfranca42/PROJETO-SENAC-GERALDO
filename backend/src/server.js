require('dotenv').config(); 
const app = require('./app');

// Se tiver o ficheiro connectDB.js, importe-o e execute-o aqui:
// const connectDB = require('./config/connectDB');
// connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor a correr com sucesso na porta ${PORT}.`);
});