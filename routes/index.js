const express = require('express');
const router = express.Router();
const { sign,verify } = require('jsonwebtoken');
const accessTokenSecret = 'youraccesstokensecret';
const multer = require('multer');
const sharp = require("sharp");
const fs =  require('fs');
const pool = require('../database/connection');
var gplay = require('google-play-scraper');
const Razorpay = require('razorpay');
const path = require('path');

const fileStorageEngine = multer.diskStorage({
  destination: (req,file,callback) => {
    callback(null,'public/images/all');
  },
  filename : (req,file,callback) => {
    callback(null,Date.now() + '--' + file.originalname)
  }
});

const upload = multer({
  storage : fileStorageEngine,
  // limits: {fileSize: maxSize}
});

const controllers = require('../controllers/controllers');

//Firebase dynamic links
const { FirebaseDynamicLinks } = require('firebase-dynamic-links');
const firebaseDynamicLinks = new FirebaseDynamicLinks('AIzaSyDBV0qQlbjCyFbLEsc2BicaHHXqoN6tCqE');

var admin = require("firebase-admin");
var serviceAccount = require("../credentials/serviceAccountKey.json");

/* Firebase option intialise */
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

/* Notification Options */
const notification_options = {
  priority: "high",
  timeToLive: 60 * 60 * 24
};

/* GET home page. */
router.get('/', function(req, res, next) {
  // console.log(req.session);
  req.session.token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluQGV4YW1wbGUuY29tIiwicGFzc3dvcmQiOiJSb2hhbkAwMDciLCJ1c2VyX2lkIjoxLCJpYXQiOjE2Mzk4MjExNzl9.f0UWbPBaLSaaKBxPaxcNOQCqVhTVEdQM9S65r7FI2eo';
  if(req.session.token){
    verify(req.session.token,accessTokenSecret,(err,decoded) => {
      console.log(err);
      console.log(decoded);
      res.render('index');
    });
  } else {
    if(req.query.error){
      res.render('components/login/login',{
        message: req.query.error,
        message_class:'alert-danger'
      });
    } else {
      res.render('components/login/login',{
        message:'You are logged out, Please Login again!!',
        message_class:'alert-warning'
      });
    }
  }
});


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
  return {
      shortLink:shortLink,
      previewLink:previewLink
  };
}

//send notification
router.post('/sendNotification', function(req, res, next) {
  var title = req.body.title;
  var description = req.body.description;
  var url = req.body.share_url;
  var sql = "SELECT * FROM `users` WHERE LENGTH(`device_id`) > 30";
  var registration_ids = [];
  if(url.length == 0){
      createDynamicLink(req.body.link).then((result) => {
          if(req.body.type == 'product'){
              var sql1 = "UPDATE `products` SET `share_url` = '"+ result.shortLink +"' WHERE `id` = '"+ req.body.item_id +"'";
          } else if(req.body.type == 'course'){
              var sql1 = "UPDATE `courses` SET `share_url` = '"+ result.shortLink +"' WHERE `id` = '"+ req.body.item_id +"'";
          } else if(req.body.type == 'live'){
            var sql1 = "UPDATE `live` SET `share_url` = '"+ result.shortLink +"' WHERE `id` = '"+ req.body.item_id +"'";
          } else if(req.body.type == 'book'){
            var sql1 = "UPDATE `books` SET `share_url` = '"+ result.shortLink +"' WHERE `id` = '"+ req.body.item_id +"'";
          }
          mysqlconnection.query(sql1,function(err,data1){
              if(err) {
                  console.log(err);
                  res.jsonp({message:'failed'});
              } else {
                  mysqlconnection.query(sql,function(err,data){
                      if(data.length !=0) {
                          if(Math.ceil(data.length/500) > 1){
                              var number_of_times = 0;
                              check_counter(number_of_times);
                                 function check_counter(counter1){
                                     console.log(counter1);
                                   if(counter1 == Math.ceil(data.length/500)){
                                      res.jsonp({message:'success'});
                                   } else {
                                      setTimeout(function() {
                                          console.log(number_of_times);
                                          if(number_of_times<=Math.ceil(data.length/500)){
                                              registration_ids = [];
                                              for(var j=(number_of_times*500);j<((number_of_times+1)*500);j++){
                                                  if(data[j]!=undefined){
                                                      registration_ids.push(data[j].device_id);
                                                  }
                                              }
                                              var message = {
                                                  tokens: registration_ids,
                                                  notification: {
                                                      title: title,
                                                      body: description
                                                  },
                                                  android: {
                                                      notification: {
                                                        imageUrl: req.body.image
                                                      }
                                                  },
                                                  options: notification_options,
                                                  data : {
                                                      openURL : req.body.link
                                                  }
                                              };
                                  
                                              admin.messaging().sendMulticast(message).then((response) => {
                                                  console.log( response.successCount +' successfull');
                                                  console.log( response.failureCount +' not successfull');
                                                  number_of_times++;
                                                  check_counter(number_of_times);
                                              }).catch((err) => {
                                                  console.log(err);
                                                  res.jsonp({message:'failed'});
                                              })
                                          }
                                      }, 1000 * (number_of_times+1));
                                   }
                                 }
                          } else {
                              for (var i = 0; i < data.length; i++) {
                                  registration_ids.push(data[i].device_id);
                              }
                              var message = {
                                  tokens: registration_ids,
                                  notification: {
                                      title: title,
                                      body: description
                                  },
                                  android: {
                                      notification: {
                                        imageUrl: req.body.image
                                      }
                                  },
                                  data : {
                                      openURL : req.body.link
                                  },
                                  options: notification_options
                              };
                  
                              admin.messaging().sendMulticast(message).then((response) => {
                                  console.log( response.successCount +' successfull');
                                  console.log( response.failureCount +' not successfull');
                                  res.jsonp({message:'success'});
                              }).catch((err) => {
                                  console.log(err);
                                  res.jsonp({message:'failed'});
                              })
                          }
                      }
                  });
              }
          });
      }).catch((err) => {
          console.log(err);
      })
  } else {
      mysqlconnection.query(sql,function(err,data){
          if(data.length !=0) {
              if(Math.ceil(data.length/500) > 1){
                  var number_of_times = 0;
                  check_counter(number_of_times);
                     function check_counter(counter1){
                         console.log(counter1);
                       if(counter1 == Math.ceil(data.length/500)){
                          res.jsonp({message:'success'});
                       } else {
                          setTimeout(function() {
                              console.log(number_of_times);
                              if(number_of_times<=Math.ceil(data.length/500)){
                                  registration_ids = [];
                                  for(var j=(number_of_times*500);j<((number_of_times+1)*500);j++){
                                      if(data[j]!=undefined){
                                          registration_ids.push(data[j].device_id);
                                      }
                                  }
                                  var message = {
                                      tokens: registration_ids,
                                      notification: {
                                          title: title,
                                          body: description
                                      },
                                      android: {
                                          notification: {
                                            imageUrl: req.body.image
                                          }
                                      },
                                      options: notification_options,
                                      data : {
                                          openURL : req.body.link
                                      }
                                  };
                      
                                  admin.messaging().sendMulticast(message).then((response) => {
                                      console.log( response.successCount +' successfull');
                                      console.log( response.failureCount +' not successfull');
                                      number_of_times++;
                                      check_counter(number_of_times);
                                  }).catch((err) => {
                                      console.log(err);
                                      res.jsonp({message:'failed'});
                                  })
                              }
                          }, 1000 * (number_of_times+1));
                       }
                     }
              } else {
                  for (var i = 0; i < data.length; i++) {
                      registration_ids.push(data[i].device_id);
                  }
                  var message = {
                      tokens: registration_ids,
                      notification: {
                          title: title,
                          body: description
                      },
                      android: {
                          notification: {
                            imageUrl: req.body.image
                          }
                      },
                      data : {
                          openURL : req.body.link
                      },
                      options: notification_options
                  };
      
                  admin.messaging().sendMulticast(message).then((response) => {
                      console.log( response.successCount +' successfull');
                      console.log( response.failureCount +' not successfull');
                      res.jsonp({message:'success'});
                  }).catch((err) => {
                      console.log(err);
                      res.jsonp({message:'failed'});
                  })
              }
          }
      });
  }
});


/* Check Version. */
router.get('/check_version',function(req,res){
  const check_user = "SELECT * FROM `admin` LIMIT 1 OFFSET 0";
  pool.query(check_user,function(err,result){
    if(err) {
      console.log(err);
    } else {
      res.json({version:result[0].app_version});
    }
  });
});

