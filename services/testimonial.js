const pool = require('../database/connection');

module.exports ={
    gettestimonials : (callback) => {
        const query = "SELECT * FROM `testimonials` WHERE `status` = 1";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    getimptestimonials : (callback) => {
        const query = "SELECT * FROM `testimonials` WHERE `status` = 1 AND `imp` = 1";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    addtestimonial : (data,callback) => {
        const query  = "INSERT INTO `testimonials` (`name`,`message`) VALUES ('"+ data.name +"','"+ data.message +"')";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    deletetestimonial : (data,callback) => {
        const query2  = "UPDATE `testimonials` SET `status` = 0  WHERE `id` = '"+ data.id +"'";
        pool.query(query2,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });            
    },
    markedtestimonialimportant : (data,callback) => {
        const query  = "SELECT * FROM `testimonials` WHERE `id` = '"+ data.id +"' AND `status` = 1";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                if(results[0].imp == 0){
                    var query2  = "UPDATE `testimonials` SET `imp` = 1  WHERE `id` = '"+ data.id +"'";
                } else {
                    var query2  = "UPDATE `testimonials` SET `imp` = 0  WHERE `id` = '"+ data.id +"'";
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
}