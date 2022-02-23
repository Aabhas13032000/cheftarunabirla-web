const pool = require('../database/connection');

module.exports = {
    getslider : (callback) => {
        const query = "SELECT * FROM `slider` WHERE `status` = 1 ORDER BY `date` DESC";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    getsliderbycategory : (data,callback) => {
        const query = "SELECT * FROM `slider` WHERE `status` = 1 AND `show_category` = '"+ data.category +"' ORDER BY `date` DESC";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    deleteslider : (data,callback) => {
        const query2  = "UPDATE `slider` SET `status` = 0  WHERE `id` = '"+ data.id +"'";
        pool.query(query2,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });            
    },
    editslider : (data,callback) => {
        const query2  = "UPDATE `slider` SET `linked_category` = '"+ data.show_category +"',`linked_array` = '"+ data.linked_item +"' WHERE `id` = '"+ data.id +"'";
        pool.query(query2,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });            
    },
    addslider : (data,callback) => {
        const query2  = "INSERT INTO `slider` (`category`,`path`,`linked_category`,`thumbnail`,`linked_array`,`show_category`) VALUES ('"+ data.category +"','"+ data.path +"','"+ data.show_category +"','"+ data.thumbnail +"','"+ data.linked_item +"','all')";
        pool.query(query2,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });            
    },
}