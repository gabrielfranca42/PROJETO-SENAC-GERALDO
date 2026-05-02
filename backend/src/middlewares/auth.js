const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Verifica presença do header
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  // 2. Formato esperado: "Bearer <TOKEN>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ error: "Token error" });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: "Token malformatted" });
  }

  // 3. Verificação do Token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Token invalid" });
    }

    // INJEÇÃO CRÍTICA: Aqui o req.user é preenchido para o próximo middleware
    req.user = {
      id: decoded.id,
      role: decoded.role,
      courses: decoded.courses || []
    };

    return next();
  });
};

module.exports = authenticate;