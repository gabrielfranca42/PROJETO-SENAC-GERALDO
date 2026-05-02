require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Activity = require('./models/Activity');
const connectDB = require('./config/db');

const seedData = async () => {
  try {
    // Garantir uso da URI correta do .env
    if (!process.env.MONGO_URI) {
      throw new Error("ERRO FATAL: MONGO_URI não definida no .env. Não é seguro usar fallback hardcoded.");
    }
    
    await connectDB();
    console.log('--- Iniciando limpeza do banco de dados ---');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Activity.deleteMany({});
    console.log('Coleções limpas com sucesso.');

    console.log('--- Inserindo Super Admin ---');
    const superAdmin = new User({
      name: 'Gabriel França',
      email: 'gabrielfranca172@gmail.com',
      password: '123456789',
      role: 'SUPER_ADMIN'
    });
    await superAdmin.save();
    console.log('Super Admin criado (gabrielfranca172@gmail.com).');

    console.log('--- Inserindo Cursos ---');
    const gastronomia = new Course({
      name: 'Gastronomia',
      totalHoursRequired: 300,
      categories: [
        { name: 'Estágio Obrigatório', maxHours: 150 },
        { name: 'Cursos Extras', maxHours: 100 },
        { name: 'Workshops', maxHours: 50 }
      ]
    });
    await gastronomia.save();

    const ads = new Course({
      name: 'Análise e Desenvolvimento de Sistemas',
      totalHoursRequired: 400,
      categories: [
        { name: 'Estágio Obrigatório', maxHours: 200 },
        { name: 'Projetos de Extensão', maxHours: 150 },
        { name: 'Palestras', maxHours: 50 }
      ]
    });
    await ads.save();
    console.log('Cursos criados: Gastronomia e Análise e Desenvolvimento de Sistemas.');

    console.log('--- Inserindo Coordenadores ---');
    const coordGastro = new User({
      name: 'Coordenador Gastronomia',
      email: 'coord.gastro@gmail.com',
      password: '1234',
      role: 'COORDINATOR',
      courses: [gastronomia._id.toString()]
    });
    await coordGastro.save();
    gastronomia.coordinator = coordGastro._id;
    await gastronomia.save();

    const coordAds = new User({
      name: 'Coordenadora ADS',
      email: 'coord.ads@gmail.com',
      password: '1234',
      role: 'COORDINATOR',
      courses: [ads._id.toString()]
    });
    await coordAds.save();
    ads.coordinator = coordAds._id;
    await ads.save();
    console.log('Coordenadores criados e vinculados aos cursos.');

    console.log('--- Inserindo Alunos ---');
    const alunos = [];
    for (let i = 1; i <= 5; i++) {
      const isGastro = i <= 2; // 2 alunos para Gastronomia, 3 para ADS
      const course = isGastro ? gastronomia : ads;
      const aluno = new User({
        name: `Aluno Teste ${i}`,
        email: `aluno${i}@gmail.com`,
        password: '1234',
        role: 'STUDENT',
        matricula: `MAT2026${i}`,
        courses: [course._id.toString()]
      });
      await aluno.save();
      alunos.push({ user: aluno, course });
    }
    console.log(`5 Alunos criados e vinculados aos cursos.`);

    console.log('--- Inserindo Atividades (Certificados) ---');
    const statusTypes = ['PENDING', 'APPROVED', 'REJECTED'];
    for (let i = 0; i < 15; i++) {
      // Distribui as atividades entre os alunos
      const { user: student, course } = alunos[i % 5];
      // Escolhe uma categoria do curso aleatória
      const category = course.categories[i % course.categories.length].name;
      const status = statusTypes[i % 3]; // Vai gerar atividades pendentes, aprovadas e reprovadas
      
      const activity = new Activity({
        student: student._id,
        course: course._id,
        title: `Certificado de Participação - Evento ${i + 1}`,
        hoursClaimed: Math.floor(Math.random() * 20) + 5, // Horas entre 5 e 24
        category: category,
        certificateUrl: `http://example.com/cert${i}.pdf`,
        status: status,
        feedback: status === 'REJECTED' ? 'Faltam assinaturas no documento.' : ''
      });
      await activity.save();
    }
    console.log('15 Atividades (certificados) inseridas para teste.');

    console.log('--- SEED CONCLUÍDO COM SUCESSO ---');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Erro ao popular dados (seed):', error);
    process.exit(1);
  }
};

seedData();
