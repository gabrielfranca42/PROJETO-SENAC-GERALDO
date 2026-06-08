const authService = require('./auth.service');
const authRepository = require('./auth.repository');
const EmailService = require('../../utils/EmailService');
const jwt = require('jsonwebtoken');

// Mockamos os arquivos externos
jest.mock('./auth.repository');
jest.mock('../../utils/EmailService');
jest.mock('jsonwebtoken');

describe('AuthService', () => {

  beforeEach(() => {
    // Limpa os mocks antes de cada teste para evitar interferências
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('deve lançar um erro 400 se o email não for informado', async () => {
      await expect(authService.login(null, 'senha123')).rejects.toThrow('BAD_REQUEST: E-mail e senha são obrigatórios.');
    });

    it('deve lançar um erro 400 se a senha não for informada', async () => {
      await expect(authService.login('gabriel@teste.com', null)).rejects.toThrow('BAD_REQUEST: E-mail e senha são obrigatórios.');
    });

    it('deve lançar um erro 401 se o usuário não for encontrado no banco', async () => {
      authRepository.findUserByEmailWithPassword.mockResolvedValue(null);

      await expect(authService.login('inexistente@teste.com', 'senha123')).rejects.toThrow('UNAUTHORIZED: Credenciais inválidas.');
    });

    it('deve lançar um erro 401 se a senha não conferir', async () => {
      const mockUser = {
        _id: '123',
        comparePassword: jest.fn().mockResolvedValue(false)
      };
      authRepository.findUserByEmailWithPassword.mockResolvedValue(mockUser);

      await expect(authService.login('gabriel@teste.com', 'senha_errada')).rejects.toThrow('UNAUTHORIZED: Credenciais inválidas.');
    });

    it('deve retornar o token e enviar email de alerta se as credenciais estiverem corretas (Caminho Feliz)', async () => {
      // Configuramos o usuário mockado com a função de comparar senha retornando true
      const mockUser = {
        _id: '12345',
        name: 'Gabriel',
        email: 'gabriel@teste.com',
        role: 'STUDENT',
        courses: ['curso1', 'curso2'],
        matricula: '2020123',
        comparePassword: jest.fn().mockResolvedValue(true)
      };
      
      authRepository.findUserByEmailWithPassword.mockResolvedValue(mockUser);
      
      // Configuramos o JWT mockado
      jwt.sign.mockReturnValue('token_falso_gerado_com_sucesso');

      // Configuramos o EmailService mockado para não dar erro
      EmailService.sendLoginAlert.mockResolvedValue(true);

      process.env.JWT_SECRET = 'segredo';

      const result = await authService.login('gabriel@teste.com', 'senha123');

      // Afirmações (Expects)
      expect(result).toHaveProperty('token', 'token_falso_gerado_com_sucesso');
      expect(result.user).toHaveProperty('id', '12345');
      expect(result.user).toHaveProperty('name', 'Gabriel');

      // Verifica se o EmailService foi realmente acionado!
      expect(EmailService.sendLoginAlert).toHaveBeenCalledTimes(1);
      expect(EmailService.sendLoginAlert).toHaveBeenCalledWith('gabriel@teste.com', 'Gabriel');
    });
  });

});
