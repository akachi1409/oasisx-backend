const {Router} = require('express');
const router = new Router();
const cryptoRouter = require("./crypto/crypto");

router.use('/crypto', cryptoRouter);
module.exports = router;