const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("ERRO_ENV: MONGO_URI não definida.");
    
    await mongoose.connect(uri);
    console.log("DB_STATUS: Conectado");
  } catch (err) {
    console.error(`DB_ERROR: ${err.message}`);
    // Não encerra o processo para que o servidor continue rodando no Render
    // e possa retornar respostas de erro adequadas
  }
};

module.exports = connectDB;