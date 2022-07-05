const express = require('express');
const router = express.Router();
const pool = require('../database/connection');

//Firebase dynamic links
const { FirebaseDynamicLinks } = require('firebase-dynamic-links');
const firebaseDynamicLinks = new FirebaseDynamicLinks('AIzaSyDBV0qQlbjCyFbLEsc2BicaHHXqoN6tCqE');

//Create Dynamic Link
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

/* Get courses by category */
router.get('/getCoursesByCategory', function(req, res, next) {
    if(req.headers.token){
        var data = req.query;
        if(data.category) {
            var totalcourses = "SELECT COUNT(*) AS total FROM `courses` WHERE `status` = 1 AND `category` = '"+ data.category +"'";
            if(data.offset){
                var courses = "SELECT c.*,(SELECT DATEDIFF(end_date,CURRENT_TIMESTAMP) FROM `subscription` INNER JOIN `users` ON `users`.`id` = `subscription`.`user_id` WHERE `users`.`id` = '"+ data.user_id +"' AND `subscription`.`course_id` = c.`id` AND `subscription`.`status` = 1 ORDER BY `subscription`.`id` DESC LIMIT 1 OFFSET 0) AS subscribeddays,(SELECT `path` FROM `images` WHERE `images`.`course_id` = c.`id` AND `iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `courses` c WHERE `status` = 1 AND `category` = '"+ data.category +"' ORDER BY `created_at` DESC LIMIT 20 OFFSET "+ data.offset +"";
            } else {
                var courses = "SELECT c.*,(SELECT DATEDIFF(end_date,CURRENT_TIMESTAMP) FROM `subscription` INNER JOIN `users` ON `users`.`id` = `subscription`.`user_id` WHERE `users`.`id` = '"+ data.user_id +"' AND `subscription`.`course_id` = c.`id` AND `subscription`.`status` = 1 ORDER BY `subscription`.`id` DESC LIMIT 1 OFFSET 0) AS subscribeddays,(SELECT `path` FROM `images` WHERE `images`.`course_id` = c.`id` AND `iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `courses` c WHERE `status` = 1 AND `category` = '"+ data.category +"' ORDER BY `created_at`";
            }
        } else {
            var totalcourses = "SELECT COUNT(*) AS total FROM `courses` WHERE `status` = 1";
            if(data.offset){
                var courses = "SELECT c.*,(SELECT DATEDIFF(end_date,CURRENT_TIMESTAMP) FROM `subscription` INNER JOIN `users` ON `users`.`id` = `subscription`.`user_id` WHERE `users`.`id` = '"+ data.user_id +"' AND `subscription`.`course_id` = c.`id` AND `subscription`.`status` = 1 ORDER BY `subscription`.`id` DESC LIMIT 1 OFFSET 0) AS subscribeddays,(SELECT `path` FROM `images` WHERE `images`.`course_id` = c.`id` AND `iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `courses` c WHERE `status` = 1 ORDER BY `created_at` DESC LIMIT 20 OFFSET "+ data.offset +"";
            } else {
                var courses = "SELECT c.*,(SELECT DATEDIFF(end_date,CURRENT_TIMESTAMP) FROM `subscription` INNER JOIN `users` ON `users`.`id` = `subscription`.`user_id` WHERE `users`.`id` = '"+ data.user_id +"' AND `subscription`.`course_id` = c.`id` AND `subscription`.`status` = 1 ORDER BY `subscription`.`id` DESC LIMIT 1 OFFSET 0) AS subscribeddays,(SELECT `path` FROM `images` WHERE `images`.`course_id` = c.`id` AND `iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `courses` c WHERE `status` = 1 ORDER BY `created_at`";
            }
        }
        pool.query(totalcourses,function(err,totalcourses){
            pool.query(courses,function(err,courses){
                if(err) {
                    console.log(err);
                    res.json({
                        message : 'some_error_occurred',
                    });
                } else {
                    res.json({
                        message : 'success',
                        total:totalcourses[0].total,
                        meta: {
                            total:totalcourses[0].total,
                            offset:data.offset,
                            totalitems:courses.length,
                        },
                        courses: courses,
                    })
                }
            });
        });
    } else {
        res.json({
            message : 'Auth_token_failure',
        });
    }
});

