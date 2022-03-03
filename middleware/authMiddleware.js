const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const token = req.headers["Authorization"];
  // const refreshToken = req.headers["x-refresh-token"];
  // const token = authHeader && authHeader.split(" ")[1];
  // var token = req.headers["x-access-token"];

  if (token == null) return res.sendStatus(401);
  console.log(token);

  jwt.verify(token, process.env.TOKEN_SECRET, function (err, user) {
    console.log(err);

    if (err) return res.sendStatus(403);

    req.user = user;

    next();
  });
}

module.exports = authenticateToken;