/* GET Categories page. */
router.get('/categories', function(req, res, next) {
  res.render('pages/categories/categories');
});

/* GET Gallery page. */
router.get('/gallery', function(req, res, next) {
  res.render('pages/gallery/gallery');
});

/* GET Books page. */
router.get('/books', function(req, res, next) {
  res.render('pages/books/books');
});

/* GET Products page. */
router.get('/products', function(req, res, next) {
  const products = "SELECT * FROM `products` WHERE `status` = 1";
    pool.query(products,function(err,products,fields){
      res.render('pages/products/products', {
        products:products
      });
    });
});

/* Get user related prodycts */
router.get('/relatedProducts/:array', function(req, res, next) {
  var array = req.params.array.split(',');
  var response = [];
  var counter = 1;
  for (let i=0; i<array.length; i++) {
    task(i,array[i]);
 }
   
 function task(i,id) {
   setTimeout(function() {
    var query2  = "SELECT p.* , c.`name` AS c_name, (SELECT `path` FROM `images` WHERE `images`.`product_id` = p.`id` LIMIT 1 OFFSET 0) AS image_path FROM `products` p INNER JOIN `product_categories` c ON c.`id` = p.`category_id` WHERE p.`status` = 1 AND p.`id` = '"+ id +"' ORDER BY p.`created_at` DESC";
    pool.query(query2,function(err,results,fields){
              if(err) {
                  console.log(err);
              } else {
                response.push(results[0]);
                check_counter(counter,response);
                counter++;
              }
    });
   }, 500 * i);
 }
  function check_counter(counter1,response_array){
    if(counter1 == array.length){
      res.json({data: response_array});
    }
  }
});

/* GET Courses page. */
router.get('/courses', function(req, res, next) {
  const live = "SELECT * ,(SELECT `id` FROM `courses` WHERE `courses`.`live_id` = `live`.`id`) AS course_id FROM `live` WHERE `status` = 1";
  pool.query(live,function(err,live,fields){
    if(err) {
        console.log(err);
        res.send('Database error');
    } else {
        res.render('pages/courses/courses',{
          live:live
        });
    }
  });
});

/* GET Coupons page. */
router.get('/coupons', function(req, res, next) {
  res.render('pages/coupons/coupons');
});

/* GET Blogs page. */
router.get('/blogs', function(req, res, next) {
  res.render('pages/blogs/blogs');
});

/* GET Slider page. */
router.get('/slider', function(req, res, next) {
  res.render('pages/slider/slider');
});

/* GET Order page. */
router.get('/orders', function(req, res, next) {
  res.render('pages/orders/orders');
});

/* GET Reviews page. */
router.get('/reviews', function(req, res, next) {
  res.render('pages/reviews/reviews');
});

/* GET Subscription page. */
router.get('/subscription', function(req, res, next) {
  res.render('pages/subscription/subscription');
});

/* GET Live page. */
router.get('/live', function(req, res, next) {
  res.render('pages/live/live');
});

/* GET Testimonial page. */
router.get('/testimonials', function(req, res, next) {
  res.render('pages/testimonials/testimonials');
});

/* Logout application. */
router.get('/logout', function(req, res, next) {
  req.session.destroy(function(err) {
    res.redirect('/');
  })
});

/* GET Profile page. */
router.get('/profile', function(req, res, next) {
  const query = "SELECT * FROM `admin`";
  const social_links = "SELECT * FROM `social_links`";
    pool.query(query,function(err,results,fields){
      pool.query(social_links,function(err,social_links,fields){
        if(err) {
            console.log(err);
            res.send('Database error');
        } else {
            res.render('pages/profile/profile',{
              results:results,
              social_links:social_links
            });
        }
      });
    });
});

/* POST login page. */
router.post('/login', function(req, res, next) {
  // console.log(req.body);
  const check_user = "SELECT * FROM `admin` WHERE `email` = '"+ req.body.email +"' AND `password` = '"+ req.body.password +"' AND `status` = 1";
  pool.query(check_user,function(err,result){
    if(err) {
      console.log(err);
    } else {
      if(result.length !=0){
        const jsontoken = sign({username : req.body.email, password:req.body.password, user_id: result[0].id},accessTokenSecret);
        req.session.token = jsontoken;
        res.redirect('/');
      } else {
        res.redirect('/?error=Invalid username and password !!');
      }
    }
  });
});

/* Update Password. */
router.post('/updatePassword', function(req, res, next) {
  const query = "UPDATE `admin` SET `password` = '"+ (req.body.c_password.length != 0 ? req.body.c_password : req.body.current_password) +"'";
  pool.query(query,function(err,results,fields){
    if(err) {
      console.log()
    }
    res.redirect('/profile');      
  });
});

/* Update Social Links. */
router.post('/updateSocialLinks', function(req, res, next) {
  const query = "UPDATE `social_links` SET `name` = '"+ req.body.name +"',`url` = '"+ req.body.url +"',`image` = '"+ req.body.image +"',`show_category` = '"+ req.body.show_category +"',`linked_category`='"+ req.body.linked_category +"',`linked_array`='"+ req.body.linked_array +"' WHERE `id`='"+ req.body.id +"'";
  pool.query(query,function(err,results,fields){
    if(err) {
      console.log()
    }
    res.redirect('/profile');      
  });
});

/* Update Social Links. */
router.post('/deleteSocialLink', function(req, res, next) {
  const query = "UPDATE `social_links` SET `status` = 0  WHERE `id` = '"+ req.body.id +"'";
  pool.query(query,function(err,results,fields){
    if(err) {
      console.log()
    }
    res.json({message:'success'});      
  });
});


// Api's
router.post('/addGalleryImages',controllers.addGalleryImages);

//Orders
router.get('/getOrders/:offset',controllers.getOrders);

//Live
router.get('/getLive/:offset',controllers.getLive);
router.get('/getLive',controllers.getLive);
router.get('/getLiveUsers/:id',controllers.getLiveUsers);
router.get('/getUserLive/:user_id',controllers.getUserLive);
router.get('/getUserLive/:user_id/:live_id',controllers.getUserLive);
router.post('/addLiveClass',controllers.addLiveClass);
router.post('/addLiveClassUser',controllers.addLiveClassUser);
router.post('/deleteLiveClass',controllers.deleteLiveClass);
router.post('/deleteLiveClassUser',controllers.deleteLiveClassUser);
router.post('/editLiveClass',controllers.editLiveClass);

//Testimonal
router.post('/deleteTestimonial',controllers.deleteTestimonial);
router.get('/getTestimonials',controllers.getTestimonials);
router.get('/getImpTestimonials',controllers.getImpTestimonials);
router.post('/addTestimonial',controllers.addTestimonial);
router.post('/editTestimonial',controllers.editTestimonial);
router.post('/markedTestimonialImportant',controllers.markedTestimonialImportant);

// Books
router.post('/addBook',controllers.addBook);
router.get('/getBooks',controllers.getBook);
router.get('/checkBook/:name',controllers.checkBook);
router.get('/getImages/:id',controllers.getBookImages);
router.get('/getImages/:id/:offset',controllers.getBookImages);
router.post('/deleteBook',controllers.deleteBook);
router.get('/getUserBook/:user_id',controllers.getUserBook);
router.get('/getUserBookbyId/:id/:user_id',controllers.getUserBookbyId);
router.get('/getImpBooks',controllers.getImpBooks);
router.post('/editBook/:id',controllers.editBook);
router.get('/getBookVideos/:id',controllers.getBookVideos);
router.post('/addBookVideos',controllers.addBookVideos);
router.post('/deleteBookVideo',controllers.deleteBookVideo);
router.post('/editBookVideos',controllers.editBookVideos);