/* Get searched courses */
router.get('/getSearchedCourse/:value', function(req, res, next) {
    if(req.headers.token){
        var data = req.query;
        var courses = "SELECT c.*,(SELECT DATEDIFF(end_date,CURRENT_TIMESTAMP) FROM `subscription` INNER JOIN `users` ON `users`.`id` = `subscription`.`user_id` WHERE `users`.`id` = '"+ data.user_id +"' AND `subscription`.`course_id` = c.`id` AND `subscription`.`status` = 1 ORDER BY `subscription`.`id` DESC LIMIT 1 OFFSET 0) AS subscribeddays,(SELECT `path` FROM `images` WHERE `images`.`course_id` = c.`id` AND `iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `courses` c WHERE `status` = 1 AND `title` LIKE '%"+ req.params.value +"%' ORDER BY `created_at` DESC";
        pool.query(courses,function(err,courses){
            if(err) {
                console.log(err);
                res.json({
                    message : 'some_error_occurred',
                });
            } else {
                res.json({
                    message : 'success',
                    courses: courses,
                })
            }
        });
    } else {
        res.json({
            message : 'Auth_token_failure',
        });
    }
});

/* Get each course */
router.get('/getEachCourse', function(req, res, next) {
    if(req.headers.token){
        var data = req.query;
        var share_url = '';
        if(data.course_id){
            var subscription = "SELECT DATEDIFF(end_date,CURRENT_TIMESTAMP) AS subscribeddays,`subscription`.`status`,`subscription`.`id` AS subscription_id FROM `subscription` INNER JOIN `users` ON `users`.`id` = `subscription`.`user_id` WHERE `users`.`id` = '"+ data.user_id +"' AND `subscription`.`course_id` = '"+ data.course_id +"' ORDER BY `subscription`.`id` DESC LIMIT 1 OFFSET 0";
            var videos = "SELECT `name`,`path`,`is_full_screen` FROM `images` WHERE `course_id` = '"+ data.course_id +"' AND `iv_category` = 'video' ORDER BY `name`";
            var pdf = "SELECT `pdflink` FROM `recipies` WHERE `course_id` = '"+ data.course_id +"'";
            var course = "SELECT *, (SELECT `path` FROM `images` WHERE `images`.`course_id` = `courses`.`id` AND `iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path , (SELECT COUNT(*) FROM `cart` WHERE `cart_category` IS NULL AND `course_id` = '"+ data.course_id +"') AS cartcount FROM `courses` WHERE `status` = 1 AND `id` = '"+ data.course_id +"'";
            pool.query(course,function(err,course){
                pool.query(subscription,function(err,subscription){
                    pool.query(videos,function(err,videos){
                        pool.query(pdf,function(err,pdf){
                            if(course[0].share_url == null || course[0].share_url.length == 0){
                                console.log('share url is empty');
                                createDynamicLink(`https://dashboard.cheftarunabirla.com/courses_api/getEachCourse?course_id=${data.course_id}`).then((result) => {
                                    course[0].share_url = result;
                                    var updateShareUrl = "UPDATE `courses` SET `share_url` = '"+ result +"' WHERE `id` = '"+ data.course_id +"'";
                                    pool.query(updateShareUrl,function(err,updateShareUrl){
                                        if(err){
                                            console.log(err);
                                            res.json({
                                                message : 'some_error_occurred',
                                            });
                                        } else {
                                            if(subscription[0]){
                                                if(subscription[0].subscribeddays <= 0) {
                                                    if(subscription[0].status == 1) {
                                                        var updateStatus = "UPDATE `subscription` SET `status` = 0 WHERE `id` = '"+ subscription[0].subscription_id +"'";
                                                        pool.query(updateStatus,function(err,updateStatus){
                                                            res.json({
                                                                message : 'no_subscription_available',
                                                                course: course,
                                                                pdf: pdf,
                                                                videos:videos,
                                                                subscribeddays : 0,
                                                                issubscribed: course[0].category == 'free' ? true : false,
                                                                show_popup:true,
                                                                shareText: `${course[0].title} Watch promo here ${course[0].promo_video} \n\n to explore more courses click on the link given below\n\n👇\n\n${course[0].share_url}}`
                                                            });
                                                        });
                                                    } else {
                                                        res.json({
                                                            message : 'no_subscription_available',
                                                            course: course,
                                                            pdf: pdf,
                                                            videos:videos,
                                                            subscribeddays : 0,
                                                            issubscribed: course[0].category == 'free' ? true : false,
                                                            show_popup:false,
                                                            shareText: `${course[0].title} Watch promo here ${course[0].promo_video} \n\n to explore more courses click on the link given below\n\n👇\n\n${course[0].share_url}}`
                                                        });
                                                    }
                                                } else {
                                                    if(subscription[0].status == 1) {
                                                        res.json({
                                                            message : 'subscription_available',
                                                            course: course,
                                                            pdf: pdf,
                                                            videos:videos,
                                                            subscribeddays : subscription[0].subscribeddays,
                                                            issubscribed: true,
                                                            show_popup:false,
                                                            shareText: `${course[0].title} Watch promo here ${course[0].promo_video} \n\n to explore more courses click on the link given below\n\n👇\n\n${course[0].share_url}}`
                                                        });
                                                    } else {
                                                        var updateStatus = "UPDATE `subscription` SET `status` = 1 WHERE `id` = '"+ subscription[0].subscription_id +"'";
                                                        pool.query(updateStatus,function(err,updateStatus){
                                                            res.json({
                                                                message : 'subscription_available',
                                                                course: course,
                                                                pdf: pdf,
                                                                videos:videos,
                                                                subscribeddays : subscription[0].subscribeddays,
                                                                issubscribed: true,
                                                                show_popup:false,
                                                                shareText: `${course[0].title} Watch promo here ${course[0].promo_video} \n\n to explore more courses click on the link given below\n\n👇\n\n${course[0].share_url}}`
                                                            });
                                                        });
                                                    }
                                                }
                                            } else {
                                                res.json({
                                                    message : 'no_subscription_available',
                                                    course: course,
                                                    pdf: pdf,
                                                    videos:videos,
                                                    subscribeddays : 0,
                                                    issubscribed: course[0].category == 'free' ? true : false,
                                                    show_popup:false,
                                                    shareText: `${course[0].title} Watch promo here ${course[0].promo_video} \n\n to explore more courses click on the link given below\n\n👇\n\n${course[0].share_url}}`
                                                });
                                            }
                                        }          
                                    });
                                }).catch((err) => {
                                    console.log(err);
                                });
                            } else {
                                if(subscription[0]){
                                    if(subscription[0].subscribeddays <= 0) {
                                        if(subscription[0].status == 1) {
                                            var updateStatus = "UPDATE `subscription` SET `status` = 0 WHERE `id` = '"+ subscription[0].subscription_id +"'";
                                            pool.query(updateStatus,function(err,updateStatus){
                                                res.json({
                                                    message : 'no_subscription_available',
                                                    course: course,
                                                    pdf: pdf,
                                                    videos:videos,
                                                    subscribeddays : 1,
                                                    issubscribed: course[0].category == 'free' ? true : false,
                                                    show_popup:true,
                                                    shareText: `${course[0].title} Watch promo here ${course[0].promo_video} \n\n to explore more courses click on the link given below\n\n👇\n\n${course[0].share_url}}`
                                                });
                                            });
                                        } else {
                                            res.json({
                                                message : 'no_subscription_available',
                                                course: course,
                                                pdf: pdf,
                                                videos:videos,
                                                subscribeddays : 0,
                                                issubscribed: course[0].category == 'free' ? true : false,
                                                show_popup:false,
                                                shareText: `${course[0].title} Watch promo here ${course[0].promo_video} \n\n to explore more courses click on the link given below\n\n👇\n\n${course[0].share_url}}`
                                            });
                                        }
                                    } else {
                                        if(subscription[0].status == 1) {
                                            res.json({
                                                message : 'subscription_available',
                                                course: course,
                                                pdf: pdf,
                                                videos:videos,
                                                subscribeddays : subscription[0].subscribeddays,
                                                issubscribed: true,
                                                show_popup:false,
                                                shareText: `${course[0].title} Watch promo here ${course[0].promo_video} \n\n to explore more courses click on the link given below\n\n👇\n\n${course[0].share_url}}`
                                            });
                                        } else {
                                            var updateStatus = "UPDATE `subscription` SET `status` = 1 WHERE `id` = '"+ subscription[0].subscription_id +"'";
                                            pool.query(updateStatus,function(err,updateStatus){
                                                res.json({
                                                    message : 'subscription_available',
                                                    course: course,
                                                    pdf: pdf,
                                                    videos:videos,
                                                    subscribeddays : subscription[0].subscribeddays,
                                                    issubscribed: true,
                                                    show_popup:false,
                                                    shareText: `${course[0].title} Watch promo here ${course[0].promo_video} \n\n to explore more courses click on the link given below\n\n👇\n\n${course[0].share_url}}`
                                                });
                                            });
                                        }
                                    }
                                } else {
                                    res.json({
                                        message : 'no_subscription_available',
                                        course: course,
                                        pdf: pdf,
                                        videos:videos,
                                        subscribeddays : 0,
                                        issubscribed: course[0].category == 'free' ? true : false,
                                        show_popup:false,
                                        shareText: `${course[0].title} Watch promo here ${course[0].promo_video} \n\n to explore more courses click on the link given below\n\n👇\n\n${course[0].share_url}}`
                                    });
                                }
                            }
                        });
                    });
                });
            });
        } else {
            res.json({
                message : 'some_error_occurred',
            });
        }
    } else {
        res.json({
            message : 'Auth_token_failure',
        });
    }
});

