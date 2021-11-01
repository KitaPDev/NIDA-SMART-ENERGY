const httpStatusCodes = require("http-status-codes").StatusCodes;
const authService = require("../services/auth.service");
const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  let cookies = req.cookies;
  const token = cookies.jwt;
  if (token) {
    try {
      let decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);

      let refreshToken = cookies.refresh_jwt;

      let newToken;
      if (jwt.decode(refreshToken) !== null) {
        newToken = await authService.newToken(refreshToken);
      }

      if (newToken === undefined) {
        res.clearCookie("jwt", {
          path: "/",
          domain: "." + process.env.BASE_DOMAIN,
        });
        res.clearCookie("refresh_jwt", {
          domain: "." + process.env.BASE_DOMAIN,
        });
        res.clearCookie("crumb", { domain: "." + process.env.BASE_DOMAIN });

        return res.status(httpStatusCodes.UNAUTHORIZED).send();
      }

      res.cookie("jwt", newToken, {
        httpOnly: true,
        domain: "." + process.env.BASE_DOMAIN,
      });

      req.userType = decodedToken.userType;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return res.sendStatus(httpStatusCodes.UNAUTHORIZED);
      }

      console.log(err);
      return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
    }

    next();
  } else {
    return res.status(httpStatusCodes.UNAUTHORIZED).send("No token provided.");
  }
};