//Products
router.post('/addProduct',controllers.addProduct);
router.get('/getProducts/:offset',controllers.getProducts);
router.get('/getProducts',controllers.getProductWithoutOffset);
router.get('/getUserProductById/:id/:user_id',controllers.getUserProductById);
router.get('/getUserProductById/:id',controllers.getUserProductById);
router.get('/getUserProduct/:user_id',controllers.getUserProduct);
router.get('/getUserProduct/:user_id/:offset',controllers.getUserProduct);
router.get('/getCategoryProduct/:category/:user_id',controllers.getCategoryProduct);
router.get('/getCategoryProduct/:category/:user_id/:offset',controllers.getCategoryProduct);
router.get('/getSearchedProduct/:name/:user_id',controllers.getSearchedProduct);
router.get('/getSearchedProduct/:name',controllers.getSearchedProduct);
router.get('/getEachProduct/:id',controllers.getEachProduct);
router.get('/getProductImages/:id',controllers.getProductImages);
router.get('/getProductImages/:id/:offset',controllers.getProductImages);
router.post('/deleteProduct',controllers.deleteProduct);
router.post('/editProduct/:id',controllers.editProduct);
router.get('/getProductCategories',controllers.getProductCategories);
router.post('/addProductCategory',controllers.addProductCategory);
router.get('/checkProductCategory/:name',controllers.checkProductCategory);
router.post('/deleteProductCategory',controllers.deleteProductCategory);
router.post('/updateProductCategory',controllers.updateProductCategory);
router.get('/getProductSubCategories/:category_id',controllers.getProductSubCategories);
router.post('/markedProductFeatured',controllers.markedProductFeatured);

//Courses
router.get('/getCourse/:offset',controllers.getCourse);
router.get('/getCourse/',controllers.getCourse);
router.get('/getCourseCategories',controllers.getCourseCategories);
router.get('/getUserCourse/:user_id',controllers.getUserCourse);
router.get('/getUserCourse/:user_id/:offset',controllers.getUserCourse);
router.get('/getUserCourseById/:id/:user_id',controllers.getCourseById);
router.get('/getUserCourseById/:id',controllers.getCourseById);
router.post('/addCourse',controllers.addCourse);
router.get('/getCourseImages/:id',controllers.getCourseImages);
router.get('/getCourseImages/:id/:offset',controllers.getCourseImages);
router.get('/getSearchedCourse/:name/:user_id',controllers.getSearchedCourse);
router.get('/getSearchedCourse/:name',controllers.getSearchedCourse);
router.get('/getCategoryCourse/:category/:user_id',controllers.getCategoryCourse);
router.get('/getCategoryCourse/:category/',controllers.getCategoryCourse);
router.get('/getCategoryCourse/:category/:user_id/:offset',controllers.getCategoryCourse);
router.get('/getCourseVideos/:id',controllers.getCourseVideos);
router.post('/addCourseVideos',controllers.addCourseVideos);
router.post('/editCourseVideos',controllers.editCourseVideos);
router.post('/deleteCourseVideo',controllers.deleteCourseVideo);
router.get('/getCoursePdf/:id',controllers.getCoursePdf);
router.post('/editCourse/:id',controllers.editCourse);
router.post('/deleteCourse',controllers.deleteCourse);
router.post('/markedCourseCategoryImportant',controllers.markedCourseCategoryImportant);
router.post('/addCourseCategory',controllers.addCourseCategory);
router.get('/checkProductCategory/:name',controllers.checkProductCategory);
router.post('/deleteCourseCategory',controllers.deleteCourseCategory);
router.post('/updateCourseCategoryName',controllers.updateCourseCategoryName);
router.post('/markedCourseFeatured',controllers.markedCourseFeatured);

//Coupons
router.post('/deleteCoupons',controllers.deleteCoupons);
router.get('/getCoupons',controllers.getCoupons);
router.get('/getCouponsByCategory/:linked_category/:discount_for',controllers.getCouponsByCategory);
router.post('/addCoupons',controllers.addCoupons);
router.post('/editCoupons/:id',controllers.editCoupons);

//Blogs
router.post('/deleteBlog',controllers.deleteBlog);
router.get('/getBlogs/:offset',controllers.getBlogs);
router.get('/getSearchedBlogs/:value',controllers.getSearchedBlogs);
router.post('/addBlog',controllers.addBlog);
router.get('/getBlogImages/:id',controllers.getBlogImages);
router.post('/editBlog/:id',controllers.editBlog);

//Reviews
router.post('/deleteReviews',controllers.deleteReviews);
router.get('/getReviews/:category',controllers.getReviews);
router.post('/addReviews',controllers.addReviews);
router.get('/getReviewsByItem/:category/:item_id',controllers.getReviewsByItem);

//Reviews
router.post('/deleteSubscription',controllers.deleteSubscription);
router.get('/getSubscription/:category/:offset',controllers.getSubscription);
router.get('/getSearchSubscription/:category/:phone_number',controllers.getSearchSubscription);
router.post('/addSubscription',controllers.addSubscription);
router.post('/editSubscription',controllers.editSubscription);
router.get('/getSubscriptionUsers',controllers.getSubscriptionUsers);

//slider
router.post('/deleteSlider',controllers.deleteSlider);
router.get('/getSlider',controllers.getSlider);
router.get('/getSliderByCategory/:category',controllers.getSliderByCategory);
router.post('/editslider',controllers.editSlider);
router.post('/addSlider',controllers.addSlider);
router.post('/uploadSliderImage',upload.single('slider_image'),async function(req,res,next){
  var compressedimage = path.join(__dirname,'../','public/images/uploads',new Date().getTime() + ".webp");
  var name = 'public/images/uploads/'+ compressedimage.split('/')[compressedimage.split('/').length - 1];
  await sharp(req.file.path).webp({
    quality: 50
    // lossless: true
  }).resize({
      width: 600
    }).toFile(compressedimage,(err,info) => {
      if(err){
        console.log(err);
      }
      // console.log(info);
      fs.unlink(req.file.path,(err) => {
        if(err) {
          console.log(err);
        } else {
          // res.json({message: 'success'});
          res.json({path: name});
        }
      });
    });
  // res.json({path: req.file.path}); 
});

router.post('/uploadSliderImage/:id',upload.single('slider_image'),async function(req,res,next){
  var compressedimage = path.join(__dirname,'../','public/images/uploads',new Date().getTime() + ".webp");
  var name = 'public/images/uploads/'+ compressedimage.split('/')[compressedimage.split('/').length - 1];
  await sharp(req.file.path).webp({
    quality: 50
    // lossless: true
  }).resize({
      width: 600
    }).toFile(compressedimage,(err,info) => {
      if(err){
        console.log(err);
      }
      // console.log(info);
      var query2  = "UPDATE `live` SET `image_path` = '"+ name.slice(6,name.length) +"' WHERE `id` = '"+ req.params.id +"'";
          pool.query(query2,function(err,results,fields){
                    if(err) {
                        console.log(err);
                    } else {
                      fs.unlink(req.file.path,(err) => {
                        if(err) {
                          console.log(err);
                        } else {
                          // res.json({message: 'success'});
                          res.json({path: name});
                        }
                      });
                    }
          });
      
    });
  // res.json({path: req.file.path}); 
});


router.post('/uploadSliderImage/profile/testimonial/:id',upload.single('slider_image'),async function(req,res,next){
  var compressedimage = path.join(__dirname,'../','public/images/uploads',new Date().getTime() + ".webp");
  var name = 'public/images/uploads/'+ compressedimage.split('/')[compressedimage.split('/').length - 1];
  await sharp(req.file.path).webp({
    quality: 50
    // lossless: true
  }).resize({
      width: 600
    }).toFile(compressedimage,(err,info) => {
      if(err){
        console.log(err);
      }
      // console.log(info);
      var query2  = "UPDATE `testimonials` SET `profile_image` = '"+ name.slice(6,name.length) +"' WHERE `id` = '"+ req.params.id +"'";
          pool.query(query2,function(err,results,fields){
                    if(err) {
                        console.log(err);
                    } else {
                      fs.unlink(req.file.path,(err) => {
                        if(err) {
                          console.log(err);
                        } else {
                          // res.json({message: 'success'});
                          res.json({path: name});
                        }
                      });
                    }
          });
      
    });
  // res.json({path: req.file.path}); 
});


router.post('/uploadSliderImage/testimonial/:id',upload.single('slider_image'),async function(req,res,next){
  var compressedimage = path.join(__dirname,'../','public/images/uploads',new Date().getTime() + ".webp");
  var name = 'public/images/uploads/'+ compressedimage.split('/')[compressedimage.split('/').length - 1];
  await sharp(req.file.path).webp({
    quality: 50
    // lossless: true
  }).resize({
      width: 600
    }).toFile(compressedimage,(err,info) => {
      if(err){
        console.log(err);
      }
      // console.log(info);
      var query2  = "UPDATE `testimonials` SET `image` = '"+ name.slice(6,name.length) +"' WHERE `id` = '"+ req.params.id +"'";
          pool.query(query2,function(err,results,fields){
                    if(err) {
                        console.log(err);
                    } else {
                      fs.unlink(req.file.path,(err) => {
                        if(err) {
                          console.log(err);
                        } else {
                          // res.json({message: 'success'});
                          res.json({path: name});
                        }
                      });
                    }
          });
      
    });
  // res.json({path: req.file.path}); 
});

