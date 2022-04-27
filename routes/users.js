const express = require('express');
const router = express.Router();
const pool = require('../database/connection');

/* GET User page. */
router.get('/', function(req, res, next) {
    res.render('pages/user/user');
});

/* GET Each User page. */
router.get('/eachUser/:id', function(req, res, next) {
    const query = "SELECT * FROM `users` WHERE `id` = '"+ req.params.id +"'";
    const subscriptions = "SELECT s.* , CASE WHEN s.`course_id` IS NOT NULL THEN (SELECT `title` FROM `courses` WHERE `courses`.`id` = s.`course_id`) WHEN s.`book_id` IS NOT NULL THEN (SELECT `title` FROM `books` WHERE `books`.`id` = s.`book_id`) ELSE 'no_item' END AS item_name FROM `subscription` s WHERE s.`user_id` = '"+ req.params.id +"'";
    pool.query(query,function(err,user,fields){
        pool.query(subscriptions,function(err,subscriptions,fields){
            res.render('pages/user/each_user',{
                user:user,
                subscriptions:subscriptions
            });
        });
    });
});
  

router.post('/create_user', function(req, res, next) {
    const query = "SELECT * FROM `users` WHERE `device_id` = '"+ req.body.token +"'";
    pool.query(query,function(err,results,fields){
        if(err) {
            console.log(err);
            res.json({message:err});
        } 
        // console.log(results);
        if(results.length == 0) {
            const query2  = "INSERT INTO `users` (`device_id`) VALUES ('"+ req.body.token +"')";
            pool.query(query2,function(err,results1,fields){
                if(err) {
                    console.log(err);
                    res.json({message:'some_error_occured'});
                } else {
                    // console.log(results1);
                    res.json({message: results1.insertId});
                }
            });
        } else {
            res.json({message: results[0].id});
        }
    });
});


router.get('/getCart/:user_id', function(req, res, next) {
    var query = "SELECT * FROM `cart` WHERE `user_id` = '"+ req.params.user_id +"'";
    // const product_categories = "SELECT * FROM `product_categories` WHERE `status` = 1";
    // const course_categories = "SELECT * FROM `course_categories` WHERE `status` = 1";
    pool.query(query,function(err,results,fields){
        // pool.query(product_categories,function(err,product_categories,fields){
            // pool.query(course_categories,function(err,course_categories,fields){
                if(err) {
                    console.log(err);
                    res.json({message:'Some error occured'});
                } else {
                    res.json({
                        cart: results,
                        // product_categories:product_categories,
                        // course_categories:course_categories
                    });
                }
            // });
        // });
    });
});

router.post('/checkUserInfo', function(req, res, next) {
    const query = "SELECT * FROM `users` WHERE `device_id` = '"+ req.body.token +"' AND `phone_number` = '"+ req.body.phoneNumber +"'";
    pool.query(query,function(err,results,fields){
        if(err) {
            console.log(err);
            res.json({message:err});
        } 
        // console.log(results);
        if(results.length != 0) {
            res.json({
                message: 'user_matched',
                // cart:cart,
                // product_categories:product_categories,
                // course_categories:course_categories
            });
            // const cart = "SELECT * FROM `cart` WHERE `user_id` = '"+ results[0].id +"'";
            // const product_categories = "SELECT * FROM `product_categories` WHERE `status` = 1";
            // const course_categories = "SELECT * FROM `course_categories` WHERE `status` = 1";
            // pool.query(cart,function(err,cart,fields){
            //     pool.query(product_categories,function(err,product_categories,fields){
            //         pool.query(course_categories,function(err,course_categories,fields){
            //             res.json({
            //                 message: 'user_matched',
            //                 cart:cart,
            //                 product_categories:product_categories,
            //                 course_categories:course_categories
            //             });
            //         });
            //     });
            // });
        } else {
            const query1 = "UPDATE `users` SET `verified` = 0 WHERE `device_id` = '"+ req.body.token +"'";
            pool.query(query1,function(err,result1,fields){
                if(err){
                    res.json({message:err});
                } else {
                    res.json({message: 'user_dont_match'});
                }
            });
        }
    });
});

