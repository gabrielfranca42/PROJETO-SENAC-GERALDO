const Tesseract = require('tesseract.js');

const processarCertificado = async (buffer) => {
  // O processamento ocorre aqui, no servidor
  const { data: { text } } = await Tesseract.recognize(buffer, 'por');
  
  // Lógica para extrair dados críticos citados no PDF (Carga horária, Nome, Data)
  const horasEncontradas = extrairHoras(text); 
  return { text, horasEncontradas };
};