//Users
router.get('/getUsers/:offset',controllers.getUsers);
router.get('/updateDeviceRequest/:phone_number',controllers.updateDeviceRequest);
router.get('/getSearchUser/:phone_number',controllers.getSearchUser);

//Gallery
router.get('/getGalleryImages/:offset',controllers.getGalleryImages);
router.get('/getGalleryImpImages/:offset',controllers.getGalleryImpImages);
router.post('/saveGalleryImages',upload.array('gallery_images'),function(req,res,next){
  // res.json({files: req.files}); 
  var array_of_names = [];
  var counter = 1;
  for (let i=0; i<req.files.length; i++) {
    task(i,req.files[i]);
 }
   
 function task(i,file) {
   setTimeout(function() {
        var compressedimage = path.join(__dirname,'../','public/images/uploads',new Date().getTime() + ".jpeg");
        var name = 'public/images/uploads/'+ compressedimage.split('/')[compressedimage.split('/').length - 1];
        sharp(file.path).webp({
          quality: 50
        }).resize({
            width: 600
          }).toFile(compressedimage,(err,info) => {
          if(err){
            console.log(err);
          }
          // console.log(info);
          var query2  = "INSERT INTO `gallery` (`path`) VALUES ('"+ name.slice(6,name.length) +"')";
          pool.query(query2,function(err,results,fields){
                    if(err) {
                        console.log(err);
                    } else {
                      fs.unlink(file.path,(err) => {
                        if(err) {
                          console.log(err);
                        } else {
                          array_of_names.push(name);
                          counter++;
                        }
                      });
                      console.log(counter);
                      check_counter(counter);
                    }
          });
        });
   }, 2000 * i);
 }
  function check_counter(counter1){
    if(counter1 == req.files.length){
      res.json({message:'success'});
    }
  }
  // for(var i=0;i<req.files.length;i++){
    
  // }
});

// router.get('/getImages/:approval/:offset',controllers.getImages);
// Extra
router.get('/getCategories',controllers.getCategories);
router.post('/markedCategoryImportant',controllers.markedCategoryImportant);
router.post('/deleteCategory',controllers.deleteCategory);
router.post('/addCategory',controllers.addCategory);
router.get('/checkCategory/:name',controllers.checkingCategory);

router.post('/uploadCategoryImage',upload.single('category_image'),function(req,res,next){
  res.json({path: req.file.path}); 
});

router.post('/savePdf',upload.array('pdf'),function(req,res,next){
  res.json({files: req.files}); 
});

router.post('/deletePDF',function(req,res,next){
  var splited_array = req.body.path.split('/');
  // console.log(splited_array);
  var path = `public${req.body.path}`;
  // console.log(path);
  fs.unlink(path,(err) => {
    if(err) {
      console.log(err);
    } else {
      res.json({message: 'success'});
    }
  });
});

router.post('/saveBookImages',upload.array('book_images'),function(req,res,next){
  // console.log('hello');
  var array_of_names = [];
  var counter = 0;
  for (let i=0; i<req.files.length; i++) {
    task(i,req.files[i]);
 }
   
 function task(i,file) {
   setTimeout(function() {
        var compressedimage = path.join(__dirname,'../','public/images/uploads',new Date().getTime() + ".jpeg");
        var name = 'public/images/uploads/'+ compressedimage.split('/')[compressedimage.split('/').length - 1];
        sharp(file.path).webp({
          quality: 50
        }).resize({
            width: 600
          }).toFile(compressedimage,(err,info) => {
          if(err){
            console.log(err);
          }
          fs.unlink(file.path,(err) => {
            if(err) {
              console.log(err);
            } else {
              array_of_names.push(name);
              counter++;
              console.log(counter);
              check_counter(counter);
            }
          });
        });
   }, 2000 * i);
 }
  function check_counter(counter1){
    if(counter1 == req.files.length){
      res.json({files: array_of_names});
    }
  }
  // res.json({files: req.files}); 
});

router.post('/saveUserOrderImage',upload.single('picture'),async function(req,res,next){
  // console.log('hello');
  // console.log(req.file);
  // console.log(req.body);
  var compressedimage = path.join(__dirname,'../','public/images/uploads',new Date().getTime() + ".webp");
  var name = 'public/images/uploads/'+ compressedimage.split('/')[compressedimage.split('/').length - 1];
  await sharp(req.file.path).webp({
    quality: 50
    // lossless: true
  }).resize({
      width: 600
    }).toFile(compressedimage,(err,info) => {
      if(err){
        console.log(err);
      }
      console.log(info);
      fs.unlink(req.file.path,(err) => {
        if(err) {
          console.log(err);
        } else {
          // res.json({message: 'success'});
          res.json({path: name.slice(6,name.length)});
        }
      });
    });
  
  // res.json({files: req.file.path.slice(6,req.file.path.length)}); 
});

router.post('/saveCategoryImages/:id',upload.single('category_images'),async function(req,res,next){
  var compressedimage = path.join(__dirname,'../','public/images/uploads',new Date().getTime() + ".webp");
  var name = 'public/images/uploads/'+ compressedimage.split('/')[compressedimage.split('/').length - 1];
  await sharp(req.file.path).webp({
    quality: 50
    // lossless: true
  }).resize({
      width: 600
    }).toFile(compressedimage,(err,info) => {
      if(err){
        console.log(err);
      }
      console.log(info);
      fs.unlink(req.file.path,(err) => {
        if(err) {
          console.log(err);
        } else {
          // res.json({message: 'success'});
          // res.json({path: name});
          const query2  = "UPDATE `course_categories` SET `path` = '"+ name.slice(6,name.length) +"'  WHERE `id` = '"+ req.params.id +"'";
          pool.query(query2,function(err,results,fields){
                  if(err) {
                      // callback(err);
                      console.log(err);
                  } else {
                    res.json({message:'success'});
                      // callback(null,results);
                  }
        });
        }
      });
    });
});

router.post('/updateCategoryImages',function(req,res,next){
  var path = `public${req.body.path}`;
  const query2  = "UPDATE `course_categories` SET `path` = ''  WHERE `id` = '"+ req.body.id +"'";
        pool.query(query2,function(err,results,fields){
            if(err) {
                // callback(err);
                console.log(err);
            } else {
              fs.unlink(path,(err) => {
                if(err) {
                  console.log(err);
                } else {
                  res.json({message: 'success'});
                }
              });
                // callback(null,results);
            }
  });
});

router.post('/saveEditBookImages/:id/:value',upload.array('book_images'),function(req,res,next){
  // console.log(req.files);
  for(var i=0;i<req.files.length;i++) {
    var path = req.files[i].path.slice(6,req.files[i].path.length);
    if(req.params.value == 'books'){
      var query  = "INSERT INTO `images` (`path`,`iv_category`,`category`,`book_id`) VALUES ('"+ path +"','image','book','"+ req.params.id +"')";
    } else if(req.params.value == 'products') {
      var query  = "INSERT INTO `images` (`path`,`iv_category`,`category`,`product_id`) VALUES ('"+ path +"','image','product','"+ req.params.id +"')";
    } else if(req.params.value == 'courses') {
      var query  = "INSERT INTO `images` (`path`,`iv_category`,`category`,`course_id`) VALUES ('"+ path +"','image','course','"+ req.params.id +"')";
    } else if(req.params.value == 'blogs') {
      var query  = "INSERT INTO `images` (`path`,`iv_category`,`category`,`blog_id`) VALUES ('"+ path +"','image','blog','"+ req.params.id +"')";
    }
    pool.query(query,function(err,results,fields){
        if(err) {
            console.log(err);
            // break;
        } else {
        }
    });
  }
  res.json({files: req.files}); 
});

