const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');

const extrairHoras = (text) => {
  if (!text) return null;
  const hoursRegex = /(?:carga hor[aá]ria\s*(?:de\s*)?)?(\d+)\s*(?:horas|hrs|h\b)/i;
  const hoursMatch = text.match(hoursRegex);
  return hoursMatch ? parseInt(hoursMatch[1], 10) : null;
};

const extrairAssunto = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  for (let line of lines) {
    const lowerLine = line.toLowerCase();
    if ((lowerLine.includes('curso') || lowerLine.includes('evento') || lowerLine.includes('palestra') || lowerLine.includes('concluiu')) && line.length > 10) {
      return line.trim().replace(/^(curso\s+de|evento|palestra|concluiu\s+o|participou\s+do)/i, '').trim();
    }
  }
  return null;
};

const processarCertificado = async (buffer, mimetype) => {
  let text = '';
  if (mimetype === 'application/pdf') {
    const data = await pdfParse(buffer);
    text = data.text;
  } else if (mimetype && mimetype.startsWith('image/')) {
    const { data } = await Tesseract.recognize(buffer, 'por');
    text = data.text;
  } else {
    throw new Error('Formato não suportado para extração OCR.');
  }

  const horasEncontradas = extrairHoras(text);
  const assuntoEncontrado = extrairAssunto(text);

  return { text, horasEncontradas, assuntoEncontrado };
};

module.exports = {
  processarCertificado,
  extrairHoras,
  extrairAssunto
};