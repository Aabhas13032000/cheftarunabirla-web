const pool = require('../database/connection');

module.exports = {
    deletecategory : (data,callback) => {
        const query2  = "UPDATE `categories` SET `status` = 0  WHERE `id` = '"+ data.id +"'";
        pool.query(query2,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });        
        
    },
    markedcategoryimportant : (data,callback) => {
        const query  = "SELECT * FROM `categories` WHERE `id` = '"+ data.id +"' AND `status` = 1";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                if(results[0].imp == 0){
                    var query2  = "UPDATE `categories` SET `imp` = 1  WHERE `id` = '"+ data.id +"'";
                } else {
                    var query2  = "UPDATE `categories` SET `imp` = 0  WHERE `id` = '"+ data.id +"'";
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
    getcategories : (callback) => {
        const query  = "SELECT * FROM `categories` WHERE `status` = 1";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    checkCategory : (data,callback) => {
        const query  = "SELECT * FROM `categories` WHERE name = '"+ data +"' AND `status` = 1";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    addcategory : (data,callback) => {
        const query  = "INSERT INTO `categories` (`name`,`image`) VALUES ('"+ data.name +"','"+ data.image +"')";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    }
}