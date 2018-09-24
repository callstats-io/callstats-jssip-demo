var express = require('express');
var router = express.Router();

const ASTERISK_SERVER = process.env.ASTERISK_SERVER;
const CSIO_APP_ID = process.env.CSIO_APP_ID;
const CSIO_APP_SECRET = process.env.CSIO_APP_SECRET;

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index',
        {
            ASTERISK_SERVER: ASTERISK_SERVER,
            CSIO_APP_ID: CSIO_APP_ID,
            CSIO_APP_SECRET: CSIO_APP_SECRET
        }
    );
});

module.exports = router;
