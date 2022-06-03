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
    addproduct : (data,callback) => {
        const query  = "INSERT INTO `products` (`name`,`description`,`price`,`discount_price`,`category_id`,`related_products_array`) VALUES ('"+ data.name +"','"+ data.description +"','"+ data.price +"','"+ data.discount_price +"','"+ data.category +"','"+ data.relatedproducts +"')";
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
                    var query  = "INSERT INTO `images` (`path`,`iv_category`,`category`,`product_id`) VALUES ('"+ images_array[i] +"','image','product','"+ results.insertId +"')";
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
    getproduct : (offset,callback) => {
        const query = "SELECT p.* , c.`name` AS c_name, (SELECT `path` FROM `images` WHERE `images`.`product_id` = p.`id` LIMIT 1 OFFSET 0) AS image_path  FROM `products` p INNER JOIN `product_categories` c ON c.`id` = p.`category_id` WHERE p.`status` = 1 ORDER BY p.`created_at` DESC LIMIT 20 OFFSET "+ offset +"";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    getproductwithoutoffset : (callback) => {
        const query = "SELECT *  FROM `products` WHERE `status` = 1 ORDER BY `created_at` DESC";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    getuserproduct : (data,callback) => {
        if(data.offset){
            var query = "SELECT p.* , c.`name` AS c_name, (SELECT `path` FROM `images` WHERE `images`.`product_id` = p.`id` LIMIT 1 OFFSET 0) AS image_path FROM `products` p INNER JOIN `product_categories` c ON c.`id` = p.`category_id` WHERE p.`status` = 1 ORDER BY p.`created_at` DESC LIMIT 20 OFFSET "+ data.offset +"";
        } else {
            var query = "SELECT p.* , c.`name` AS c_name, (SELECT `path` FROM `images` WHERE `images`.`product_id` = p.`id` LIMIT 1 OFFSET 0) AS image_path FROM `products` p INNER JOIN `product_categories` c ON c.`id` = p.`category_id` WHERE p.`status` = 1 ORDER BY p.`created_at` DESC";
        }
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    getuserproductbyid : (data,callback) => {
        if(data.user_id){
            var query = "SELECT p.* , c.`name` AS c_name, (SELECT `path` FROM `images` WHERE `images`.`product_id` = p.`id` LIMIT 1 OFFSET 0) AS image_path , (SELECT COUNT(*) FROM `cart` WHERE `cart`.`product_id` = p.`id` AND `cart`.`user_id` = '"+ data.user_id +"') AS count FROM `products` p INNER JOIN `product_categories` c ON c.`id` = p.`category_id` WHERE p.`status` = 1 AND p.`id` = '"+ data.id +"' ORDER BY p.`created_at` DESC";
        } else {
            var query = "SELECT p.* , c.`name` AS c_name, (SELECT `path` FROM `images` WHERE `images`.`product_id` = p.`id` LIMIT 1 OFFSET 0) AS image_path  FROM `products` p INNER JOIN `product_categories` c ON c.`id` = p.`category_id` WHERE p.`status` = 1 AND p.`id` = '"+ data.id +"' ORDER BY p.`created_at` DESC";
        }
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                if(results[0].share_url == null || results[0].share_url.length == 0){
                    createDynamicLink(`https://dashboard.cheftarunabirla.com/getUserProductById/${data.id}/${data.user_id}&product_id=${data.id}`).then((result1) => {
                        results[0].share_url = result1;
                        var updateShareUrl = "UPDATE `products` SET `share_url` = '"+ result1 +"' WHERE `id` = '"+ data.id +"'";
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
    getcategoryproduct : (data,callback) => {
        if(data.offset){
            var query = "SELECT p.* , c.`name` AS c_name, (SELECT `path` FROM `images` WHERE `images`.`product_id` = p.`id` LIMIT 1 OFFSET 0) AS image_path , (SELECT COUNT(*) FROM `cart` WHERE `cart`.`product_id` = p.`id` AND `cart`.`user_id` = '"+ data.user_id +"') AS count FROM `products` p INNER JOIN `product_categories` c ON c.`id` = p.`category_id` WHERE p.`status` = 1 AND c.`name` = '"+ data.category +"' ORDER BY p.`created_at` DESC LIMIT 20 OFFSET "+ data.offset +"";
        } else {
            var query = "SELECT p.* , c.`name` AS c_name, (SELECT `path` FROM `images` WHERE `images`.`product_id` = p.`id` LIMIT 1 OFFSET 0) AS image_path , (SELECT COUNT(*) FROM `cart` WHERE `cart`.`product_id` = p.`id` AND `cart`.`user_id` = '"+ data.user_id +"') AS count FROM `products` p INNER JOIN `product_categories` c ON c.`id` = p.`category_id` WHERE p.`status` = 1 AND c.`name` = '"+ data.category +"' ORDER BY p.`created_at` DESC";
        }
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    getsearchedproduct : (data,callback) => {
        if(data.user_id) {
            var query = "SELECT p.* , c.`name` AS c_name, (SELECT `path` FROM `images` WHERE `images`.`product_id` = p.`id` LIMIT 1 OFFSET 0) AS image_path , (SELECT COUNT(*) FROM `cart` WHERE `cart`.`product_id` = p.`id` AND `cart`.`user_id` = '"+ data.user_id +"')  FROM `products` p INNER JOIN `product_categories` c ON c.`id` = p.`category_id` WHERE p.`status` = 1 AND p.`name` LIKE '%"+ data.name +"%' ORDER BY p.`created_at` DESC";
        } else {
            var query = "SELECT p.* , c.`name` AS c_name, (SELECT `path` FROM `images` WHERE `images`.`product_id` = p.`id` LIMIT 1 OFFSET 0) AS image_path FROM `products` p INNER JOIN `product_categories` c ON c.`id` = p.`category_id` WHERE p.`status` = 1 AND p.`name` LIKE '%"+ data.name +"%' ORDER BY p.`created_at` DESC";
        }
        pool.query(query,function(err,results,fields){
            // console.log(results);
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    geteachproduct : (data,callback) => {
        const query = "SELECT p.* , c.`name` AS c_name, (SELECT `path` FROM `images` WHERE `images`.`product_id` = p.`id` LIMIT 1 OFFSET 0) AS image_path  FROM `products` p INNER JOIN `product_categories` c ON c.`id` = p.`category_id` WHERE p.`status` = 1 AND p.`id` = '"+ data.id +"' ORDER BY p.`created_at` DESC";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    getproductimages : (data,callback) => {
        if(data.offset){
            var query  = "SELECT * FROM `images` WHERE `product_id` = '"+ data +"' LIMIT 20 OFFSET "+ data.offset +"";
        } else { 
            var query  = "SELECT * FROM `images` WHERE `product_id` = '"+ data +"'";
        }
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    deleteproduct : (data,callback) => {
        const query2  = "UPDATE `products` SET `status` = 0  WHERE `id` = '"+ data.id +"'";
        pool.query(query2,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });            
    },
    markedproductfeatured : (data,callback) => {
        const query  = "SELECT * FROM `products` WHERE `id` = '"+ data.id +"' AND `status` = 1";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                if(results[0].featured == 0){
                    var query2  = "UPDATE `products` SET `featured` = 1  WHERE `id` = '"+ data.id +"'";
                } else {
                    var query2  = "UPDATE `products` SET `featured` = 0  WHERE `id` = '"+ data.id +"'";
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
    editproduct : (data,id,callback) => {
        const query2  = "UPDATE `products` SET `name` = '"+ data.name +"',`category_id` = '"+ data.category +"' ,`price` = '"+ data.price +"',`discount_price` = '"+ data.discount_price +"',`description` = '"+ data.description +"' , `stock` = '"+ data.stock +"' , `related_products_array` = '"+ data.relatedproducts +"' WHERE `id` = '"+ id +"'";
        pool.query(query2,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });        
        
    },
    getproductcategories : (callback) => {
        const query = "SELECT * FROM `product_categories` WHERE `status` = 1";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    getproductsubcategories : (category_id,callback) => {
        const query = "SELECT * FROM `product_sub_categories` WHERE `status` = 1 AND `category_id` = '"+ category_id +"'";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    checkproductcategory : (data,callback) => {
        const query  = "SELECT * FROM `product_categories` WHERE name = '"+ data +"' AND `status` = 1";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    addproductcategory : (data,callback) => {
        const query  = "INSERT INTO `product_categories` (`name`) VALUES ('"+ data.name +"')";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    deleteproductcategory : (data,callback) => {
        const query2  = "UPDATE `product_categories` SET `status` = 0  WHERE `id` = '"+ data.id +"'";
        pool.query(query2,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });        
        
    },
    updateproductcategory : (data,callback) => {
        const query2  = "UPDATE `product_categories` SET `name` = '"+ data.name +"'  WHERE `id` = '"+ data.id +"'";
        pool.query(query2,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });        
        
    },
}