require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const seedUser = async () => {
  try {
    // Força a mesma URI do server.js caso o .env não esteja configurado
    process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://root:rootpassword@127.0.0.1:27017/pi_db?authSource=admin";
    
    await connectDB();

    const email = 'teste4222@gmail.com';
    const password = '1234';

    // Verifica se o usuário já existe
    let user = await User.findOne({ email });

    if (user) {
      console.log('O usuário já existe! Atualizando permissões e senha...');
      user.password = password;
      user.role = 'SUPER_ADMIN';
      user.name = 'Administrador de Teste';
      await user.save();
      console.log('Usuário atualizado com sucesso com acesso total!');
    } else {
      console.log('Criando novo usuário administrador...');
      user = new User({
        name: 'Administrador de Teste',
        email: email,
        password: password,
        role: 'SUPER_ADMIN' // Acesso total no sistema
      });
      await user.save();
      console.log('Usuário administrador criado com sucesso!');
    }

    // Fecha a conexão após terminar
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar/atualizar usuário:', error);
    process.exit(1);
  }
};

seedUser();
