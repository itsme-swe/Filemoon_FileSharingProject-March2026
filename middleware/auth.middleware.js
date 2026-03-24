//🌟 This middleware will check if user is logged in or not
const jwt = require("jsonwebtoken");

const AuthMiddleware = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    //1️⃣
    if (!authorization)
      return res.status(401).json({ message: "Invalid request" });

    //🔸 Here we are checking the type of token is "Bearer"
    const [type, token] = authorization.split(" "); // Destructuring an array -- 0 index_value will store in type and 1 index_value will store in token

    //2️⃣
    if (type !== "Bearer")
      return res.status(401).json({ message: "Invalid request" });

    //3️⃣
    const user = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = user; // 4️⃣

    next(); // 5️⃣
  } catch (error) {
    res.status(401).json({ message: "Invalid request" });
  }
};

module.exports = AuthMiddleware;

/*
Implementing multilevel securities to validate logged in user:
1️⃣ Check authorization key is received or not
2️⃣ Check the type of token received in req.headers is "Bearer"
3️⃣ Now validate token with secret key
4️⃣ Inject user payload in req.object
5️⃣ Forward the request to controller
*/
