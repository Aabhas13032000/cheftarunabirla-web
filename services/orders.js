const pool = require('../database/connection');

module.exports = {
    getorders : (data,callback) => {
        const query = "(SELECT o.* , (SELECT `phone_number` FROM `users` WHERE `users`.`id` = o.`user_id`) AS phoneNumber ,(SELECT `name` FROM `products` WHERE `products`.`id` = o.`product_id` ) AS name FROM `orders` o WHERE o.`status` = 1 AND o.`category` = 'product' ORDER BY o.`date_purchased` DESC) UNION ALL (SELECT o.* , (SELECT `phone_number` FROM `users` WHERE `users`.`id` = o.`user_id`) AS phoneNumber ,`books`.`title` AS name FROM `orders` o INNER JOIN `books` ON `books`.`id` = o.`book_id` WHERE o.`status` = 1 AND o.`category` = 'book' AND `books`.`category` = 'e_book' ORDER BY o.`date_purchased` DESC) LIMIT 20 OFFSET "+ data.offset +"";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    markedorderplaced : (data,callback) => {
        const query  = "SELECT * FROM `orders` WHERE `id` = '"+ data.id +"'";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                if(results[0].placed == 0){
                    var query2  = "UPDATE `orders` SET `placed` = 1  WHERE `id` = '"+ data.id +"'";
                } else {
                    var query2  = "UPDATE `orders` SET `placed` = 0  WHERE `id` = '"+ data.id +"'";
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
    addorder : (data,callback) => {
        const query  = "INSERT INTO `orders` (`payment_status`,`payment_method`,`quantity`,`price`,`paid_price`,`address`,`description`,`category`) VALUES ('"+ data.payment_status +"','"+ data.payment_method +"','"+ data.quantity +"','"+ data.price +"','"+ data.paid_price +"','"+ data.address +"','"+ data.description +"','"+ data.category +"')";
        var images_array = [];
        var pdf_array = [];
        if(typeof (Object.entries(data)[4])[1] != 'string'){
            images_array = (Object.entries(data)[4])[1];
        } else {
            images_array.push((Object.entries(data)[4])[1]);
        }
        if(typeof (Object.entries(data)[6])[1] != 'string'){
            pdf_array = (Object.entries(data)[6])[1];
        } else {
            pdf_array.push((Object.entries(data)[6])[1]);
        }
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                for(var i=0;i<images_array.length;i++) {
                    var query  = "INSERT INTO `images` (`path`,`iv_category`,`category`,`course_id`) VALUES ('"+ images_array[i] +"','image','course','"+ results.insertId +"')";
                    pool.query(query,function(err,results,fields){
                        if(err) {
                            console.log(err);
                            callback(err);
                            // break;
                        } else {
                        }
                    });
                }
                for(var i=0;i<pdf_array.length;i++) {
                    var query  = "INSERT INTO `recipies` (`course_id`,`pdflink`) VALUES ('"+ results.insertId +"','"+ pdf_array[i] +"')";
                    pool.query(query,function(err,results,fields){
                        if(err) {
                            console.log(err);
                            callback(err);
                            // break;
                        } else {
                        }
                    });
                }
                callback(null,results);
            }
        });
    },
}