router.post('/saveEditPdf/:id/:value',upload.array('pdf'),function(req,res,next){
  // console.log(req.files);
  for(var i=0;i<req.files.length;i++) {
    var path = req.files[i].path.slice(6,req.files[i].path.length);
    if(req.params.value == 'books'){
      var query  = "INSERT INTO `images` (`path`,`iv_category`,`category`,`book_id`) VALUES ('"+ path +"','image','book','"+ req.params.id +"')";
    } else if(req.params.value == 'products') {
      var query  = "INSERT INTO `images` (`path`,`iv_category`,`category`,`product_id`) VALUES ('"+ path +"','image','product','"+ req.params.id +"')";
    } else if(req.params.value == 'courses') {
      var query  = "INSERT INTO `recipies` (`course_id`,`pdflink`) VALUES ('"+ req.params.id +"','"+ path +"')";
    } else if(req.params.value == 'blogs') {
      var query = "UPDATE `blog` SET `pdf` = '"+ path +"' WHERE `id` = '"+ req.params.id +"'"
    }
    pool.query(query,function(err,results,fields){
        if(err) {
            console.log(err);
            // break;
        } else {
        }
    });
  }
  res.json({files: req.files}); 
});

router.post('/deleteEditPhoto',function(req,res,next){
  var splited_array = req.body.path.split('/');
  // console.log(splited_array);
  // var path = `public/${splited_array[3]}/${splited_array[4]}/${splited_array[5]}`;
  // console.log(path);
  var path = `public${req.body.path}`;

  const query2  = "DELETE FROM `images` WHERE `path` = '"+ req.body.path +"'";
  pool.query(query2,function(err,results,fields){
    if(err) {
      console.log(err);
    } else {
      fs.unlink(path,(err) => {
        if(err) {
          console.log(err);
        } else {
          res.json({message: 'success'});
        }
      });
    }
  }); 
});

router.post('/deleteEditPdf',function(req,res,next){
  var splited_array = req.body.path.split('/');
  // console.log(splited_array);
  // var path = `public/${splited_array[3]}/${splited_array[4]}/${splited_array[5]}`;
  // console.log(path);
  var path = `public${req.body.path}`;

  const query2  = "DELETE FROM `recipies` WHERE `pdflink` = '"+ req.body.path +"'";
  pool.query(query2,function(err,results,fields){
    if(err) {
      console.log(err);
    } else {
      fs.unlink(path,(err) => {
        if(err) {
          console.log(err);
        } else {
          res.json({message: 'success'});
        }
      });
    }
  }); 
});

router.post('/saveGalleryImages',upload.array('gallery_images'),function(req,res,next){
  res.json({files: req.files}); 
});

router.post('/deletePhoto',function(req,res,next){
  var splited_array = req.body.path.split('/');
  // console.log(splited_array);
  // var path = `public/${splited_array[3]}/${splited_array[4]}/${splited_array[5]}`;
  // console.log(path);
  var path = `public${req.body.path}`;
  fs.unlink(path,(err) => {
    if(err) {
      console.log(err);
    } else {
      res.json({message: 'success'});
    }
  });
});

router.post('/deleteGalleryPhoto',function(req,res,next){
  // var splited_array = req.body.path.split('/');
  // var path = `public/${splited_array[3]}/${splited_array[4]}/${splited_array[5]}`;
  var path = `public${req.body.path}`;
  const query2  = "DELETE FROM `gallery` WHERE `path` = '"+ req.body.path +"'";
  pool.query(query2,function(err,results,fields){
    if(err) {
      console.log(err);
    } else {
      fs.unlink(path,(err) => {
        if(err) {
          console.log(err);
        } else {
          res.json({message: 'success'});
        }
      });
    }
  }); 
});

router.post('/approveGalleryPhoto',function(req,res,next){
  if(req.body.approve_value == 1){
    var query2  = "UPDATE `images` SET `approved` = 0 WHERE `path` = '"+ req.body.path +"'";
  } else {
    var query2  = "UPDATE `images` SET `approved` = 1 WHERE `path` = '"+ req.body.path +"'";
  }
  pool.query(query2,function(err,results,fields){
    if(err) {
      console.log(err);
    } else {
      res.json({message: 'success'}); 
    }
  }); 
});

router.post('/signupascustomer',function(req,res,next){
  console.log(req.body);
  res.json({message:'hello'});
});

router.post('/addLiveToSubscription',function(req,res,next){
  var query  = "SELECT * , (SELECT COUNT(*) FROM `subscription` s WHERE s.course_id = '"+ req.body.course_id +"' AND s.user_id = l.user_id AND s.status = 1 ) AS subscribed FROM `live_subscription` l WHERE live_id = '"+ req.body.live_id +"'";
  var end_date = new Date(new Date().getTime() + parseInt(req.body.days) * 24 * 60 * 60 * 1000);
  var counter = 1;
  pool.query(query,function(err,live_users,fields){
    live_users.forEach((user) => {
      if(user.subscribed == 0) {
        var query2 = "INSERT INTO `subscription` (`category`,`user_id`,`course_id`,`end_date`) VALUES ('course','"+ user.user_id +"','"+ req.body.course_id +"','"+ end_date.toISOString().slice(0, 19).replace('T', ' ') +"')";
        pool.query(query2,function(err,query2,fields){
          if(err) {
            console.log(err);
          } else {
            check_counter(counter,live_users.length);
            counter++;
          }
        });
      } else {
        check_counter(counter,live_users.length);
        counter++;
      }
    });
  }); 
  function check_counter(counter1,length_of_table){
    // console.log(counter1);
    // console.log(length_of_table);
    if(counter1 == length_of_table){
      res.json({
        message :'success'
      })
    }
  }
});

//Subscription
var instance = new Razorpay({
  key_id: 'rzp_test_66bBsmPqVcCA29',
  key_secret: 'yc3AtOejoZPX5XefdVgwyq4z'
})

router.get('/subscription/:total_price/:actual_total_price/:user_id/:item_id/:category/:description/:coupon_id/:payment_method/:quantity/:address/:phoneNumber/:image_path/:pincode',function (req,res,next){
  console.log('hello');
      res.render('subscription/subscription',{
        total_price:req.params.total_price,
        actual_total_price:req.params.actual_total_price,
        user_id:req.params.user_id,
        item_id:req.params.item_id,
        category:req.params.category,
        description:req.params.description,
        coupon_id:req.params.coupon_id,
        payment_method:req.params.payment_method,
        quantity:req.params.quantity,
        address:req.params.address,
        phoneNumber:req.params.phoneNumber,
        image_path:req.params.image_path,
        pincode:req.params.pincode,
      });
});

router.get('/cartsubscription/:total_price/:actual_total_price/:address/:phoneNumber/:pincode/:user_id/:number_of_courses',function (req,res,next){
  // console.log('hello');
      res.render('subscription/new_subscription',{
        total_price:req.params.total_price,
        actual_total_price:req.params.actual_total_price,
        address:req.params.address,
        phoneNumber:req.params.phoneNumber,
        pincode:req.params.pincode,
        user_id:req.params.user_id,
        number_of_courses:req.params.number_of_courses,
      });
});


router.get('/livesubscription/:actual_total_price/:user_id/:live_id',function (req,res,next){
  // console.log('hello');
      res.render('subscription/live_subscription_payment',{
        actual_total_price:req.params.actual_total_price,
        user_id:req.params.user_id,
        live_id:req.params.live_id,
      });
});


router.post('/complete_payment_live/:user_id/:live_id',function (req,res,next){
  instance.payments.fetch(req.body.razorpay_payment_id).then((paymentDocument) => {
    // console.log(paymentDocument);
    if (paymentDocument.status == "captured") {
      var query1 = "SELECT * FROM `courses` WHERE `live_id` = '"+ req.params.live_id +"' AND `status` = 1";
      var query = "INSERT INTO `live_subscription` (`user_id`,`live_id`) VALUES ('"+ req.params.user_id +"','"+ req.params.live_id +"')";
      pool.query(query1,function(err,results1,fields){
        var end_date = new Date(new Date().getTime() + parseInt(results1[0].days) * 24 * 60 * 60 * 1000);
            var query2 = "INSERT INTO `subscription` (`category`,`user_id`,`course_id`,`end_date`) VALUES ('course','"+ req.params.user_id +"','"+ results1[0].id +"','"+ end_date.toISOString().slice(0, 19).replace('T', ' ') +"')";
            pool.query(query2,function(err,query2,fields){
              if(err) {
                console.log(err);
              } else {
                pool.query(query,function(err,results,fields){
                  if(err) {
                    console.log(err);
                  } else {
                    res.render('subscription/live_payment_status',{
                      message:'success',
                      messageClass:'alert-success'
                    });
                  }
                }); 
              }
            });
      });
    } else {
      res.render('subscription/live_payment_status',{
        message:'failed',
        messageClass:'alert-danger'
      });
    }
  });
});

