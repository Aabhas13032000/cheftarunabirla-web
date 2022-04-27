const express = require('express');
const router = express.Router();
const pool = require('../database/connection');

// //Api home route
// router.get('/', (req, res) => {
//     res.json({message:'home'});
// });

// function authentication(req, res, next) {
//     var authheader = req.headers.authorization;
//     console.log(req.headers);
 
//     if (!authheader) {
//         var err = new Error('You are not authenticated!');
//         res.setHeader('WWW-Authenticate', 'Basic');
//         err.status = 401;
//         return next(err)
//     }
 
//     var auth = new Buffer.from(authheader.split(' ')[1],
//     'base64').toString().split(':');
//     var user = auth[0];
//     var pass = auth[1];
 
//     if (user == 'admin' && pass == 'password') {
 
//         // If Authorized user
//         next();
//     } else {
//         var err = new Error('You are not authenticated!');
//         res.setHeader('WWW-Authenticate', 'Basic');
//         err.status = 401;
//         return next(err);
//     }
 
// }
 
// router.use(authentication);

//Api App_data
router.post('/app_data',(req,res) => {
    // console.log(req.body.token);
    const user = "SELECT * FROM `users` WHERE `device_id` = '"+ req.body.token +"'";
    const product_categories = "SELECT * FROM `product_categories` WHERE `status` = 1";
    const social_links = "SELECT * FROM `social_links` WHERE `status` = 1";
    const course_categories = "SELECT * FROM `course_categories` WHERE `status` = 1 ORDER BY `order` ASC";
    const check_user = "SELECT * FROM `admin` LIMIT 1 OFFSET 0";
    const impBooks = "SELECT c.*, (SELECT `path` FROM `images` WHERE `images`.`book_id` = c.`id` LIMIT 1 OFFSET 0) AS image_path FROM `books` c WHERE `status` = 1 AND `imp` = 1 LIMIT 2 OFFSET 0";
    const slider = "SELECT * FROM `slider` WHERE `status` = 1 AND `show_category` = 'all' ORDER BY `date` DESC";
    const gallery  = "SELECT * FROM `gallery` ORDER BY `date` DESC LIMIT 3 OFFSET 0";
    const testimonial = "SELECT * FROM `testimonials` WHERE `imp` = '1' AND `status` = 1";
    pool.query(user,function(err,user,fields){
        if(err) {
            console.log(err);
            res.json({
                app_data:[],
                message:'Database_connection_error',
                user:[],
                cart: [],
                product_categories:[],
                course_categories:[],
                impBooks:[],
                slider:[],
                featured_courses:[],
                featured_products:[],
                social_links:[],
                gallery:[],
                testimonial:[],
            });
        } else {
            if(user.length !=0){
                var cart = "SELECT * FROM `cart` WHERE `user_id` = '"+ user[0].id +"'";
                // const user_course_subscription = "SELECT c.*,`courses`.*,`courses`.`category` AS sub_category ,(SELECT `path` FROM `images` WHERE `images`.`course_id` = `courses`.`id` AND `images`.`iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `subscription` c INNER JOIN `courses` ON `courses`.`id` = c.`course_id` WHERE c.`user_id` = '"+ user[0].id +"' AND c.`status` =  1";
                // const user_book_subscription = "SELECT c.*,`books`.*,`books`.`category` AS sub_category ,(SELECT `path` FROM `images` WHERE `images`.`book_id` = `books`.`id` AND `images`.`iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `subscription` c INNER JOIN `books` ON `books`.`id` = c.`book_id` WHERE c.`user_id` = '"+ user[0].id +"' AND c.`status` =  1";
                const featured_courses = "SELECT c.* , (SELECT `path` FROM `images` WHERE `images`.`course_id` = c.`id` AND `iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path ,(SELECT COUNT(*) FROM `subscription` WHERE `subscription`.`course_id` = c.`id` AND `subscription`.`user_id` = '"+ user[0].id +"' AND `status` = 1) AS subscribed FROM `courses` c WHERE `status` = 1 AND `featured` = 1 ORDER BY `created_at` DESC LIMIT 4 OFFSET 0";
                const featured_products = "SELECT p.* , c.`name` AS c_name, (SELECT `path` FROM `images` WHERE `images`.`product_id` = p.`id` LIMIT 1 OFFSET 0) AS image_path , (SELECT COUNT(*) FROM `cart` WHERE `cart`.`product_id` = p.`id` AND `cart`.`user_id` = '"+ user[0].id +"') AS count,(SELECT COUNT(*) FROM `cart` WHERE `cart`.`course_id` = c.`id` AND `cart`.`cart_category` = 'whislist' AND `cart`.`user_id` = '"+ user[0].id +"') AS whislistcount FROM `products` p INNER JOIN `product_categories` c ON c.`id` = p.`category_id` WHERE p.`status` = 1 AND p.`featured` = 1 ORDER BY p.`created_at` DESC LIMIT 4 OFFSET 0";
                pool.query(cart,function(err,cart,fields){
                    pool.query(product_categories,function(err,product_categories,fields){
                        pool.query(course_categories,function(err,course_categories,fields){
                            pool.query(check_user,function(err,check_user){
                                pool.query(impBooks,function(err,impBooks){
                                    pool.query(slider,function(err,slider,fields){
                                        pool.query(featured_courses,function(err,featured_courses,fields){
                                            pool.query(featured_products,function(err,featured_products,fields){
                                                pool.query(social_links,function(err,social_links,fields){
                                                    pool.query(gallery,function(err,gallery,fields){
                                                        pool.query(testimonial,function(err,testimonial,fields){
                                                            if(err) {
                                                                console.log(err);
                                                                res.json({
                                                                    app_data:[],
                                                                    message:'Database_connection_error',
                                                                    user:[],
                                                                    cart: [],
                                                                    product_categories:[],
                                                                    course_categories:[],
                                                                    impBooks:[],
                                                                    slider:[],
                                                                    featured_courses:[],
                                                                    featured_products:[],
                                                                    social_links:[],
                                                                    gallery:[],
                                                                    testimonial:[],
                                                                });
                                                            } else {
                                                                res.json({
                                                                    app_data:check_user,
                                                                    message:'User_Authenticated_successfully',
                                                                    cart: cart,
                                                                    product_categories:product_categories,
                                                                    course_categories:course_categories,
                                                                    user:user,
                                                                    impBooks:impBooks,
                                                                    slider:slider,
                                                                    featured_courses:featured_courses,
                                                                    featured_products:featured_products,
                                                                    social_links:social_links,
                                                                    gallery:gallery,
                                                                    testimonial:testimonial
                                                                });
                                                            }
                                                        });
                                                    });
                                                });
                                            });    
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            } else {
                const insertUser  = "INSERT INTO `users` (`device_id`) VALUES ('"+ req.body.token +"')";
                pool.query(insertUser,function(err,insertUser,fields){
                    if(err) {
                        console.log(err);
                        res.json({
                            app_data:[],
                            message:'Database_connection_error',
                            user:[],
                            cart: [],
                            product_categories:[],
                            course_categories:[],
                            impBooks:[],
                            slider:[],
                            featured_courses:[],
                            featured_products:[],
                            social_links:[],
                            gallery:[],
                            testimonial:[],
                        });
                    } else {
                        const featured_courses = "SELECT c.* , (SELECT `path` FROM `images` WHERE `images`.`course_id` = c.`id` AND `iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path ,(SELECT COUNT(*) FROM `cart` WHERE `cart`.`course_id` = c.`id` AND `cart`.`user_id` = '"+ insertUser.insertId +"') AS count,(SELECT COUNT(*) FROM `subscription` WHERE `subscription`.`course_id` = c.`id` AND `subscription`.`user_id` = '"+ insertUser.insertId +"' AND `status` = 1) AS subscribed FROM `courses` c WHERE `status` = 1 AND `featured` = 1 ORDER BY `created_at` DESC LIMIT 4 OFFSET 0";
                        const featured_products = "SELECT p.* , c.`name` AS c_name, (SELECT `path` FROM `images` WHERE `images`.`product_id` = p.`id` LIMIT 1 OFFSET 0) AS image_path , (SELECT COUNT(*) FROM `cart` WHERE `cart`.`product_id` = p.`id` AND `cart`.`user_id` = '"+ insertUser.insertId +"') AS count FROM `products` p INNER JOIN `product_categories` c ON c.`id` = p.`category_id` WHERE p.`status` = 1 AND p.`featured` = 1 ORDER BY p.`created_at` DESC LIMIT 4 OFFSET 0";
                        // console.log(results1);
                        pool.query(product_categories,function(err,product_categories,fields){
                            pool.query(course_categories,function(err,course_categories,fields){
                                pool.query(check_user,function(err,check_user){
                                    pool.query(impBooks,function(err,impBooks){
                                        pool.query(slider,function(err,slider,fields){
                                            pool.query(featured_courses,function(err,featured_courses,fields){
                                                pool.query(featured_products,function(err,featured_products,fields){
                                                    pool.query(social_links,function(err,social_links,fields){
                                                        pool.query(gallery,function(err,gallery,fields){
                                                            pool.query(testimonial,function(err,testimonial,fields){
                                                                if(err) {
                                                                    console.log(err);
                                                                    res.json({
                                                                        app_data:[],
                                                                        message:'Database_connection_error',
                                                                        user:[],
                                                                        cart: [],
                                                                        product_categories:[],
                                                                        course_categories:[],
                                                                        user_course_subscription:[],
                                                                        user_book_subscription:[],
                                                                        impBooks:[],
                                                                        slider:[],
                                                                        featured_courses:[],
                                                                        featured_products:[],
                                                                        social_links:[],
                                                                        gallery:[],
                                                                        testimonial:[],
                                                                    });
                                                                } else {
                                                                    res.json({
                                                                        app_data:check_user,
                                                                        message:'User_created_successfully',
                                                                        cart: [],
                                                                        product_categories:product_categories,
                                                                        course_categories:course_categories,
                                                                        user:[
                                                                            {
                                                                                id: insertUser.insertId,
                                                                                phone_number: null,
                                                                                name: null,
                                                                                email_id: null,
                                                                                address: null,
                                                                                pincode: null,
                                                                                country: null,
                                                                                state: null,
                                                                                city: null,
                                                                                device_id: req.body.token,
                                                                                created_at: "2022-02-21T19:12:50.000Z",
                                                                                status: 1,
                                                                                logged_in: 0,
                                                                                wallet: 0,
                                                                                points: 0,
                                                                                verified: 0
                                                                            }
                                                                        ],
                                                                        impBooks:impBooks,
                                                                        slider:slider,
                                                                        featured_courses:featured_courses,
                                                                        featured_products:featured_products,
                                                                        social_links:social_links,
                                                                        gallery:gallery,
                                                                        testimonial:testimonial
                                                                    });
                                                                }
                                                            });
                                                        });
                                                    });
                                                });    
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    }
                });
            }
        }
    });
});

module.exports = router;