import jwt from "jsonwebtoken";

export async function verifyToken(req, res, next) {
  try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
          return res.status(401).json({ error: "Authorization header missing" });
      }

      const [bearer, token] = authHeader.split(" ");
  
      if (bearer !== "Bearer" || !token) {
          return res.status(401).json({ error: "Invalid Authorization header format" });
      }

      const verifiedToken = jwt.verify(token, "secret_phrase");
      if (verifiedToken) {
          const data = jwt.decode(token);
          req.user = { role: data.role };
          return next();
      } else {
          return res.status(401).json({ error: "Invalid Token!" });
      }
  } catch (error) {
      return res.status(500).json({ msg: `${error}` });
  }
}