router.get('/complete_apple_payment_live/:user_id/:live_id/:actual_total_price',function (req,res,next){
  var query = "INSERT INTO `live_subscription` (`user_id`,`live_id`) VALUES ('"+ req.params.user_id +"','"+ req.params.live_id +"')";
  var userupdate  = "UPDATE `users` SET `wallet` = `wallet` - '"+ req.params.actual_total_price +"' WHERE `id` = '"+ req.params.user_id +"'";
    // console.log(query);
    pool.query(query,function(err,query,fields){
      pool.query(userupdate,function(err,userupdate,fields){
        if(err) {
          console.log(err);
        } else {
          // console.log(results5); 
          res.json({
            message:'success',
          });
        }
      });
    });
});

router.get('/applePayment/:user_id/:total_price/:actual_total_price/:address/:pincode/:number_of_courses',function (req,res,next){
    var query = "SELECT c.*,c.image_path AS order_image,CASE WHEN `category` = 'course' THEN (SELECT `title` FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT `name` FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' OR `category` = 'book-videos' THEN (SELECT `title` FROM `books` WHERE `books`.`id` = c.`book_id`) END AS name,CASE WHEN `category` = 'course' THEN (SELECT `category` FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT `category_id` FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' OR `category` = 'book-videos' THEN (SELECT `category` FROM `books` WHERE `books`.`id` = c.`book_id`) END AS item_category,CASE WHEN `category` = 'course' THEN (SELECT `discount_price` FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT `discount_price` FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' THEN (SELECT `discount_price` FROM `books` WHERE `books`.`id` = c.`book_id`) WHEN `category` = 'book-videos' THEN (SELECT `only_video_discount_price` FROM `books` WHERE `books`.`id` = c.`book_id`) END AS price,CASE WHEN `category` = 'course' THEN (SELECT `days` FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN 0 WHEN `category` = 'book' THEN (SELECT `days` FROM `books` WHERE `books`.`id` = c.`book_id`) WHEN `category` = 'book-videos' THEN (SELECT `video_days` FROM `books` WHERE `books`.`id` = c.`book_id`) END AS days,CASE WHEN `category` = 'course' THEN (SELECT (SELECT `path` FROM `images` WHERE `images`.`course_id` = `courses`.`id` AND `images`.`iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT (SELECT `path` FROM `images` WHERE `images`.`product_id` = `products`.`id` AND `images`.`iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' THEN (SELECT (SELECT `path` FROM `images` WHERE `images`.`book_id` = `books`.`id` AND `images`.`iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `books` WHERE `books`.`id` = c.`book_id`) END AS image_path,CASE WHEN `category` = 'course' THEN (SELECT `live_id` FROM `courses` WHERE `courses`.`id` = c.`course_id`) ELSE 0 END AS live_id FROM `cart` c WHERE `user_id` = '"+ req.params.user_id +"' AND `cart_category` IS NULL";
      pool.query(query,function(err,results,fields){
        if(err) {
          console.log(err);
        } else {
          var counter = 0;
          if(results.length != 0){
            for (let i=0; i<results.length; i++) {
              task(i,results[i]);
            }
            function task(i,result) {
              setTimeout(function() {
                if(result.category == 'course' || result.category == 'book-videos' || result.item_category == 'e_book') {
                  if(result.category == 'course') {
                    var end_date = new Date(new Date().getTime() + parseInt(result.days) * 24 * 60 * 60 * 1000);
                    var query2 = "INSERT INTO `subscription` (`category`,`user_id`,`course_id`,`end_date`) VALUES ('course','"+ req.params.user_id +"','"+ result.course_id +"','"+ end_date.toISOString().slice(0, 19).replace('T', ' ') +"')";
                  } else if(result.category == 'book-videos') {
                    var end_date = new Date(new Date().getTime() + parseInt(result.days) * 24 * 60 * 60 * 1000);
                    var query2 = "INSERT INTO `subscription` (`category`,`user_id`,`book_id`,`end_date`) VALUES ('book-videos','"+ req.params.user_id +"','"+ result.book_id +"','"+ end_date.toISOString().slice(0, 19).replace('T', ' ') +"')";
                  } else {
                    var end_date = new Date(new Date().getTime() + parseInt(result.days) * 24 * 60 * 60 * 1000);
                    var query2 = "INSERT INTO `subscription` (`category`,`user_id`,`book_id`,`end_date`) VALUES ('book','"+ req.params.user_id +"','"+ result.book_id +"','"+ end_date.toISOString().slice(0, 19).replace('T', ' ') +"')";
                  }
                  pool.query(query2,function(err,results2,fields){
                    if(err) {
                      console.log(err);
                    } else {
                      console.log(results2);
                    }
                  });
                  if(result.live_id !=0){
                    var query10 = "INSERT INTO `live_subscription` (`user_id`,`live_id`) VALUES ('"+ req.params.user_id +"','"+ result.live_id +"')";
                    pool.query(query10,function(err,results10,fields){
                      if(err) {
                        console.log(err);
                      } else {
                        console.log(results10);
                      }
                    });
                  }
                }
                if(result.category == 'course'){
                  var query4 = "INSERT INTO `orders` (`order_id`,`payment_status`,`payment_method`,`price`,`paid_price`,`address`,`approved`,`description`,`quantity`,`category`,`course_id`,`user_id`,`coupon_id`,`image_path`,`pincode`) VALUES ('"+ req.body.razorpay_payment_id +"','done','online','"+ result.price +"','"+ req.params.actual_total_price +"','"+ req.params.address +"',1,'"+ result.description +"','"+ result.quantity +"','"+ result.category +"','"+ result.course_id +"','"+ req.params.user_id +"','0','"+ result.order_image +"','"+ req.params.pincode +"')";
                } else if(result.category == 'product') {
                  var query4 = "INSERT INTO `orders` (`order_id`,`payment_status`,`payment_method`,`price`,`paid_price`,`address`,`approved`,`description`,`quantity`,`category`,`product_id`,`user_id`,`coupon_id`,`image_path`,`pincode`) VALUES ('"+ req.body.razorpay_payment_id +"','done','online','"+ result.price +"','"+ req.params.actual_total_price +"','"+ result.address +"',1,'"+ result.description +"','"+ result.quantity +"','"+ result.category +"','"+ result.product_id +"','"+ req.params.user_id +"','0','"+ result.order_image +"','"+ req.params.pincode +"')";
                } else if(result.category == 'book' || result.category == 'book-videos') {
                  var query4 = "INSERT INTO `orders` (`order_id`,`payment_status`,`payment_method`,`price`,`paid_price`,`address`,`approved`,`description`,`quantity`,`category`,`book_id`,`user_id`,`coupon_id`,`image_path`,`pincode`) VALUES ('"+ req.body.razorpay_payment_id +"','done','online','"+ result.price +"','"+ req.params.actual_total_price +"','"+ req.params.address +"',1,'"+ result.description +"','"+ result.quantity +"','"+ result.category +"','"+ result.book_id +"','"+ req.params.user_id +"','0','"+ result.order_image +"','"+ req.params.pincode +"')";
                } 
                pool.query(query4,function(err,results4,fields){
                  if(err) {
                    console.log(err);
                  } else {
                    // console.log(results4);
                  }
                }); 
                counter++;
                check_counter(counter);
             }, 1000 * i);
            }
            function check_counter(counter1){
              if(counter1 == results.length){
                const query3 = "DELETE FROM `cart` WHERE `user_id` = '"+ req.params.user_id +"' AND `cart_category` IS NULL";
                var userupdate  = "UPDATE `users` SET `wallet` = `wallet` - '"+ req.params.actual_total_price +"' WHERE `id` = '"+ req.params.user_id +"'";
    // console.log(query);
                pool.query(query3,function(err,results5,fields){
                  pool.query(userupdate,function(err,userupdate,fields){
                    if(err) {
                      console.log(err);
                    } else {
                      // console.log(results5); 
                      res.json({
                        message:'success',
                      });
                    }
                  });
                });
              }
            }
          }
        }
      }); 
});

