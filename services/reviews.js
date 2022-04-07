const pool = require('../database/connection');

module.exports ={
    getreviews : (data,callback) => {
        if(data.category == 'course'){
            var query = "SELECT r.*,u.`name` AS username,u.`phone_number` AS phoneNumber,(SELECT `title` FROM `courses` WHERE `courses`.`id` = r.`course_id`) AS item_name FROM `reviews` r INNER JOIN `users` u  ON u.`id` = r.`user_id` WHERE r.`category` = '"+ data.category +"'";
        } else if(data.category == 'product'){
            var query = "SELECT r.*,u.`name` AS username,u.`phone_number` AS phoneNumber,(SELECT `name` FROM `products` WHERE `products`.`id` = r.`product_id`) AS item_name FROM `reviews` r INNER JOIN `users` u  ON u.`id` = r.`user_id` WHERE r.`category` = '"+ data.category +"'";
        } else if(data.category == 'book'){
            var query = "SELECT r.*,u.`name` AS username,u.`phone_number` AS phoneNumber,(SELECT `title` FROM `books` WHERE `books`.`id` = r.`book_id`) AS item_name FROM `reviews` r INNER JOIN `users` u  ON u.`id` = r.`user_id` WHERE r.`category` = '"+ data.category +"'";
        }
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    getreviewsbyitem : (data,callback) => {
        if(data.category == 'course'){
            var query = "SELECT r.*,u.`name` AS username,u.`phone_number` AS phoneNumber FROM `reviews` r INNER JOIN `users` u  ON u.`id` = r.`user_id` WHERE r.`category`='"+ data.category +"' AND r.`course_id`='"+ data.item_id +"' ORDER BY r.`date` DESC LIMIT 10 OFFSET 0";
        } else if(data.category == 'product'){
            var query = "SELECT r.*,u.`name` AS username,u.`phone_number` AS phoneNumber FROM `reviews` r INNER JOIN `users` u  ON u.`id` = r.`user_id` WHERE r.`category`='"+ data.category +"' AND r.`product_id`='"+ data.item_id +"' ORDER BY r.`date` DESC LIMIT 10 OFFSET 0";
        } else if(data.category == 'book'){
            var query = "SELECT r.*,u.`name` AS username,u.`phone_number` AS phoneNumber FROM `reviews` r INNER JOIN `users` u  ON u.`id` = r.`user_id` WHERE r.`category`='"+ data.category +"' AND r.`book_id`='"+ data.item_id +"' ORDER BY r.`date` DESC LIMIT 10 OFFSET 0";
        }
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    addreviews : (data,callback) => {
        if(data.category == 'course'){
            var query  = "INSERT INTO `reviews` (`user_id`,`message`,`category`,`course_id`) VALUES ('"+ data.user_id +"','"+ data.message +"','"+ data.category +"','"+ data.item_id +"')";
        } else if(data.category == 'product'){
            var query  = "INSERT INTO `reviews` (`user_id`,`message`,`category`,`product_id`) VALUES ('"+ data.user_id +"','"+ data.message +"','"+ data.category +"','"+ data.item_id +"')";
        } else if(data.category == 'book'){
            var query  = "INSERT INTO `reviews` (`user_id`,`message`,`category`,`book_id`) VALUES ('"+ data.user_id +"','"+ data.message +"','"+ data.category +"','"+ data.item_id +"')";
        }
        console.log(query);
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    deletereviews : (data,callback) => {
        const query2  = "DELETE FROM `reviews` WHERE `id` = '"+ data.id +"'";
        pool.query(query2,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });            
    },
}