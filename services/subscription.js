const pool = require('../database/connection');

module.exports = {
    getsubscription : (data,callback) => {
        if(data.category == 'course'){
            var query = "SELECT o.* , (SELECT `phone_number` FROM `users` WHERE `users`.`id` = o.`user_id`) AS phoneNumber,(SELECT `title` FROM `courses` WHERE `courses`.`id` = o.`course_id`) AS item_name,(SELECT `category` FROM `courses` WHERE `courses`.`id` = o.`course_id`) AS item_category FROM `subscription` o WHERE `status` = 1 AND o.`category`='"+ data.category +"' ORDER BY `id` DESC";
        } else if(data.category == 'book'){
            var query = "SELECT o.* , (SELECT `phone_number` FROM `users` WHERE `users`.`id` = o.`user_id`) AS phoneNumber,(SELECT `title` FROM `books` WHERE `books`.`id` = o.`book_id`) AS item_name,(SELECT `category` FROM `books` WHERE `books`.`id` = o.`book_id`) AS item_category FROM `subscription` o WHERE `status` = 1 AND o.`category`='"+ data.category +"' ORDER BY `id` DESC";
        }
        // console.log(query);
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    deletesubscription : (data,callback) => {
        const query2  = "UPDATE `subscription` SET `status` = 0  WHERE `id` = '"+ data.id +"'";
        pool.query(query2,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });            
    },
    addsubscription : (data,callback) => {
        if(data.category == 'course'){
            var query  = "INSERT INTO `subscription` (`category`,`date_purchased`,`end_date`,`user_id`,`course_id`) VALUES ('"+ data.category +"','"+ data.date_purchased +"','"+ data.end_date +"','"+ data.user_id +"','"+ data.item_id +"')";
        } else if(data.category == 'book'){
            var query  = "INSERT INTO `subscription` (`category`,`date_purchased`,`end_date`,`user_id`,`book_id`) VALUES ('"+ data.category +"','"+ data.date_purchased +"','"+ data.end_date +"','"+ data.user_id +"','"+ data.item_id +"')";
        }
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    getsubscriptionusers : (callback) => {
        const query = "SELECT * FROM `users` WHERE `phone_number` IS NOT NULL ORDER BY `created_at` DESC";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    editsubscription : (data,callback) => {
        const query2  = "UPDATE `subscription` SET `end_date` = '"+ data.end_date +"',`status` = 1 WHERE `id` = '"+ data.id +"'";
        pool.query(query2,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });        
        
    },
}