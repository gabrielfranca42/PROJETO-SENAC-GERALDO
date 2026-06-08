const { extrairHoras, extrairAssunto } = require('./orcService');

describe('orcService Utils', () => {

  describe('extrairHoras', () => {
    it('deve extrair horas quando o texto possui o termo "carga horária de X horas"', () => {
      const texto = "O aluno participou do curso com carga horária de 40 horas e foi aprovado.";
      expect(extrairHoras(texto)).toBe(40);
    });

    it('deve extrair horas quando o texto possui abreviação "Xh"', () => {
      const texto = "Duração total de 12h confirmada.";
      expect(extrairHoras(texto)).toBe(12);
    });

    it('deve retornar null se o texto for nulo/indefinido', () => {
      expect(extrairHoras(null)).toBeNull();
      expect(extrairHoras(undefined)).toBeNull();
    });

    it('deve retornar null se não contiver horas no texto', () => {
      const texto = "Apenas um certificado de participação no evento sem mencionar a duração.";
      expect(extrairHoras(texto)).toBeNull();
    });
  });

  describe('extrairAssunto', () => {
    it('deve extrair o assunto limpo quando encontra a palavra "curso"', () => {
      const texto = "Participou do\nCurso de React Native Completo\ne obteve nota máxima.";
      // A Regex no extrairAssunto tira a palavra "curso de" do começo
      expect(extrairAssunto(texto)).toBe("React Native Completo");
    });

    it('deve extrair o assunto limpo quando encontra a palavra "evento"', () => {
      const texto = "Maravilhoso\nEvento Semana da Tecnologia\npara alunos.";
      expect(extrairAssunto(texto)).toBe("Semana da Tecnologia");
    });

    it('deve retornar null se não encontrar palavras-chave ou a linha for muito curta', () => {
      const texto = "Certificado\nAprovado\n2023\nFim";
      expect(extrairAssunto(texto)).toBeNull();
    });

    it('deve retornar null se o texto for nulo', () => {
      expect(extrairAssunto(null)).toBeNull();
    });
  });

});
