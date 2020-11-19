const Jwt = require('jsonwebtoken');

const token = (req, res, next) => {
  req.token = null;
  req.permissions = [];

  if(req.headers['authorization'] === undefined) {
    return next();
  }

  var token = req.headers['authorization'].substring(7);

  if(token == req.config.apiKey) {
    req.token = {
      permissions: [
        'superuser'
      ]
    };
    req.permissions = req.token.permissions || [];

    return next();
  } else {
    var payload = null;

    try {
      payload = Jwt.verify(token, req.config.jwtSecret);
    } catch(err) {
      payload = null;
    }

    req.token = payload;
    req.permissions = req.token.permissions || [];

    if(req.config.onRetrievePermissions === null) {
      return next();
    } else {
      req.config.onRetrievePermissions(req.token, req.permissions, (permissions) => {
        req.permissions = permissions;

        next();
      }, (code, status, message) => {
        return res.status(code).json({
          status: status,
          message: message
        });
      });
    }
  }
};

module.exports = token;
