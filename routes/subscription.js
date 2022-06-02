const express = require('express');
const router = express.Router();
const pool = require('../database/connection');
const Razorpay = require('razorpay');


//Subscription
var instance = new Razorpay({
    key_id: 'rzp_test_66bBsmPqVcCA29',
    key_secret: 'yc3AtOejoZPX5XefdVgwyq4z'
  })
  
  
  router.get('/cartsubscription',function (req,res,next){
    // console.log('hello');
        res.render('subscription/final_subscription',{
          actual_total_price:req.query.actual_total_price,
          total_price:req.query.total_price,
          coupon_id:req.query.coupon_id,
          user_id:req.query.user_id,
        });
  });


async function setSubscription(user_id,total_price,actual_total_price,coupon_id,razorpay_payment_id) {
    var query = "SELECT c.*,c.image_path AS order_image,CASE WHEN `category` = 'course' THEN (SELECT `category` FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT `category_id` FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' OR `category` = 'book-videos' THEN (SELECT `category` FROM `books` WHERE `books`.`id` = c.`book_id`) END AS item_category,CASE WHEN `category` = 'course' THEN (SELECT `discount_price` FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN (SELECT `discount_price` FROM `products` WHERE `products`.`id` = c.`product_id`) WHEN `category` = 'book' THEN (SELECT `discount_price` FROM `books` WHERE `books`.`id` = c.`book_id`) WHEN `category` = 'book-videos' THEN (SELECT `only_video_discount_price` FROM `books` WHERE `books`.`id` = c.`book_id`) END AS price,CASE WHEN `category` = 'course' THEN (SELECT `days` FROM `courses` WHERE `courses`.`id` = c.`course_id`) WHEN `category` = 'product' THEN 0 WHEN `category` = 'book' THEN (SELECT `days` FROM `books` WHERE `books`.`id` = c.`book_id`) WHEN `category` = 'book-videos' THEN (SELECT `video_days` FROM `books` WHERE `books`.`id` = c.`book_id`) END AS days,CASE WHEN `category` = 'course' THEN (SELECT `live_id` FROM `courses` WHERE `courses`.`id` = c.`course_id`) ELSE 0 END AS live_id FROM `cart` c WHERE `user_id` = '"+ user_id +"' AND `cart_category` IS NULL";
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
                    var query2 = "INSERT INTO `subscription` (`category`,`user_id`,`course_id`,`end_date`) VALUES ('course','"+ user_id +"','"+ result.course_id +"','"+ end_date.toISOString().slice(0, 19).replace('T', ' ') +"')";
                  } else if(result.category == 'book-videos') {
                    var end_date = new Date(new Date().getTime() + parseInt(result.days) * 24 * 60 * 60 * 1000);
                    var query2 = "INSERT INTO `subscription` (`category`,`user_id`,`book_id`,`end_date`) VALUES ('book-videos','"+ user_id +"','"+ result.book_id +"','"+ end_date.toISOString().slice(0, 19).replace('T', ' ') +"')";
                  } else {
                    var end_date = new Date(new Date().getTime() + parseInt(result.days) * 24 * 60 * 60 * 1000);
                    var query2 = "INSERT INTO `subscription` (`category`,`user_id`,`book_id`,`end_date`) VALUES ('book','"+ user_id +"','"+ result.book_id +"','"+ end_date.toISOString().slice(0, 19).replace('T', ' ') +"')";
                  }
                  pool.query(query2,function(err,results2,fields){
                    if(err) {
                      console.log(err);
                    } else {
                    //   console.log(results2);
                    }
                  });
                  if(result.live_id !=0){
                    var query10 = "INSERT INTO `live_subscription` (`user_id`,`live_id`) VALUES ('"+ user_id +"','"+ result.live_id +"')";
                    pool.query(query10,function(err,results10,fields){
                      if(err) {
                        console.log(err);
                      } else {
                        // console.log(results10);
                      }
                    });
                  }
                }
                if(result.category == 'course'){
                  var query4 = "INSERT INTO `orders` (`order_id`,`payment_status`,`payment_method`,`price`,`paid_price`,`address`,`approved`,`description`,`quantity`,`category`,`course_id`,`user_id`,`image_path`,`pincode`,`coupon_id`) VALUES ('"+ razorpay_payment_id +"','done','online','"+ total_price +"','"+ actual_total_price +"','"+ result.address +"',1,'"+ result.description +"','"+ result.quantity +"','"+ result.category +"','"+ result.course_id +"','"+ user_id +"','"+ result.order_image +"','"+ result.pincode +"','"+ coupon_id +"')";
                } else if(result.category == 'product') {
                  var query4 = "INSERT INTO `orders` (`order_id`,`payment_status`,`payment_method`,`price`,`paid_price`,`address`,`approved`,`description`,`quantity`,`category`,`product_id`,`user_id`,`image_path`,`pincode`,`coupon_id`) VALUES ('"+ razorpay_payment_id +"','done','online','"+ total_price +"','"+ actual_total_price +"','"+ result.address +"',1,'"+ result.description +"','"+ result.quantity +"','"+ result.category +"','"+ result.product_id +"','"+ user_id +"','"+ result.order_image +"','"+ result.pincode +"','"+ coupon_id +"')";
                } else if(result.category == 'book' || result.category == 'book-videos') {
                  var query4 = "INSERT INTO `orders` (`order_id`,`payment_status`,`payment_method`,`price`,`paid_price`,`address`,`approved`,`description`,`quantity`,`category`,`book_id`,`user_id`,`image_path`,`pincode`,`coupon_id`) VALUES ('"+ razorpay_payment_id +"','done','online','"+ total_price +"','"+ actual_total_price +"','"+ result.address +"',1,'"+ result.description +"','"+ result.quantity +"','"+ result.category +"','"+ result.book_id +"','"+ user_id +"','"+ result.order_image +"','"+ result.pincode +"','"+ coupon_id +"')";
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
                const query3 = "DELETE FROM `cart` WHERE `user_id` = '"+ user_id +"' AND `cart_category` IS NULL";
                pool.query(query3,function(err,results5,fields){
                  if(err) {
                    console.log(err);
                  } else {
                    // console.log(results5); 
                    return true;
                    
                  }
                });
              }
            }
          }
        }
      }); 

}
  
  router.post('/complete_payment/:user_id/:total_price/:actual_total_price/:coupon_id',function (req,res,next){
    instance.payments.fetch(req.body.razorpay_payment_id).then((paymentDocument) => {
      // console.log(paymentDocument);
      if (paymentDocument.status == "captured") {
        setSubscription(req.params.user_id,req.params.total_price,req.params.actual_total_price,req.params.coupon_id,req.body.razorpay_payment_id).then((result) => {
            // if(result){
                res.render('subscription/payment-status',{
                    message:'success',
                    messageClass:'alert-success'
                  });
            // }
        }).catch((err)=>{
            console.log(err);
            res.json({
                message : 'some_error_occurred',
            });
        });
      } else {
        res.render('subscription/payment-status',{
          message:'failed',
          messageClass:'alert-danger'
        });
      }
    }).catch((err) => {
        res.render('subscription/payment-status',{
            message:'failed',
            messageClass:'alert-danger'
          });
    });
  });
  
  
module.exports = router;