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
    markeduserblocked : (data,callback) => {
        const query  = "SELECT * FROM `users` WHERE `id` = '"+ data.id +"' AND `status` = 1";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                if(results[0].blocked == 0){
                    var query2  = "UPDATE `users` SET `blocked` = 1  WHERE `id` = '"+ data.id +"'";
                } else {
                    var query2  = "UPDATE `users` SET `blocked` = 0  WHERE `id` = '"+ data.id +"'";
                }
                pool.query(query2,function(err,results,fields){
                    if(err) {
                        callback(err);
                    } else {
                        callback(null,results);
                    }
                });
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