const authorize = (roles = []) => {
  return (req, res, next) => {
    // 1. Validação de segurança primária: garantir que o middleware JWT anterior injetou o req.user
    if (!req.user || !req.user.role) {
      return res.status(401).json({ 
        error: "UNAUTHORIZED: Contexto de usuário ausente. Verifique o token JWT." 
      });
    }

    // 2. Regra de Negócio Hierárquica: SUPER_ADMIN ignora bloqueios de RBAC base
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    // 3. Validação estrita para STUDENT e COORDINATOR
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: "FORBIDDEN: Permissão insuficiente para esta operação." 
      });
    }

    next();
  };
};

module.exports = authorize;