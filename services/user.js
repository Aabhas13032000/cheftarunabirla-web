const pool = require('../database/connection');

module.exports = {
    getusers : (data,callback) => {
        const query = "SELECT * FROM `users` WHERE `phone_number` IS NOT NULL ORDER BY `created_at` DESC LIMIT 20 OFFSET "+ data.offset +"";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    updatedevicerequest : (data,callback) => {
        const query = "UPDATE `users` SET `device_id` = '',`logged_in` = 1 WHERE `phone_number` = '"+ data.phone_number +"'";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    getsearchuser : (data,callback) => {
        const query = "SELECT * FROM `users` WHERE `phone_number` LIKE '%"+ data.phone_number +"%'";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
};