router.post('/complete_payment/:user_id/:total_price/:actual_total_price/:address/:pincode/:number_of_courses',function (req,res,next){
  instance.payments.fetch(req.body.razorpay_payment_id).then((paymentDocument) => {
    // console.log(paymentDocument);
    if (paymentDocument.status == "captured") {
      var query = "SELECT c.*,c.image_path AS order_image,CASE WHEN `category` = 'course' THEN (SELECT `title` FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT `name` FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' OR `category` = 'book-videos' THEN (SELECT `title` FROM `books` WHERE `books`.`id` = c.`book_id`) END AS name,CASE WHEN `category` = 'course' THEN (SELECT `category` FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT `category_id` FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' OR `category` = 'book-videos' THEN (SELECT `category` FROM `books` WHERE `books`.`id` = c.`book_id`) END AS item_category,CASE WHEN `category` = 'course' THEN (SELECT `discount_price` FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT `discount_price` FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' THEN (SELECT `discount_price` FROM `books` WHERE `books`.`id` = c.`book_id`) WHEN `category` = 'book-videos' THEN (SELECT `only_video_discount_price` FROM `books` WHERE `books`.`id` = c.`book_id`) END AS price,CASE WHEN `category` = 'course' THEN (SELECT `days` FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN 0 WHEN `category` = 'book' THEN (SELECT `days` FROM `books` WHERE `books`.`id` = c.`book_id`) WHEN `category` = 'book-videos' THEN (SELECT `video_days` FROM `books` WHERE `books`.`id` = c.`book_id`) END AS days,CASE WHEN `category` = 'course' THEN (SELECT (SELECT `path` FROM `images` WHERE `images`.`course_id` = `courses`.`id` AND `images`.`iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT (SELECT `path` FROM `images` WHERE `images`.`product_id` = `products`.`id` AND `images`.`iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' THEN (SELECT (SELECT `path` FROM `images` WHERE `images`.`book_id` = `books`.`id` AND `images`.`iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `books` WHERE `books`.`id` = c.`book_id`) END AS image_path,CASE WHEN `category` = 'course' THEN (SELECT `live_id` FROM `courses` WHERE `courses`.`id` = c.`course_id`) ELSE 0 END AS live_id FROM `cart` c WHERE `user_id` = '"+ req.params.user_id +"' AND `cart_category` IS NULL";
      pool.query(query,function(err,results,fields){
        if(err) {
          console.log(err);
        } else {
          var counter = 0;
          if(results.length != 0){
            for (let i=0; i<results.length; i++) {
              task(i,results[i]);
            }
            function task(i,result) {
              setTimeout(function() {
                if(result.category == 'course' || result.category == 'book-videos' || result.item_category == 'e_book') {
                  if(result.category == 'course') {
                    var end_date = new Date(new Date().getTime() + parseInt(result.days) * 24 * 60 * 60 * 1000);
                    var query2 = "INSERT INTO `subscription` (`category`,`user_id`,`course_id`,`end_date`) VALUES ('course','"+ req.params.user_id +"','"+ result.course_id +"','"+ end_date.toISOString().slice(0, 19).replace('T', ' ') +"')";
                  } else if(result.category == 'book-videos') {
                    var end_date = new Date(new Date().getTime() + parseInt(result.days) * 24 * 60 * 60 * 1000);
                    var query2 = "INSERT INTO `subscription` (`category`,`user_id`,`book_id`,`end_date`) VALUES ('book-videos','"+ req.params.user_id +"','"+ result.book_id +"','"+ end_date.toISOString().slice(0, 19).replace('T', ' ') +"')";
                  } else {
                    var end_date = new Date(new Date().getTime() + parseInt(result.days) * 24 * 60 * 60 * 1000);
                    var query2 = "INSERT INTO `subscription` (`category`,`user_id`,`book_id`,`end_date`) VALUES ('book','"+ req.params.user_id +"','"+ result.book_id +"','"+ end_date.toISOString().slice(0, 19).replace('T', ' ') +"')";
                  }
                  pool.query(query2,function(err,results2,fields){
                    if(err) {
                      console.log(err);
                    } else {
                      console.log(results2);
                    }
                  });
                  if(result.live_id !=0){
                    var query10 = "INSERT INTO `live_subscription` (`user_id`,`live_id`) VALUES ('"+ req.params.user_id +"','"+ result.live_id +"')";
                    pool.query(query10,function(err,results10,fields){
                      if(err) {
                        console.log(err);
                      } else {
                        console.log(results10);
                      }
                    });
                  }
                }
                if(result.category == 'course'){
                  var query4 = "INSERT INTO `orders` (`order_id`,`payment_status`,`payment_method`,`price`,`paid_price`,`address`,`approved`,`description`,`quantity`,`category`,`course_id`,`user_id`,`coupon_id`,`image_path`,`pincode`) VALUES ('"+ req.body.razorpay_payment_id +"','done','online','"+ result.price +"','"+ req.params.actual_total_price +"','"+ req.params.address +"',1,'"+ result.description +"','"+ result.quantity +"','"+ result.category +"','"+ result.course_id +"','"+ req.params.user_id +"','0','"+ result.order_image +"','"+ req.params.pincode +"')";
                } else if(result.category == 'product') {
                  var query4 = "INSERT INTO `orders` (`order_id`,`payment_status`,`payment_method`,`price`,`paid_price`,`address`,`approved`,`description`,`quantity`,`category`,`product_id`,`user_id`,`coupon_id`,`image_path`,`pincode`) VALUES ('"+ req.body.razorpay_payment_id +"','done','online','"+ result.price +"','"+ req.params.actual_total_price +"','"+ result.address +"',1,'"+ result.description +"','"+ result.quantity +"','"+ result.category +"','"+ result.product_id +"','"+ req.params.user_id +"','0','"+ result.order_image +"','"+ req.params.pincode +"')";
                } else if(result.category == 'book' || result.category == 'book-videos') {
                  var query4 = "INSERT INTO `orders` (`order_id`,`payment_status`,`payment_method`,`price`,`paid_price`,`address`,`approved`,`description`,`quantity`,`category`,`book_id`,`user_id`,`coupon_id`,`image_path`,`pincode`) VALUES ('"+ req.body.razorpay_payment_id +"','done','online','"+ result.price +"','"+ req.params.actual_total_price +"','"+ req.params.address +"',1,'"+ result.description +"','"+ result.quantity +"','"+ result.category +"','"+ result.book_id +"','"+ req.params.user_id +"','0','"+ result.order_image +"','"+ req.params.pincode +"')";
                } 
                pool.query(query4,function(err,results4,fields){
                  if(err) {
                    console.log(err);
                  } else {
                    // console.log(results4);
                  }
                }); 
                counter++;
                check_counter(counter);
             }, 1000 * i);
            }
            function check_counter(counter1){
              if(counter1 == results.length){
                const query3 = "DELETE FROM `cart` WHERE `user_id` = '"+ req.params.user_id +"' AND `cart_category` IS NULL";
                pool.query(query3,function(err,results5,fields){
                  if(err) {
                    console.log(err);
                  } else {
                    // console.log(results5); 
                    res.render('subscription/payment-status',{
                      message:'success',
                      messageClass:'alert-success'
                    });
                  }
                });
              }
            }
          }
        }
      }); 
    } else {
      res.render('subscription/payment-status',{
        message:'failed',
        messageClass:'alert-danger'
      });
    }
  });
});

