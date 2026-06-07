const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendActivitySubmitted(coordinatorEmail, studentName, courseName) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: coordinatorEmail,
      subject: `SIGAC - Nova submissão de atividade: ${studentName}`,
      text: `O aluno ${studentName} submeteu uma nova atividade para o curso ${courseName}. Acesse o PWA para validação.`
    };
    return this.transporter.sendMail(mailOptions);
  }

  async sendStatusUpdate(studentEmail, activityTitle, status) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: studentEmail,
      subject: `SIGAC - Atualização de Atividade: ${status}`,
      text: `A sua atividade "${activityTitle}" foi ${status === 'APPROVED' ? 'Aprovada' : 'Reprovada'} pela coordenação.`
    };
    return this.transporter.sendMail(mailOptions);
  }

  async sendWelcomeEmail(userEmail, userName, rawPassword) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: userEmail,
      subject: `Bem-vindo ao SIGAC - Suas Credenciais`,
      text: `Olá ${userName}, bem-vindo ao SIGAC!\n\nSua conta foi criada com sucesso.\nVocê pode fazer login no app usando seu e-mail (${userEmail}) e a seguinte senha temporária: ${rawPassword}\n\nRecomendamos que você altere sua senha após o primeiro acesso.`
    };
    return this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();