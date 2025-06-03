exports.RoleCheck = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role_id)) {
      return res.status(403).json({ message: "Access denied (role)" });
    }
    next();
  };
};
