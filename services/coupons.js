const pool = require('../database/connection');

module.exports = {
    getcoupons : (callback) => {
        const query = "SELECT * FROM `coupon` WHERE `status` = 1";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    getcouponsbycategory : (data,callback) => {
        const query = "SELECT * FROM `coupon` WHERE `status` = 1 AND `discount_for` ='"+ data.discount_for +"' AND `linked_category` = '"+ data.linked_category +"'";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    deletecoupons : (data,callback) => {
        const query2  = "UPDATE `coupon` SET `status` = 0  WHERE `id` = '"+ data.id +"'";
        pool.query(query2,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });            
    },
    addcoupons : (data,callback) => {
        const query2  = "INSERT INTO `coupon` (`user_id`,`ccode`,`dis`,`linked_category`,`linked_array`,`discount_for`,`minimum`,`maximum`) VALUES ('all','"+ data.ccode +"','"+ data.dis +"','"+ data.linked_category +"','"+ data.linked_item +"','"+ data.discount_for +"','"+ data.minimum +"','"+ data.maximum +"')";
        pool.query(query2,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });            
    },
    editcoupons : (data,id,callback) => {
        const query2  = "UPDATE `coupon` SET `ccode` = '"+ data.ccode +"', `dis` = '"+ data.dis +"',`linked_category` = '"+ data.linked_category +"',`minimum` = '"+ data.minimum +"',`maximum` = '"+ data.maximum +"',`linked_array` = '"+ data.linked_item +"',`discount_for` = '"+ data.discount_for +"'  WHERE `id` = '"+ id +"'";
        pool.query(query2,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });            
    },
}