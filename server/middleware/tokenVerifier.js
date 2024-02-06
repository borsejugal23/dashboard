const jwt = require("jsonwebtoken");

function tokenVerifier(req, res, next) {
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, process.env.secreteKey, (err, decoded) => {
    if (decoded) {
      // console.log(decoded, "TOKEN");
      req.body.userName = decoded.userName;
      req.body.userID = decoded.userID;
      if (decoded.role) {
        req.body.role = decoded.role;
      }
      next();
    } else {
      res.json({ msg: "Please login again!." });
    }
  });
}

module.exports = { tokenVerifier };
