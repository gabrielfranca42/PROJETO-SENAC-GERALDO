require('dotenv').config();
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

    const jogos = new Course({
      name: 'Jogos Digitais',
      totalHoursRequired: 360,
      categories: [
        { name: 'Desenvolvimento de Ativos', maxHours: 180 },
        { name: 'Game Jams', maxHours: 100 },
        { name: 'Palestras Técnicas', maxHours: 80 }
      ]
    });
    await jogos.save();
    console.log('Cursos criados: Gastronomia, ADS e Jogos Digitais.');

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
      name: 'Coordenadora ADS e Jogos',
      email: 'coord.ads@gmail.com',
      password: '1234',
      role: 'COORDINATOR',
      courses: [ads._id.toString(), jogos._id.toString()]
    });
    await coordAds.save();
    ads.coordinator = coordAds._id;
    await ads.save();
    jogos.coordinator = coordAds._id;
    await jogos.save();
    console.log('Coordenadores criados e vinculados aos cursos.');

    console.log('--- Inserindo Alunos ---');
    const todosCursos = [gastronomia, ads, jogos];
    const alunos = [];
    
    // 10 alunos para cada curso
    for (const curso of todosCursos) {
      for (let i = 1; i <= 10; i++) {
        const aluno = new User({
          name: `Aluno ${curso.name} ${i}`,
          email: `aluno.${curso.name.toLowerCase().replace(/ /g, '.')}.${i}@gmail.com`,
          password: '1234',
          role: 'STUDENT',
          matricula: `MAT-${curso.name.substring(0, 3).toUpperCase()}-${202600 + i}`,
          courses: [curso._id.toString()]
        });
        await aluno.save();
        alunos.push({ user: aluno, course: curso });
      }
    }
    console.log(`${alunos.length} Alunos criados.`);

    console.log('--- Inserindo Atividades (Certificados) ---');
    const statusTypes = ['PENDING', 'APPROVED', 'REJECTED'];
    
    for (const item of alunos) {
      const { user: student, course } = item;
      // 3 atividades por aluno para ter volume
      for (let j = 0; j < 3; j++) {
        const category = course.categories[j % course.categories.length].name;
        const status = statusTypes[(student.name.length + j) % 3]; 
        
        const activity = new Activity({
          student: student._id,
          course: course._id,
          title: `Certificado ${j + 1} - ${category}`,
          hoursClaimed: Math.floor(Math.random() * 20) + 5,
          category: category,
          certificateUrl: `http://example.com/cert_${student._id}_${j}.pdf`,
          status: status,
          feedback: status === 'REJECTED' ? 'Documento ilegível ou incompleto.' : ''
        });
        await activity.save();
      }
    }
    console.log('Massa de atividades inserida para teste.');

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