router.post('/save_user_mobile', function(req, res, next) {
    const query = "SELECT * FROM `users` WHERE `phone_number` = '"+ req.body.phone_number +"'";
    pool.query(query,function(err,results,fields){
        if(err) {
            console.log(err);
            res.json({message:'Some error occured'});
        } 
        // console.log(results);
        if(results.length == 0) {
            const query2  = "UPDATE `users` SET `phone_number` = '"+ req.body.phone_number +"',`logged_in` = 1 WHERE `device_id` = '"+ req.body.token +"'";
            pool.query(query2,function(err,results1,fields){
                if(err) {
                    console.log(err);
                    res.json({message:'Some error occured'});
                } else {
                    // console.log(results1);
                    res.json({message: 'success',user_id:''});
                }
            });
        } else {
            if(results[0].device_id.length !=0){
                if(results[0].device_id == req.body.token) {
                    res.json({message: 'success',user_id:''});
                } else {
                    res.json({message: 'deviceNotMatched'});
                }
            } else {
                const query4 = "SELECT * FROM `users` WHERE `device_id` = '"+ req.body.token +"'";
                const query3 = "DELETE FROM `users` WHERE `device_id` = '"+ req.body.token +"' AND `phone_number` IS NULL ";
                const query2  = "UPDATE `users` SET `device_id` = '"+ req.body.token +"',`logged_in` = 1 WHERE `phone_number` = '"+ req.body.phone_number +"'";
                const query5 = "SELECT * FROM `users` WHERE `phone_number` = '"+ req.body.phone_number +"'"
                pool.query(query4,function(err,results2,fields){
                    if(err) {
                        console.log(err);
                        res.json({message:'Some error occured'});
                    } else {
                        pool.query(query3,function(err,results1,fields){
                            if(err) {
                                console.log(err);
                                res.json({message:'Some error occured'});
                            } else {
                                pool.query(query2,function(err,results,fields){
                                    if(err) {
                                        console.log(err);
                                        res.json({message:'Some error occured'});
                                    } else {
                                        pool.query(query5,function(err,results5,fields){
                                            if(err) {
                                                console.log(err);
                                                res.json({message:'Some error occured'});
                                            } else {
                                                console.log(results5);
                                                const query1 = "UPDATE `cart` SET `user_id` = '"+ results5[0].id +"' WHERE `user_id` = '"+ results2[0].id +"'"
                                                pool.query(query1,function(err,results6,fields){
                                                    if(err) {
                                                        console.log(err);
                                                        res.json({message:'Some error occured'});
                                                    } else {
                                                        res.json({message: 'success',user_id:results5[0].id});
                                                    }
                                                });
                                            }
                                        });
                                        // res.json({message: 'success'});
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
    });
});

router.post('/addtowhislist',function(req,res,next){
    if(req.body.category == 'product'){
        var query  = "INSERT INTO `cart` (`category`,`product_id`,`user_id`,`cart_category`) VALUES ('"+ req.body.category +"','"+ req.body.id +"','"+ req.body.user_id +"','whislist')";
    }
    if(req.body.category == 'course'){
        var query  = "INSERT INTO `cart` (`category`,`course_id`,`user_id`,`cart_category`) VALUES ('"+ req.body.category +"','"+ req.body.id +"','"+ req.body.user_id +"','whislist')";
    }
    if(req.body.category == 'book' || req.body.category == 'book-videos'){
        var query  = "INSERT INTO `cart` (`category`,`book_id`,`user_id`,`cart_category`) VALUES ('"+ req.body.category +"','"+ req.body.id +"','"+ req.body.user_id +"','whislist')";
    } 
    pool.query(query,function(err,results,fields){
        if(err) {
            console.log(err);
            res.json({message:'Some error occured'});
        } else {
            res.json({message: 'success'});
        }
    });
});


router.post('/removefromwhislist',function(req,res,next){
    // console.log(req.body);
    if(req.body.category == 'product'){
        var query  = "DELETE FROM `cart` WHERE `category` = '"+ req.body.category +"' AND `product_id` = '"+ req.body.id +"' AND `user_id` = '"+ req.body.user_id +"' AND `cart_category` = 'whislist'";
    }
    if(req.body.category == 'course'){
        var query  = "DELETE FROM `cart` WHERE `category` = '"+ req.body.category +"' AND `course_id` = '"+ req.body.id +"' AND `user_id` = '"+ req.body.user_id +"' AND `cart_category` = 'whislist'";
    }
    if(req.body.category == 'book' || req.body.category == 'book-videos'){
        var query  = "DELETE FROM `cart` WHERE `category` = '"+ req.body.category +"' AND `book_id` = '"+ req.body.id +"' AND `user_id` = '"+ req.body.user_id +"' AND `cart_category` = 'whislist'";
        console.log(query);
    } 
    pool.query(query,function(err,results,fields){
        if(err) {
            console.log(err);
            res.json({message:'Some error occured'});
        } else {
            res.json({message: 'success'});
        }
    });
});


router.post('/addtocart',function(req,res,next){
    if(req.body.category == 'product'){
        var query  = "INSERT INTO `cart` (`category`,`product_id`,`user_id`) VALUES ('"+ req.body.category +"','"+ req.body.id +"','"+ req.body.user_id +"')";
    }
    if(req.body.category == 'course'){
        var query  = "INSERT INTO `cart` (`category`,`course_id`,`user_id`) VALUES ('"+ req.body.category +"','"+ req.body.id +"','"+ req.body.user_id +"')";
    }
    if(req.body.category == 'book' || req.body.category == 'book-videos'){
        var query  = "INSERT INTO `cart` (`category`,`book_id`,`user_id`) VALUES ('"+ req.body.category +"','"+ req.body.id +"','"+ req.body.user_id +"')";
    } 
    pool.query(query,function(err,results,fields){
        if(err) {
            console.log(err);
            res.json({message:'Some error occured'});
        } else {
            res.json({message: 'success'});
        }
    });
});

router.post('/addproducttocart',function(req,res,next){
    // console.log(req.body);
    var query  = "INSERT INTO `cart` (`category`,`product_id`,`user_id`,`description`,`address`,`image_path`,`quantity`) VALUES ('"+ req.body.category +"','"+ req.body.id +"','"+ req.body.user_id +"','"+ req.body.description +"','"+ req.body.address +"','"+ req.body.image_path +"','"+ req.body.quantity +"')";
    pool.query(query,function(err,results,fields){
        if(err) {
            console.log(err);
            res.json({message:'Some error occured'});
        } else {
            res.json({message: 'success'});
        }
    });
});

router.post('/removefromcart',function(req,res,next){
    // console.log(req.body);
    if(req.body.category == 'product'){
        var query  = "DELETE FROM `cart` WHERE `category` = '"+ req.body.category +"' AND `product_id` = '"+ req.body.id +"' AND `user_id` = '"+ req.body.user_id +"' AND `cart_category` IS NULL";
    }
    if(req.body.category == 'course'){
        var query  = "DELETE FROM `cart` WHERE `category` = '"+ req.body.category +"' AND `course_id` = '"+ req.body.id +"' AND `user_id` = '"+ req.body.user_id +"' AND `cart_category` IS NULL";
    }
    if(req.body.category == 'book' || req.body.category == 'book-videos'){
        var query  = "DELETE FROM `cart` WHERE `category` = '"+ req.body.category +"' AND `book_id` = '"+ req.body.id +"' AND `user_id` = '"+ req.body.user_id +"' AND `cart_category` IS NULL";
    } 
    pool.query(query,function(err,results,fields){
        if(err) {
            console.log(err);
            res.json({message:'Some error occured'});
        } else {
            res.json({message: 'success'});
        }
    });
});

router.post('/applepaymentsucessfull',function(req,res,next){
    // console.log(req.body);
    if(parseInt(req.body.payment) < 200){
        var wallet = parseInt(req.body.payment) * 76.32;
    } else {
        var wallet = req.body.payment;
    }
    var query  = "UPDATE `users` SET `wallet` = `wallet` + '"+ wallet +"' WHERE `id` = '"+ req.body.id +"'";
    // console.log(query);
    pool.query(query,function(err,results,fields){
        if(err) {
            console.log(err);
            res.json({message:'some_error_occured'});
        } else {
            res.json({message: 'success'});
        }
    });
});

router.post('/updatecartquantity',function(req,res,next){
    // console.log(req.body);
    var query  = "UPDATE `cart` SET `quantity` = `quantity` + 1 WHERE `id` = '"+ req.body.id +"' AND `cart_category` IS NULL";
    // console.log(query);
    pool.query(query,function(err,results,fields){
        if(err) {
            console.log(err);
            res.json({message:'Some error occured'});
        } else {
            res.json({message: 'success'});
        }
    });
});

router.post('/subtractcartquantity',function(req,res,next){
    // console.log(req.body);
    var query  = "UPDATE `cart` SET `quantity` = `quantity` - 1 WHERE `id` = '"+ req.body.id +"' AND `cart_category` IS NULL";
    // console.log(query);
    pool.query(query,function(err,results,fields){
        if(err) {
            console.log(err);
            res.json({message:'Some error occured'});
        } else {
            res.json({message: 'success'});
        }
    });
});


router.get('/getUserDetails/:phoneNumber', function(req, res, next) {
    var query = "SELECT * FROM `users` WHERE `phone_number` = '"+ req.params.phoneNumber +"'";
    pool.query(query,function(err,results,fields){
        if(err) {
            console.log(err);
            res.json({message:'Some error occured'});
        } else {
            res.json({data: results});
        }
    });
});

router.post('/saveUserDetails/:phoneNumber', function(req, res, next) {
    var query = "UPDATE `users` SET `email_id` = '"+ req.body.email_id +"',`address` = '"+ req.body.address +"',`name` = '"+ req.body.name +"',`pincode` = '"+ req.body.pincode +"' WHERE `phone_number` = '"+ req.params.phoneNumber +"'";
    pool.query(query,function(err,results,fields){
        if(err) {
            console.log(err);
            res.json({message:'Some error occured'});
        } else {
            res.json({message: 'success'});
        }
    });
});

router.get('/getUserCart/:user_id', function(req, res, next) {
    var query = "SELECT c.*,CASE WHEN `category` = 'course' THEN (SELECT `title` FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT `name` FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' OR `category` = 'book-videos' THEN (SELECT `title` FROM `books` WHERE `books`.`id` = c.`book_id`) END AS name,CASE WHEN `category` = 'course' THEN (SELECT `category` FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT `category_id` FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' OR `category` = 'book-videos' THEN (SELECT `category` FROM `books` WHERE `books`.`id` = c.`book_id`) END AS item_category,CASE WHEN `category` = 'course' THEN (SELECT `discount_price` FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT `discount_price` FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' THEN (SELECT `discount_price` FROM `books` WHERE `books`.`id` = c.`book_id`) WHEN `category` = 'book-videos' THEN (SELECT `only_video_discount_price` FROM `books` WHERE `books`.`id` = c.`book_id`) END AS price,CASE WHEN `category` = 'course' THEN (SELECT (SELECT `path` FROM `images` WHERE `images`.`course_id` = `courses`.`id` AND `images`.`iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT (SELECT `path` FROM `images` WHERE `images`.`product_id` = `products`.`id` AND `images`.`iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' OR `category` = 'book-videos' THEN (SELECT (SELECT `path` FROM `images` WHERE `images`.`book_id` = `books`.`id` AND `images`.`iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `books` WHERE `books`.`id` = c.`book_id`) END AS image_path FROM `cart` c WHERE `user_id` = '"+ req.params.user_id +"' AND `cart_category` IS NULL";
    pool.query(query,function(err,results,fields){
        if(err) {
            console.log(err);
            res.json({message:'Some error occured'});
        } else {
            // console.log(results);
            res.json({data:results});
        }
    });
});


router.get('/getUserWhislist/:user_id', function(req, res, next) {
    var query = "SELECT c.*,CASE WHEN `category` = 'course' THEN (SELECT `title` FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT `name` FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' THEN (SELECT `title` FROM `books` WHERE `books`.`id` = c.`book_id`) END AS name,CASE WHEN `category` = 'course' THEN (SELECT `category` FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT `category_id` FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' THEN (SELECT `category` FROM `books` WHERE `books`.`id` = c.`book_id`) END AS item_category,CASE WHEN `category` = 'course' THEN (SELECT `discount_price` FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT `discount_price` FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' THEN (SELECT `discount_price` FROM `books` WHERE `books`.`id` = c.`book_id`) END AS price,CASE WHEN `category` = 'course' THEN (SELECT (SELECT `path` FROM `images` WHERE `images`.`course_id` = `courses`.`id` AND `images`.`iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT (SELECT `path` FROM `images` WHERE `images`.`product_id` = `products`.`id` AND `images`.`iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' THEN (SELECT (SELECT `path` FROM `images` WHERE `images`.`book_id` = `books`.`id` AND `images`.`iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `books` WHERE `books`.`id` = c.`book_id`) END AS image_path FROM `cart` c WHERE `user_id` = '"+ req.params.user_id +"' AND c.`cart_category` = 'whislist'";
    pool.query(query,function(err,results,fields){
        if(err) {
            console.log(err);
            res.json({message:'Some error occured'});
        } else {
            // console.log(results);
            res.json({data:results});
        }
    });
});


router.get('/getUserWhislist/:user_id/:offset', function(req, res, next) {
    var query = "SELECT c.*,CASE WHEN `category` = 'course' THEN (SELECT `title` FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT `name` FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' THEN (SELECT `title` FROM `books` WHERE `books`.`id` = c.`book_id`) END AS name,CASE WHEN `category` = 'course' THEN (SELECT `category` FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT `category_id` FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' THEN (SELECT `category` FROM `books` WHERE `books`.`id` = c.`book_id`) END AS item_category,CASE WHEN `category` = 'course' THEN (SELECT `discount_price` FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT `discount_price` FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' THEN (SELECT `discount_price` FROM `books` WHERE `books`.`id` = c.`book_id`) END AS price,CASE WHEN `category` = 'course' THEN (SELECT (SELECT `path` FROM `images` WHERE `images`.`course_id` = `courses`.`id` AND `images`.`iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT (SELECT `path` FROM `images` WHERE `images`.`product_id` = `products`.`id` AND `images`.`iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' THEN (SELECT (SELECT `path` FROM `images` WHERE `images`.`book_id` = `books`.`id` AND `images`.`iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `books` WHERE `books`.`id` = c.`book_id`) END AS image_path FROM `cart` c WHERE `user_id` = '"+ req.params.user_id +"' AND c.`cart_category` = 'whislist' LIMIT 20 OFFSET "+ req.params.offset +"";
    pool.query(query,function(err,results,fields){
        if(err) {
            console.log(err);
            res.json({message:'Some error occured'});
        } else {
            // console.log(results);
            res.json({data:results});
        }
    });
});


router.get('/getUserOrders/:user_id', function(req, res, next) {
    var query = "SELECT c.*,c.`image_path` AS order_image,CASE WHEN `category` = 'course' THEN (SELECT `title` FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT `name` FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' THEN (SELECT `title` FROM `books` WHERE `books`.`id` = c.`book_id`) END AS name,CASE WHEN `category` = 'course' THEN (SELECT `discount_price` FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT `discount_price` FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' THEN (SELECT `discount_price` FROM `books` WHERE `books`.`id` = c.`book_id`) END AS price,CASE WHEN `category` = 'course' THEN (SELECT (SELECT `path` FROM `images` WHERE `images`.`course_id` = `courses`.`id` AND `images`.`iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT (SELECT `path` FROM `images` WHERE `images`.`product_id` = `products`.`id` AND `images`.`iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' THEN (SELECT (SELECT `path` FROM `images` WHERE `images`.`book_id` = `books`.`id` AND `images`.`iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `books` WHERE `books`.`id` = c.`book_id`) END AS image_path FROM `orders` c WHERE `user_id` = '"+ req.params.user_id +"'";
    pool.query(query,function(err,results,fields){
        if(err) {
            console.log(err);
            res.json({message:'Some error occured'});
        } else {
            console.log(results);
            res.json({data:results});
        }
    });
});

router.get('/getUserCartByCategory/:category/:user_id', function(req, res, next) {
    var query = "SELECT c.*,CASE WHEN `category` = 'course' THEN (SELECT `title` FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT `name` FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' THEN (SELECT `title` FROM `books` WHERE `books`.`id` = c.`book_id`) END AS name,CASE WHEN `category` = 'course' THEN (SELECT `category` FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT `category_id` FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' THEN (SELECT `category` FROM `books` WHERE `books`.`id` = c.`book_id`) END AS item_category,CASE WHEN `category` = 'course' THEN (SELECT `discount_price` FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT `discount_price` FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' THEN (SELECT `discount_price` FROM `books` WHERE `books`.`id` = c.`book_id`) END AS price,CASE WHEN `category` = 'course' THEN (SELECT (SELECT `path` FROM `images` WHERE `images`.`course_id` = `courses`.`id` AND `images`.`iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT (SELECT `path` FROM `images` WHERE `images`.`product_id` = `products`.`id` AND `images`.`iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' THEN (SELECT (SELECT `path` FROM `images` WHERE `images`.`book_id` = `books`.`id` AND `images`.`iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `books` WHERE `books`.`id` = c.`book_id`) END AS image_path FROM `cart` c WHERE `user_id` = '"+ req.params.user_id +"' AND `category` = '"+ req.params.category +"'";
    pool.query(query,function(err,results,fields){
        if(err) {
            console.log(err);
            res.json({message:'Some error occured'});
        } else {
            // console.log(results);
            res.json({data:results});
        }
    });
});

router.get('/getUserCourses/:user_id', function(req, res, next) {
    var query = "SELECT c.*,`courses`.*,`courses`.`category` AS sub_category ,(SELECT `path` FROM `images` WHERE `images`.`course_id` = `courses`.`id` AND `images`.`iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path,(SELECT COUNT(*) FROM `cart` WHERE `cart`.`course_id` = `courses`.`id` AND `cart`.`user_id` = '"+ req.params.user_id +"') AS count FROM `subscription` c INNER JOIN `courses` ON `courses`.`id` = c.`course_id` WHERE c.`user_id` = '"+ req.params.user_id +"' AND c.`status` =  1";
    pool.query(query,function(err,results,fields){
        if(err) {
            console.log(err);
            res.json({message:'Some error occured'});
        } else {
            // console.log(results);
            res.json({data:results});
        }
    });
});

router.get('/getUserBooks/:user_id', function(req, res, next) {
    var query = "SELECT c.*,`books`.*,`books`.`category` AS sub_category ,(SELECT `path` FROM `images` WHERE `images`.`book_id` = `books`.`id` AND `images`.`iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path,(SELECT COUNT(*) FROM `cart` WHERE `cart`.`book_id` = `books`.`id` AND `cart`.`user_id` = '"+ req.params.user_id +"') AS count FROM `subscription` c INNER JOIN `books` ON `books`.`id` = c.`book_id` WHERE c.`user_id` = '"+ req.params.user_id +"' AND c.`status` =  1 AND c.`category` = 'book-videos'";
    pool.query(query,function(err,results,fields){
        if(err) {
            console.log(err);
            res.json({message:'Some error occured'});
        } else {
            // console.log(results);
            res.json({data:results});
        }
    });
});

router.get('/getCourseSubscription/:course_id/:user_id', function(req, res, next) {
    var query = "SELECT * FROM `subscription` WHERE `user_id` = '"+ req.params.user_id +"' AND `course_id` = '"+ req.params.course_id +"' AND `status` = 1 ORDER BY `id` DESC LIMIT 1 OFFSET 0";
    pool.query(query,function(err,results,fields){
        if(err) {
            console.log(err);
            res.json({message:'Some error occured'});
        } else {
            // console.log(results);
            res.json({data:results});
        }
    });
});

router.get('/getBookVideosSubscription/:book_id/:user_id', function(req, res, next) {
    var query = "SELECT * FROM `subscription` WHERE `user_id` = '"+ req.params.user_id +"' AND `book_id` = '"+ req.params.book_id +"' AND `category` = 'book-videos' AND `status` = 1 ORDER BY `id` DESC LIMIT 1 OFFSET 0";
    pool.query(query,function(err,results,fields){
        if(err) {
            console.log(err);
            res.json({message:'Some error occured'});
        } else {
            // console.log(results);
            res.json({data:results});
        }
    });
});

router.get('/getBookSubscription/:book_id/:user_id', function(req, res, next) {
    var query = "SELECT * FROM `subscription` WHERE `user_id` = '"+ req.params.user_id +"' AND `book_id` = '"+ req.params.book_id +"' AND `category` = 'book'";
    pool.query(query,function(err,results,fields){
        if(err) {
            console.log(err);
            res.json({message:'Some error occured'});
        } else {
            // console.log(results);
            res.json({data:results});
        }
    });
});

router.get('/updateBookSubscription/:book_id/:user_id', function(req, res, next) {
    var query = "UPDATE `subscription` SET `status` = 0 WHERE `user_id` = '"+ req.params.user_id +"' AND `book_id` = '"+ req.params.book_id +"' AND `category` = 'book'";
    pool.query(query,function(err,results,fields){
        if(err) {
            console.log(err);
            res.json({message:'Some error occured'});
        } else {
            // console.log(results);
            res.json({message:'success'});
        }
    });
});

router.get('/updateBookVideosSubscription/:book_id/:user_id', function(req, res, next) {
    var query = "UPDATE `subscription` SET `status` = 0 WHERE `user_id` = '"+ req.params.user_id +"' AND `book_id` = '"+ req.params.book_id +"' AND `category` = 'book-videos'";
    pool.query(query,function(err,results,fields){
        if(err) {
            console.log(err);
            res.json({message:'Some error occured'});
        } else {
            // console.log(results);
            res.json({message:'success'});
        }
    });
});

router.get('/updateCourseSubscription/:course_id/:user_id', function(req, res, next) {
    var query2 = "SELECT DATEDIFF(end_date, CURRENT_TIMESTAMP()) AS days FROM `subscription` WHERE `user_id` = '"+ req.params.user_id +"' AND `course_id` = '"+ req.params.course_id +"' AND `status` = 1";
    pool.query(query2,function(err,query2,fields){
        if(err) {
            console.log(err);
            res.json({message:'Some error occured'});
        } else {
            if(query2.length != 0){
                if(query2[0].days == 0){
                    var query = "UPDATE `subscription` SET `status` = 0 WHERE `user_id` = '"+ req.params.user_id +"' AND `course_id` = '"+ req.params.course_id +"'";
                    pool.query(query,function(err,results,fields){
                        if(err) {
                            console.log(err);
                            res.json({message:'Some error occured'});
                        } else {
                            // console.log(results);
                            res.json({message:'success'});
                        }
                    });
                } else {
                    res.json({message:'success'});
                }
            } else {
                // console.log(results);
                res.json({message:'success'});
            }
        }
    });
});


module.exports = router;