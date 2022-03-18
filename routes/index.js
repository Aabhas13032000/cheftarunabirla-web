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

/* Check Version. */
router.get('/check_version',function(req,res){
  // console.log(gplay.app({appId: 'com.cheftarunbirla'}));
  // gplay.app({appId: 'com.cheftarunbirla'})
  // .then((value) => {
  //   console.log(value);
  // }).catch((err) => {
  //   console.log(err);
  // });
  // gplay.app({appId: 'com.cheftarunbirla'})
  // .then((value) => {
  //     res.json({version:value.version});
  // });
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
  res.render('pages/products/products');
});

/* GET Courses page. */
router.get('/courses', function(req, res, next) {
  res.render('pages/courses/courses');
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
    pool.query(query,function(err,results,fields){
        if(err) {
            console.log(err);
            res.send('Database error');
        } else {
            res.render('pages/profile/profile',{
              results:results
            });
        }
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
  const query = "UPDATE `admin` SET `password` = '"+ (req.body.c_password.length != 0 ? req.body.c_password : req.body.current_password) +"',`amazon` = '"+ req.body.amazon +"',`online_shop` = '"+ req.body.online_shop +"',`website` = '"+ req.body.website +"',`clubhouse`='"+ req.body.clubhouse +"',`pinterest`='"+ req.body.pinterest +"',`telegram`='"+ req.body.telegram +"',`quora`='"+ req.body.quora +"',`linkedin`='"+ req.body.linkedin +"',`twitter`='"+ req.body.twitter +"',`youtube`='"+ req.body.youtube +"',`facebook`='"+ req.body.facebook +"',`instagram`='"+ req.body.instagram +"'";
  pool.query(query,function(err,results,fields){
    if(err) {
      console.log()
    }
    res.redirect('/profile');      
  });
});


// Api's
router.post('/addGalleryImages',controllers.addGalleryImages);

//Orders
router.get('/getOrders/:offset',controllers.getOrders);

//Live
router.get('/getLive',controllers.getLive);

//Testimonal
router.post('/deleteTestimonial',controllers.deleteTestimonial);
router.get('/getTestimonials',controllers.getTestimonials);
router.get('/getImpTestimonials',controllers.getImpTestimonials);
router.post('/addTestimonial',controllers.addTestimonial);
router.post('/markedTestimonialImportant',controllers.markedTestimonialImportant);

// Books
router.post('/addBook',controllers.addBook);
router.get('/getBooks',controllers.getBook);
router.get('/checkBook/:name',controllers.checkBook);
router.get('/getImages/:id',controllers.getBookImages);
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
router.get('/getUserProduct/:user_id',controllers.getUserProduct);
router.get('/getCategoryProduct/:category/:user_id',controllers.getCategoryProduct);
router.get('/getSearchedProduct/:name/:user_id',controllers.getSearchedProduct);
router.get('/getEachProduct/:id',controllers.getEachProduct);
router.get('/getProductImages/:id',controllers.getProductImages);
router.post('/deleteProduct',controllers.deleteProduct);
router.post('/editProduct/:id',controllers.editProduct);
router.get('/getProductCategories',controllers.getProductCategories);
router.post('/addProductCategory',controllers.addProductCategory);
router.get('/checkProductCategory/:name',controllers.checkProductCategory);
router.post('/deleteProductCategory',controllers.deleteProductCategory);
router.post('/updateProductCategory',controllers.updateProductCategory);
router.get('/getProductSubCategories/:category_id',controllers.getProductSubCategories);

//Courses
router.get('/getCourse',controllers.getCourse);
router.get('/getCourseCategories',controllers.getCourseCategories);
router.get('/getUserCourse/:user_id',controllers.getUserCourse);
router.get('/getUserCourseById/:id/:user_id',controllers.getCourseById);
router.post('/addCourse',controllers.addCourse);
router.get('/getCourseImages/:id',controllers.getCourseImages);
router.get('/getSearchedCourse/:name/:user_id',controllers.getSearchedCourse);
router.get('/getCategoryCourse/:category/:user_id',controllers.getCategoryCourse);
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

//Coupons
router.post('/deleteCoupons',controllers.deleteCoupons);
router.get('/getCoupons',controllers.getCoupons);
router.get('/getCouponsByCategory/:linked_category/:discount_for',controllers.getCouponsByCategory);
router.post('/addCoupons',controllers.addCoupons);
router.post('/editCoupons/:id',controllers.editCoupons);

//Blogs
router.post('/deleteBlog',controllers.deleteBlog);
router.get('/getBlogs',controllers.getBlogs);
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

router.post('/complete_payment/:user_id/:total_price/:actual_total_price/:address/:pincode/:number_of_courses',function (req,res,next){
  instance.payments.fetch(req.body.razorpay_payment_id).then((paymentDocument) => {
    // console.log(paymentDocument);
    if (paymentDocument.status == "captured") {
      var query = "SELECT c.*,c.image_path AS order_image,CASE WHEN `category` = 'course' THEN (SELECT `title` FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT `name` FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' THEN (SELECT `title` FROM `books` WHERE `books`.`id` = c.`book_id`) END AS name,CASE WHEN `category` = 'course' THEN (SELECT `category` FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT `category_id` FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' THEN (SELECT `category` FROM `books` WHERE `books`.`id` = c.`book_id`) END AS item_category,CASE WHEN `category` = 'course' THEN (SELECT `discount_price` FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT `discount_price` FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' THEN (SELECT `discount_price` FROM `books` WHERE `books`.`id` = c.`book_id`) END AS price,CASE WHEN `category` = 'course' THEN (SELECT `days` FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN 0 WHEN `category` = 'book' THEN (SELECT `days` FROM `books` WHERE `books`.`id` = c.`book_id`) END AS days,CASE WHEN `category` = 'course' THEN (SELECT (SELECT `path` FROM `images` WHERE `images`.`course_id` = `courses`.`id` AND `images`.`iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT (SELECT `path` FROM `images` WHERE `images`.`product_id` = `products`.`id` AND `images`.`iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' THEN (SELECT (SELECT `path` FROM `images` WHERE `images`.`book_id` = `books`.`id` AND `images`.`iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `books` WHERE `books`.`id` = c.`book_id`) END AS image_path FROM `cart` c WHERE `user_id` = '"+ req.params.user_id +"'";
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
                if(result.category == 'course' || result.item_category == 'e_book') {
                  if(result.category == 'course') {
                    var end_date = new Date(new Date().getTime() + parseInt(result.days) * 24 * 60 * 60 * 1000);
                    var query2 = "INSERT INTO `subscription` (`category`,`user_id`,`course_id`,`end_date`) VALUES ('course','"+ req.params.user_id +"','"+ result.course_id +"','"+ end_date.toISOString().slice(0, 19).replace('T', ' ') +"')";
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
                }
                if(result.category == 'course'){
                  var query4 = "INSERT INTO `orders` (`order_id`,`payment_status`,`payment_method`,`price`,`paid_price`,`address`,`approved`,`description`,`quantity`,`category`,`course_id`,`user_id`,`coupon_id`,`image_path`,`pincode`) VALUES ('"+ req.body.razorpay_payment_id +"','done','online','"+ result.price +"','"+ req.params.actual_total_price +"','"+ req.params.address +"',1,'"+ result.description +"','"+ result.quantity +"','"+ result.category +"','"+ result.course_id +"','"+ req.params.user_id +"','0','"+ result.order_image +"','"+ req.params.pincode +"')";
                } else if(result.category == 'product') {
                  var query4 = "INSERT INTO `orders` (`order_id`,`payment_status`,`payment_method`,`price`,`paid_price`,`address`,`approved`,`description`,`quantity`,`category`,`product_id`,`user_id`,`coupon_id`,`image_path`,`pincode`) VALUES ('"+ req.body.razorpay_payment_id +"','done','online','"+ result.price +"','"+ req.params.actual_total_price +"','"+ req.params.address +"',1,'"+ result.description +"','"+ result.quantity +"','"+ result.category +"','"+ result.product_id +"','"+ req.params.user_id +"','0','"+ result.order_image +"','"+ req.params.pincode +"')";
                } else if(result.category == 'book') {
                  var query4 = "INSERT INTO `orders` (`order_id`,`payment_status`,`payment_method`,`price`,`paid_price`,`address`,`approved`,`description`,`quantity`,`category`,`book_id`,`user_id`,`coupon_id`,`image_path`,`pincode`) VALUES ('"+ req.body.razorpay_payment_id +"','done','online','"+ result.price +"','"+ req.params.actual_total_price +"','"+ req.params.address +"',1,'"+ result.description +"','"+ result.quantity +"','"+ result.category +"','"+ result.book_id +"','"+ req.params.user_id +"','0','"+ result.order_image +"','"+ req.params.pincode +"')";
                }
                pool.query(query4,function(err,results4,fields){
                  if(err) {
                    console.log(err);
                  } else {
                    console.log(results4);
                  }
                }); 
                counter++;
                check_counter(counter);
             }, 1000 * i);
            }
            function check_counter(counter1){
              if(counter1 == results.length){
                const query3 = "DELETE FROM `cart` WHERE `user_id` = '"+ req.params.user_id +"'";
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

router.get('/subscription_successfull',function (req,res,next){
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
