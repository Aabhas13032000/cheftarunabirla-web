const pool = require('../database/connection');

module.exports = {
    getcourse : (callback) => {
        const query = "SELECT c.* , (SELECT `path` FROM `images` WHERE `images`.`course_id` = c.`id` AND `iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `courses` c WHERE `status` = 1 ORDER BY `created_at` DESC";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    getcoursebyId : (data,callback) => {
        const query = "SELECT c.* , (SELECT `path` FROM `images` WHERE `images`.`course_id` = c.`id` AND `iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path ,(SELECT COUNT(*) FROM `cart` WHERE `cart`.`course_id` = c.`id` AND `cart`.`user_id` = '"+ data.user_id +"') AS count,(SELECT COUNT(*) FROM `subscription` WHERE `subscription`.`course_id` = c.`id` AND `subscription`.`user_id` = '"+ data.user_id +"' AND `status` = 1) AS subscribed FROM `courses` c WHERE `status` = 1 AND `id` = '"+ data.id +"' ORDER BY `title`";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    getusercourse : (data,callback) => {
        const query = "SELECT c.* , (SELECT `path` FROM `images` WHERE `images`.`course_id` = c.`id` AND `iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path ,(SELECT COUNT(*) FROM `cart` WHERE `cart`.`course_id` = c.`id` AND `cart`.`user_id` = '"+ data.user_id +"') AS count,(SELECT COUNT(*) FROM `subscription` WHERE `subscription`.`course_id` = c.`id` AND `subscription`.`user_id` = '"+ data.user_id +"' AND `status` = 1) AS subscribed FROM `courses` c WHERE `status` = 1 ORDER BY `title`";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    getcategorycourse : (data,callback) => {
        const query = "SELECT c.*,(SELECT `path` FROM `images` WHERE `images`.`course_id` = c.`id` AND `iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path,(SELECT COUNT(*) FROM `cart` WHERE `cart`.`course_id` = c.`id` AND `cart`.`user_id` = '"+ data.user_id +"') AS count,(SELECT COUNT(*) FROM `subscription` WHERE `subscription`.`course_id` = c.`id` AND `subscription`.`user_id` = '"+ data.user_id +"' AND `status` = 1) AS subscribed FROM `courses` c WHERE `status` = 1 AND `category` = '"+ data.category +"' ORDER BY `title`";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    getsearchedcourse : (data,callback) => {
        const query = "SELECT c.*,(SELECT `path` FROM `images` WHERE `images`.`course_id` = c.`id` AND `iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path,(SELECT COUNT(*) FROM `cart` WHERE `cart`.`course_id` = c.`id` AND `cart`.`user_id` = '"+ data.user_id +"') AS count,(SELECT COUNT(*) FROM `subscription` WHERE `subscription`.`course_id` = c.`id` AND `subscription`.`user_id` = '"+ data.user_id +"') AS subscribed FROM `courses` c WHERE `status` = 1 AND `title` LIKE '%"+ data.name +"%' ORDER BY `title`";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    addcourse : (data,callback) => {
        const query  = "INSERT INTO `courses` (`title`,`description`,`promo_video`,`price`,`discount_price`,`days`,`category`) VALUES ('"+ data.title +"','"+ data.description +"','"+ data.promo_video +"','"+ data.price +"','"+ data.discount_price +"','"+ data.days +"','"+ data.category +"')";
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
    deletecourse : (data,callback) => {
        const query2  = "UPDATE `courses` SET `status` = 0  WHERE `id` = '"+ data.id +"'";
        pool.query(query2,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });            
    },
    markedcoursefeatured : (data,callback) => {
        const query  = "SELECT * FROM `courses` WHERE `id` = '"+ data.id +"' AND `status` = 1";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                if(results[0].featured == 0){
                    var query2  = "UPDATE `courses` SET `featured` = 1  WHERE `id` = '"+ data.id +"'";
                } else {
                    var query2  = "UPDATE `courses` SET `featured` = 0  WHERE `id` = '"+ data.id +"'";
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
    getcourseimages : (data,callback) => {
        const query  = "SELECT * FROM `images` WHERE `course_id` = '"+ data +"' AND `iv_category` = 'image'";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    getcoursepdf : (data,callback) => {
        const query  = "SELECT * FROM `recipies` WHERE `course_id` = '"+ data +"'";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    editcourse : (data,id,callback) => {
        const query2  = "UPDATE `courses` SET `title` = '"+ data.title +"',`category` = '"+ data.category +"' ,`price` = '"+ data.price +"',`discount_price` = '"+ data.discount_price +"',`description` = '"+ data.description +"' , `promo_video` = '"+ data.promo_video +"' ,`days` = '"+ data.days +"' WHERE `id` = '"+ id +"'";
        pool.query(query2,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });        
        
    },
    getcoursevideos : (data,callback) => {
        const query  = "SELECT * FROM `images` WHERE `course_id` = '"+ data +"' AND `iv_category` = 'video' ORDER BY `name`";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null   ,results);
            }
        });
    },
    editcoursevideos : (data,callback) => {
        const query  = "UPDATE `images` SET `path` = '"+ data.path +"', `name` = '"+ data.name +"'  WHERE `id` = '"+ data.id +"'";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    addcoursevideos : (data,callback) => {
        const query  = "INSERT INTO `images` (`path`,`iv_category`,`category`,`course_id`,`name`) VALUES ('"+ data.path +"','video','course','"+ data.id +"','"+ data.video_name +"')";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    deletecoursevideo : (data,callback) => {
        const query2  = "DELETE FROM `images` WHERE `id` = '"+ data.id +"'";
        pool.query(query2,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });            
    },
    getcoursecategories : (callback) => {
        const query = "SELECT * FROM `course_categories` WHERE `status` = 1";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    markedcoursecategoryimportant : (data,callback) => {
        const query  = "SELECT * FROM `course_categories` WHERE `id` = '"+ data.id +"' AND `status` = 1";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                if(results[0].imp == 0){
                    var query2  = "UPDATE `course_categories` SET `imp` = 1  WHERE `id` = '"+ data.id +"'";
                } else {
                    var query2  = "UPDATE `course_categories` SET `imp` = 0  WHERE `id` = '"+ data.id +"'";
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
    checkcoursecategory : (data,callback) => {
        const query  = "SELECT * FROM `course_categories` WHERE name = '"+ data +"' AND `status` = 1";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    addcoursecategory : (data,callback) => {
        const query  = "INSERT INTO `course_categories` (`name`) VALUES ('"+ data.name +"')";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    deletecoursecategory : (data,callback) => {
        const query2  = "UPDATE `course_categories` SET `status` = 0  WHERE `id` = '"+ data.id +"'";
        pool.query(query2,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });        
    },
    updatecoursecategory : (data,callback) => {
        const query2  = "UPDATE `course_categories` SET `path` = '"+ data.path +"'  WHERE `id` = '"+ data.id +"'";
        pool.query(query2,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });        
    },
    updatecoursecategoryname : (data,callback) => {
        const query2  = "UPDATE `course_categories` SET `name` = '"+ data.name +"'  WHERE `id` = '"+ data.id +"'";
        pool.query(query2,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });        
    },
};