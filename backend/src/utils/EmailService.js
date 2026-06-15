const nodemailer = require('nodemailer');

// Classe de serviço para gerenciar todos os envios de e-mails da aplicação
class EmailService {
  constructor() {
    // Configura o transportador usando as credenciais SMTP definidas no .env
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Notifica o coordenador quando um aluno submete uma nova atividade (certificado)
  async sendActivitySubmitted(coordinatorEmail, studentName, courseName) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: coordinatorEmail,
      subject: `SIGAC - Nova submissão de atividade: ${studentName}`,
      text: `O aluno ${studentName} submeteu uma nova atividade para o curso ${courseName}. Acesse o APP para validação.`
    };
    return this.transporter.sendMail(mailOptions);
  }

  // Envia atualização para o aluno quando sua atividade é avaliada (Aprovada/Reprovada)
  async sendStatusUpdate(studentEmail, activityTitle, status) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: studentEmail,
      subject: `SIGAC - Atualização de Atividade: ${status}`,
      text: `A sua atividade "${activityTitle}" foi ${status === 'APPROVED' ? 'Aprovada' : 'Reprovada'} pela coordenação.`
    };
    return this.transporter.sendMail(mailOptions);
  }

  async sendLoginAlert(userEmail, userName) {
    const dataHora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: userEmail,
      subject: `SIGAC - Alerta de Login`,
      text: `Olá ${userName},\n\nUm novo login foi realizado na sua conta do SIGAC em ${dataHora}.\n\nSe não foi você, por favor contate a coordenação imediatamente.`
    };
    return this.transporter.sendMail(mailOptions);
  }

  async sendWelcomeEmail(userEmail, userName, rawPassword) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: userEmail,
      subject: `Bem-vindo ao SIGAC - Acesso ao Aplicativo do Aluno`,
      text: `Olá ${userName}, bem-vindo(a) ao SIGAC!\n\nSeu cadastro no sistema de Validação de Certificados foi criado pelo seu coordenador.\n\nVocê já pode acessar o aplicativo mobile "ValidaUP" para enviar suas horas complementares.\n\nPara entrar no aplicativo, utilize as seguintes credenciais:\n- E-mail: ${userEmail}\n- Senha: ${rawPassword} (Sua matrícula)\n\nRecomendamos que você altere sua senha após o primeiro acesso.\n\nAtenciosamente,\nCoordenação`
    };
    return this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();