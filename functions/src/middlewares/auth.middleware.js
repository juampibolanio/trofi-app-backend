const admin = require("../../config/firebase");

module.exports = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const parts = header.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json(
          {success: false, error: "Token requerido o formato inválido"});
    }

    const idToken = parts[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded; // uid, email, etc.
    next();
  } catch (err) {
    return res.status(401).json(
        {success: false, error: `Token inválido: ${err.message}`});
  }
};
