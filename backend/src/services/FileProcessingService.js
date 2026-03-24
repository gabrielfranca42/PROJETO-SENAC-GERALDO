const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');

class FileProcessingService {
  /**
   * Identifica o tipo do arquivo e roteia para o motor de extração correto
   * @param {Buffer} fileBuffer - Buffer do arquivo carregado via multer em memória
   * @param {String} mimeType - Tipo MIME do arquivo (req.file.mimetype)
   * @returns {Promise<String>} Texto extraído do documento
   */
  async extractText(fileBuffer, mimeType) {
    if (mimeType === 'application/pdf') {
      return await this._parsePDF(fileBuffer);
    } 
    
    if (mimeType.startsWith('image/')) {
      return await this._processOCR(fileBuffer);
    }

    throw new Error("UNSUPPORTED_MEDIA_TYPE: Apenas PDF e Imagens são permitidos.");
  }

  async _parsePDF(buffer) {
    try {
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      throw new Error(`FALHA_PARSING_PDF: ${error.message}`);
    }
  }

  async _processOCR(buffer) {
    try {
      // Execução assíncrona do Tesseract com idioma Português configurado
      const { data: { text } } = await Tesseract.recognize(buffer, 'por', {
        logger: m => console.log(m) // Log de progresso estruturado
      });
      return text;
    } catch (error) {
      throw new Error(`FALHA_MOTOR_OCR: ${error.message}`);
    }
  }
}

module.exports = new FileProcessingService();