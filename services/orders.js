const pool = require('../database/connection');

module.exports = {
    getorders : (data,callback) => {
        const query = "SELECT o.* , (SELECT `phone_number` FROM `users` WHERE `users`.`id` = o.`user_id`) AS phoneNumber FROM `orders` o WHERE `status` = 1 ORDER BY `date_purchased` DESC LIMIT 20 OFFSET "+ data.offset +"";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
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