router.post('/subscription-complete/:paid/:actual_paid/:user_id/:category/:coupon_id',function (req,res,next){
  if(req.params.category == 'course'){
    instance.payments.fetch(req.body.razorpay_payment_id).then((paymentDocument) => {
      // console.log(paymentDocument);
      if (paymentDocument.status == "captured") {
        const query = "SELECT c.* ,(SELECT `days` FROM `courses` WHERE `courses`.`id` = c.`course_id`) AS days FROM `cart` c WHERE `user_id` = '"+ req.params.user_id +"' AND `category` = 'course'";
        pool.query(query,function(err,results,fields){
          if(err) {
            console.log(err);
          } else {
            // console.log(results);
            if(results.length != 0){
              for(var i=0;i<results.length;i++) {
                var end_date = new Date(new Date().getTime() + parseInt(results[i].days) * parseInt(results.length) * 24 * 60 * 60 * 1000);
                var query2 = "INSERT INTO `subscription` (`category`,`user_id`,`course_id`,`end_date`) VALUES ('course','"+ req.params.user_id +"','"+ results[i].course_id +"','"+ end_date.toISOString().slice(0, 19).replace('T', ' ') +"')";
                pool.query(query2,function(err,results2,fields){
                  if(err) {
                    console.log(err);
                  } else {
                    console.log(results2);
                  }
                });
                var query4 = "INSERT INTO `orders` (`order_id`,`payment_status`,`payment_method`,`price`,`paid_price`,`address`,`approved`,`description`,`category`,`course_id`,`user_id`,`coupon_id`) VALUES ('"+ req.body.razorpay_payment_id +"','done','online','"+ req.params.paid +"','"+ req.params.actual_paid +"','',1,'','course','"+ results[i].course_id +"','"+ req.params.user_id +"','"+ req.params.coupon_id +"')";
                pool.query(query4,function(err,results4,fields){
                  if(err) {
                    console.log(err);
                  } else {
                    console.log(results4);
                  }
                }); 
              }
            }
          }
        });
        const query3 = "DELETE FROM `cart` WHERE `user_id` = '"+ req.params.user_id +"' AND `category` = 'course'";
        pool.query(query3,function(err,results5,fields){
          if(err) {
            console.log(err);
          } else {
            console.log(results5); 
            res.render('subscription/payment-status',{
              message:'success',
              messageClass:'alert-success'
            });
          }
        });
      } else {
        res.render('subscription/payment-status',{
          message:'failed',
          messageClass:'alert-danger'
        });
      }
    });
  }
});

router.get('/singlesubscription/:total_price/:actual_total_price/:user_id/:item_id/:category/:description/:coupon_id/:payment_method/:quantity/:address/:phoneNumber/:image_path/:pincode',function (req,res,next){
  console.log('hello');
      res.render('subscription/singlesubscription',{
        total_price:req.params.total_price,
        actual_total_price:req.params.actual_total_price,
        user_id:req.params.user_id,
        item_id:req.params.item_id,
        category:req.params.category,
        description:req.params.description,
        coupon_id:req.params.coupon_id,
        payment_method:req.params.payment_method,
        quantity:req.params.quantity,
        address:req.params.address,
        phoneNumber:req.params.phoneNumber,
        image_path:req.params.image_path,
        pincode:req.params.pincode,
      });
});

router.post('/subscription',function (req,res,next){
  var options = {
      amount: parseFloat(req.body.total)*100,  // amount in the smallest currency unit
      currency: "INR",
  };
  instance.orders.create(options, function(err, order) {
      // console.log(order);
      res.jsonp(order);
  });
  // res.redirect('/test');
});

router.post('/subscription_value',function (req,res,next){
  var options = {
      amount: parseFloat(req.body.total)*100,  // amount in the smallest currency unit
      currency: "INR",
  };
  instance.orders.create(options, function(err, order) {
      // console.log(order);
      res.jsonp(order);
  });
  // res.redirect('/test');
});

router.get('/subscription_successfull',function (req,res,next){
  res.send('succcessfull');
});

router.get('/live_subscription_successfull',function (req,res,next){
  res.send('succcessfull');
});

router.post('/product-payment/:paid/:actual_paid/:user_id/:category/:coupon_id/:item_id/:description/:quantity/:address/:image_path/:pincode',function (req,res,next){
  if(req.params.category == 'course'){
    instance.payments.fetch(req.body.razorpay_payment_id).then((paymentDocument) => {
      // console.log(paymentDocument);
      if (paymentDocument.status == "captured") {
        var query4 = "INSERT INTO `orders` (`order_id`,`payment_status`,`payment_method`,`price`,`paid_price`,`address`,`approved`,`description`,`quantity`,`category`,`product_id`,`user_id`,`coupon_id`,`image_path`,`pincode`) VALUES ('"+ req.body.razorpay_payment_id +"','done','online','"+ req.params.paid +"','"+ req.params.actual_paid +"','"+ req.params.address +"',1,'"+ req.params.description +"','"+ req.params.quantity +"','product','"+ req.params.item_id +"','"+ req.params.user_id +"','"+ req.params.coupon_id +"','"+ ('/images/all/' + req.params.image_path.split('_image')[0]) +"','"+ req.params.pincode +"')";
        pool.query(query4,function(err,results4,fields){
          if(err) {
            console.log(err);
          } else {
            console.log(results4);
          }
        }); 
        res.render('subscription/payment-status',{
          message:'success',
          messageClass:'alert-success'
        });
      } else {
        res.render('subscription/payment-status',{
          message:'failed',
          messageClass:'alert-danger'
        });
      }
    });
  }
});


router.post('/product-payment/:paid/:actual_paid/:user_id/:category/:coupon_id/:item_id/:description/:quantity/:address/:image_path/:pincode',function (req,res,next){
  if(req.params.category == 'course'){
    instance.payments.fetch(req.body.razorpay_payment_id).then((paymentDocument) => {
      // console.log(paymentDocument);
      if (paymentDocument.status == "captured") {
        var query4 = "INSERT INTO `orders` (`order_id`,`payment_status`,`payment_method`,`price`,`paid_price`,`address`,`approved`,`description`,`quantity`,`category`,`product_id`,`user_id`,`coupon_id`,`image_path`,`pincode`) VALUES ('"+ req.body.razorpay_payment_id +"','done','online','"+ req.params.paid +"','"+ req.params.actual_paid +"','"+ req.params.address +"',1,'"+ req.params.description +"','"+ req.params.quantity +"','product','"+ req.params.item_id +"','"+ req.params.user_id +"','"+ req.params.coupon_id +"','"+ ('/images/all/' + req.params.image_path.split('_image')[0]) +"','"+ req.params.pincode +"')";
        pool.query(query4,function(err,results4,fields){
          if(err) {
            console.log(err);
          } else {
            console.log(results4);
          }
        }); 
        res.render('subscription/payment-status',{
          message:'success',
          messageClass:'alert-success'
        });
      } else {
        res.render('subscription/payment-status',{
          message:'failed',
          messageClass:'alert-danger'
        });
      }
    });
  }
});

router.post('/subscription-book-complete/:paid/:actual_paid/:user_id/:category/:coupon_id',function (req,res,next){
  if(req.params.category == 'course'){
    instance.payments.fetch(req.body.razorpay_payment_id).then((paymentDocument) => {
      // console.log(paymentDocument);
      if (paymentDocument.status == "captured") {
        const query = "SELECT c.* ,(SELECT `days` FROM `books` WHERE `books`.`id` = c.`book_id`) AS days FROM `cart` c WHERE `user_id` = '"+ req.params.user_id +"' AND `category` = 'book'";
        pool.query(query,function(err,results,fields){
          if(err) {
            console.log(err);
          } else {
            // console.log(results);
            if(results.length != 0){
              for(var i=0;i<results.length;i++) {
                var end_date = new Date(new Date().getTime() + parseInt(results[i].days) * 24 * 60 * 60 * 1000);
                var query2 = "INSERT INTO `subscription` (`category`,`user_id`,`course_id`,`end_date`) VALUES ('course','"+ req.params.user_id +"','"+ results[i].course_id +"','"+ end_date.toISOString().slice(0, 19).replace('T', ' ') +"')";
                pool.query(query2,function(err,results2,fields){
                  if(err) {
                    console.log(err);
                  } else {
                    console.log(results2);
                  }
                });
                var query4 = "INSERT INTO `orders` (`order_id`,`payment_status`,`payment_method`,`price`,`paid_price`,`address`,`approved`,`description`,`category`,`course_id`,`user_id`,`coupon_id`) VALUES ('"+ req.body.razorpay_payment_id +"','done','online','"+ req.params.paid +"','"+ req.params.actual_paid +"','',1,'','course','"+ results[i].course_id +"','"+ req.params.user_id +"','"+ req.params.coupon_id +"')";
                pool.query(query4,function(err,results4,fields){
                  if(err) {
                    console.log(err);
                  } else {
                    console.log(results4);
                  }
                }); 
              }
            }
          }
        });
        const query3 = "DELETE FROM `cart` WHERE `user_id` = '"+ req.params.user_id +"' AND `category` = 'course'";
        pool.query(query3,function(err,results5,fields){
          if(err) {
            console.log(err);
          } else {
            console.log(results5);
          }
        }); 
        res.render('subscription/payment-status',{
          message:'success',
          messageClass:'alert-success'
        });
      } else {
        res.render('subscription/payment-status',{
          message:'failed',
          messageClass:'alert-danger'
        });
      }
    });
  }
});


module.exports = router;
