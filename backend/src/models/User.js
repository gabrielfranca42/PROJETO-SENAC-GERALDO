const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'O nome é obrigatório'] 
  },
  email: { 
    type: String, 
    required: [true, 'O e-mail é obrigatório'], 
    unique: true,
    lowercase: true,
    trim: true 
  },
  password: { 
    type: String, 
    required: [true, 'A senha é obrigatória'],
    select: false 
  },
  role: { 
    type: String, 
    enum: ['ADMIN', 'COORDINATOR', 'STUDENT', 'SUPER_ADMIN'], 
    default: 'STUDENT' 
  },
  courses: [{ 
    type: String
  }], 
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// MIDDLEWARE CORRIGIDO: Sem o parâmetro 'next' e deixando o async/await brilhar
UserSchema.pre('save', async function() {
  // Se a senha não foi modificada, o 'return' encerra a função e libera o fluxo
  if (!this.isModified('password')) return;

  // Sem o 'next', o Mongoose aguarda as Promises resolverem sozinhas
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método de instância para validação de login
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);