const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  // const refreshToken = req.headers["x-refresh-token"];
  // const token = authHeader && authHeader.split(" ")[1];
  // var token = req.headers["x-access-token"];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.TOKEN_SECRET, function (err, user) {

    if (err) return res.sendStatus(403);

    req.currentUser = user;

    next();
  });
}

module.exports = authenticateToken;
