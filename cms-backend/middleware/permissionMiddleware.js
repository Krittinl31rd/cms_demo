exports.PermissionCheck = (permission) => {
  return (req, res, next) => {
    const permissions = req.user.permissions || [];
    if (!permissions.includes(permission)) {
      return res.status(403).json({ message: "Access denied (permission)" });
    }
    next();
  };
};
