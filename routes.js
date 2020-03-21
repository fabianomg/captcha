'use strict'
const express = require('express');
const router = express.Router();
const Main = require('./controllers/MaiController');

/* GET home page. */
router.post('/getToken', Main.getToken);
router.post('/getBalance', Main.getBalance);

module.exports = router;