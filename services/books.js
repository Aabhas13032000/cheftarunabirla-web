const pool = require('../database/connection');

//Firebase dynamic links
const { FirebaseDynamicLinks } = require('firebase-dynamic-links');
const firebaseDynamicLinks = new FirebaseDynamicLinks('AIzaSyDBV0qQlbjCyFbLEsc2BicaHHXqoN6tCqE');

async function createDynamicLink(linkToCreate) {
    const { shortLink, previewLink } = await firebaseDynamicLinks.createLink({
        dynamicLinkInfo: {
          domainUriPrefix: 'https://cheftarunabirla.page.link',
          link: linkToCreate,
          androidInfo: {
            androidPackageName: 'com.cheftarunbirla',
          },
          iosInfo: {
            iosBundleId: 'com.technotwist.tarunaBirla',
          },
        },
      });
    // return {
    //     shortLink:shortLink,
    //     previewLink:previewLink
    // };
    return shortLink;
}  


module.exports = {
    addbook : (data,callback) => {
        const query  = "INSERT INTO `books` (`title`,`description`,`price`,`discount_price`,`days`,`category`,`price_with_video`,`discont_price_with_video`,`only_video_price`,`only_video_discount_price`,`includes_videos`,`video_days`) VALUES ('"+ data.title +"','"+ data.description +"','"+ data.price +"','"+ data.discount_price +"','"+ data.days +"','"+ data.category +"','"+ data.price_with_video +"','"+ data.discont_price_with_video +"','"+ data.only_video_price +"','"+ data.only_video_discount_price +"','"+ data.includes_videos +"','"+ data.video_days +"')";
        var images_array = [];
        if(typeof (Object.entries(data)[4])[1] != 'string'){
            images_array = (Object.entries(data)[4])[1];
        } else {
            images_array.push((Object.entries(data)[4])[1]);
        }
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                for(var i=0;i<images_array.length;i++) {
                    var query  = "INSERT INTO `images` (`path`,`iv_category`,`category`,`book_id`) VALUES ('"+ images_array[i] +"','image','book','"+ results.insertId +"')";
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
    getbook : (callback) => {
        const query = "SELECT b.* FROM `books` b WHERE `status` = 1";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    getuserbook : (data,callback) => {
        const query = "SELECT c.* , (SELECT `path` FROM `images` WHERE `images`.`book_id` = c.`id` LIMIT 1 OFFSET 0) AS image_path ,(SELECT COUNT(*) FROM `cart` WHERE `cart`.`book_id` = c.`id` AND `cart`.`user_id` = '"+ data.user_id +"') AS count FROM `books` c WHERE `status` = 1 ORDER BY `created_at` ASC";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    getuserbookbyId : (data,callback) => {
        if(data.user_id) {
            var query = "SELECT c.* , (SELECT `path` FROM `images` WHERE `images`.`book_id` = c.`id` LIMIT 1 OFFSET 0) AS image_path ,(SELECT COUNT(*) FROM `cart` WHERE `cart`.`book_id` = c.`id` AND `cart`.`user_id` = '"+ data.user_id +"') AS count FROM `books` c WHERE `status` = 1 AND `id` = '"+ data.id +"' ORDER BY `created_at` ASC";
        } else {
            var query = "SELECT c.* , (SELECT `path` FROM `images` WHERE `images`.`book_id` = c.`id` LIMIT 1 OFFSET 0) AS image_path FROM `books` c WHERE `status` = 1 AND `id` = '"+ data.id +"' ORDER BY `created_at` ASC";
        }
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                if(results[0].share_url == null || results[0].share_url.length == 0){
                    createDynamicLink(`https://dashboard.cheftarunabirla.com/getUserBookbyId/${data.id}/${data.user_id}`).then((result1) => {
                        results[0].share_url = result1;
                        var updateShareUrl = "UPDATE `books` SET `share_url` = '"+ result1 +"' WHERE `id` = '"+ data.id +"'";
                        pool.query(updateShareUrl,function(err,updateShareUrl){
                            if(err) {
                                callback(err);
                            } else {
                                callback(null,results);
                            }
                        });
                    }).catch((err) => {
                        console.log(err);
                    });
                } else {
                    callback(null,results);
                }
            }
        });
    },
    getimpbooks : (callback) => {
        const query = "SELECT c.*, (SELECT `path` FROM `images` WHERE `images`.`book_id` = c.`id` LIMIT 1 OFFSET 0) AS image_path FROM `books` c WHERE `status` = 1 AND `imp` = 1 LIMIT 2 OFFSET 0";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    checkbook : (data,callback) => {
        const query  = "SELECT * FROM `books` WHERE `title` = '"+ data +"' AND `status` = 1";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    getbookimages : (data,callback) => {
        if(data.offset){
            var query  = "SELECT * FROM `images` WHERE `book_id` = '"+ data +"' LIMIT 20 OFFSET "+ data.offset +"";
        } else { 
            var query  = "SELECT * FROM `images` WHERE `book_id` = '"+ data +"'";
        }
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    deletebook : (data,callback) => {
        const query2  = "UPDATE `books` SET `status` = 0  WHERE `id` = '"+ data.id +"'";
        pool.query(query2,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });            
    },
    editbook : (data,id,callback) => {
        const query2  = "UPDATE `books` SET `title` = '"+ data.title +"',`category` = '"+ data.category +"' ,`price` = '"+ data.price +"',`days` = '"+ data.days +"',`description` = '"+ data.description +"',`discount_price` = '"+ data.discount_price +"',`price_with_video` = '"+ data.price_with_video +"',`discont_price_with_video` = '"+ data.discont_price_with_video +"',`only_video_price` = '"+ data.only_video_price +"',`only_video_discount_price` = '"+ data.only_video_discount_price +"',`includes_videos` = '"+ data.includes_videos +"',`video_days` = '"+ data.video_days +"' WHERE `id` = '"+ id +"'";
        pool.query(query2,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });        
        
    },
    getbookvideos : (data,callback) => {
        const query  = "SELECT * FROM `images` WHERE `book_id` = '"+ data +"' AND `iv_category` = 'video'";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    addbookvideos : (data,callback) => {
        const query  = "INSERT INTO `images` (`path`,`iv_category`,`category`,`book_id`,`name`) VALUES ('"+ data.path +"','video','book','"+ data.id +"','"+ data.video_name +"')";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    deletebookvideo : (data,callback) => {
        const query2  = "DELETE FROM `images` WHERE `id` = '"+ data.id +"'";
        pool.query(query2,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });            
    },
    editbookvideos : (data,callback) => {
        const query  = "UPDATE `images` SET `path` = '"+ data.path +"', `name` = '"+ data.name +"'  WHERE `id` = '"+ data.id +"'";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
}