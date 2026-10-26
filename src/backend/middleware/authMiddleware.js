import jwt from "jsonwebtoken";

// JWT Authentication Middleware
export const protect = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      message: "Access denied. No token provided.",
    });
  }

  try {
    const actualToken = token.startsWith("Bearer ")
      ? token.split(" ")[1]
      : token.includes(" ")
      ? token.split(" ")[1]
      : token;

    const decoded = jwt.verify(
      actualToken,
      process.env.JWT_SECRET || "mysecretkey123"
    );

    req.user = decoded;
    next();
  } catch (_error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

// Role Authorization Middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied. You do not have permission.",
      });
    }
    next();
  };
};
