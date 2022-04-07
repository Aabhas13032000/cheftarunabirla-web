const express = require('express');
const router = express.Router();
const pool = require('../database/connection');
// const cron = require('node-cron');
// cron.schedule('*/2 * * * * *', function() {
//     console.log('running a task every 2 seconds');
//     number = number+ 5;
// });

/* GET Chat page. */
router.get('/', function(req, res, next) {
    res.render('pages/live/user_live',{
        query:req.query
    });
});

/* GET Chat page. */
router.post('/add_message', function(req, res, next) {
    res.json('chat messages');
});


module.exports = router;