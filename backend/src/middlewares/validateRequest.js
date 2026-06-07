const { z } = require('zod');

const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "VALIDATION_ERROR: Dados inválidos.",
          details: error.errors
        });
      }
      return res.status(500).json({ error: "INTERNAL_SERVER_ERROR: Erro de validação." });
    }
  };
};

module.exports = validateRequest;
