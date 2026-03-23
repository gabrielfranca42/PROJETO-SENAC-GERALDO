const authorize = (roles = []) => {
  return (req, res, next) => {
    // req.user é preenchido pelo middleware de JWT anterior
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: "ACESSO_NEGADO: Permissão insuficiente para esta operação." 
      });
    }
    next();
  };
};

module.exports = authorize;