//Add Course to cart
router.post('/addtocart',function(req,res,next){
    if(req.headers.token){
        var query  = "INSERT INTO `cart` (`category`,`course_id`,`user_id`) VALUES ('course','"+ req.body.id +"','"+ req.body.user_id +"')";
        pool.query(query,function(err,results,fields){
            if(err) {
                console.log(err);
                res.json({message:'Some error occured'});
            } else {
                res.json({message: 'success'});
            }
        });
    } else {
        res.json({
            message : 'Auth_token_failure',
        });
    }
});


//Add Course to cart
router.post('/addToCart',function(req,res,next){
    if(req.headers.token){
        var query  = "INSERT INTO `cart` (`category`,`course_id`,`user_id`) VALUES ('course','"+ req.body.id +"','"+ req.body.user_id +"')";
        pool.query(query,function(err,results,fields){
            if(err) {
                console.log(err);
                res.json({message:'Some error occured'});
            } else {
                res.json({message: 'success'});
            }
        });
    } else {
        res.json({
            message : 'Auth_token_failure',
        });
    }
});

//Add Course to whislist
router.post('/addToWhislist',function(req,res,next){
    if(req.headers.token){
        var query  = "INSERT INTO `cart` (`category`,`course_id`,`user_id`,`cart_category`) VALUES ('course','"+ req.body.id +"','"+ req.body.user_id +"','whislist')";
        pool.query(query,function(err,results,fields){
            if(err) {
                console.log(err);
                res.json({message:'Some error occured'});
            } else {
                res.json({message: 'success'});
            }
        });
    } else {
        res.json({
            message : 'Auth_token_failure',
        });
    }
});

//Remove Course from cart
router.post('/removeFromCart',function(req,res,next){
    if(req.headers.token){
        var query  = "DELETE FROM `cart` WHERE `category` = 'course' AND `course_id` = '"+ req.body.id +"' AND `user_id` = '"+ req.body.user_id +"' AND `cart_category` IS NULL";
        pool.query(query,function(err,results,fields){
            if(err) {
                console.log(err);
                res.json({message:'Some error occured'});
            } else {
                res.json({message: 'success'});
            }
        });
    } else {
        res.json({
            message : 'Auth_token_failure',
        });
    }
});

//Remove Course from whislist
router.post('/removeFromWhislist',function(req,res,next){
    if(req.headers.token){
        var query  = "DELETE FROM `cart` WHERE `category` = 'course' AND `course_id` = '"+ req.body.id +"' AND `user_id` = '"+ req.body.user_id +"' AND `cart_category` = 'whislist'";
        pool.query(query,function(err,results,fields){
            if(err) {
                console.log(err);
                res.json({message:'Some error occured'});
            } else {
                res.json({message: 'success'});
            }
        });
    } else {
        res.json({
            message : 'Auth_token_failure',
        });
    }
});

module.exports = router;