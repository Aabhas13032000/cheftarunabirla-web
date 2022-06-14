const pool = require('../database/connection');

module.exports = {
    getlive : (data,callback) => {
        if(data.offset){ 
            var query = "SELECT * ,(SELECT `id` FROM `courses` WHERE `courses`.`live_id` = `live`.`id`) AS course_id,(SELECT `days` FROM `courses` WHERE `courses`.`live_id` = `live`.`id`) AS days FROM `live` WHERE `status` = 1 ORDER BY `created_at` DESC LIMIT 20 OFFSET "+ data.offset +"";
        } else {
            var query = "SELECT * ,(SELECT `id` FROM `courses` WHERE `courses`.`live_id` = `live`.`id`) AS course_id,(SELECT `days` FROM `courses` WHERE `courses`.`live_id` = `live`.`id`) AS days FROM `live` WHERE `status` = 1 ORDER BY `created_at` DESC";
        }
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    getuserlive : (data,callback) => {
        if(data.live_id){
            var query = "SELECT c.* ,`courses`.`id` AS course_id,(SELECT COUNT(*) FROM `live_subscription` WHERE `live_subscription`.`live_id` = c.`id` AND `live_subscription`.`user_id` = '"+ data.user_id +"') AS subscribed ,(SELECT COUNT(*) FROM `live_subscription` WHERE `live_subscription`.`live_id` = c.`id`) AS live_users_count FROM `live` c INNER JOIN `courses` ON `courses`.`live_id` = c.`id` WHERE c.`status` = 1 AND c.`id` = '"+ data.live_id +"' ORDER BY `live_date`";
        } else {
            var query = "SELECT c.* ,`courses`.`id` AS course_id,(SELECT COUNT(*) FROM `live_subscription` WHERE `live_subscription`.`live_id` = c.`id` AND `live_subscription`.`user_id` = '"+ data.user_id +"') AS subscribed,(SELECT COUNT(*) FROM `live_subscription` WHERE `live_subscription`.`live_id` = c.`id`) AS live_users_count FROM `live` c INNER JOIN `courses` ON `courses`.`live_id` = c.`id` WHERE c.`status` = 1 ORDER BY `live_date`";
        }
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    getliveusers : (data,callback) => {
        const query = "SELECT `live_subscription`.*,`users`.`phone_number`,`users`.`name` FROM `live_subscription` INNER JOIN `users` ON `users`.`id` = `live_subscription`.`user_id` WHERE `live_id` = '"+ data.id +"'";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    addliveclass : (data,callback) => {
        const query  = "INSERT INTO `live` (`title`,`live_date`,`price`,`discount_price`,`image_path`,`description`,`promo_video`) VALUES ('"+ data.title +"','"+ data.live_date +"','"+ data.price +"','"+ data.discount_price +"','"+ data.gallery +"','"+ data.description +"','"+ data.promo_video +"')";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    addliveclassuser : (data,callback) => {
        const query  = "INSERT INTO `live_subscription` (`user_id`,`live_id`) VALUES ('"+ data.user_id +"','"+ data.live_id +"')";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    editliveclass : (data,callback) => {
        const query  = "UPDATE `live` SET `title` = '"+ data.title +"',`url` = '"+ data.url +"',`live_date` = '"+ data.live_date +"',`price` = '"+ data.price +"',`discount_price` = '"+ data.discount_price +"',`description` = '"+ data.description +"',`promo_video` = '"+ data.promo_video +"' WHERE `id` = '"+ data.id +"'";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    deleteliveclass : (data,callback) => {
        const query2  = "UPDATE `live` SET `status` = 0  WHERE `id` = '"+ data.id +"'";
        pool.query(query2,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });            
    },
    deleteliveclassuser : (data,callback) => {
        const query2  = "DELETE FROM `live_subscription` WHERE `id` = '"+ data.id +"'";
        pool.query(query2,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });            
    },
};