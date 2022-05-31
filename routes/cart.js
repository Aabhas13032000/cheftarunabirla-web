const express = require('express');
const router = express.Router();
const pool = require('../database/connection');

async function getCartData(coursecart,productCart,bookCart,bookVideosCart,coupons,userWallet) {
    var coursesum = coursecart.length !=0 ? coursecart[0].totalAmount : 0;
    var productsum = productCart.length !=0 ? productCart[0].totalAmount : 0;
    var booksum = bookCart.length !=0 ? bookCart[0].totalAmount : 0;
    var bookvideossum = bookVideosCart.length !=0 ? bookVideosCart[0].totalAmount : 0;
    var cartvisetotal;
    var courseSingleCouponTotal = [];
    var courseMultipleCouponTotal = '';
    var productSingleCouponTotal = [];
    var productMultipleCouponTotal = '';
    var bookSingleCouponTotal = [];
    var bookMultipleCouponTotal = '';
    var availableCoupons = [];
    var shippingCharges = productCart.filter((element) => element.pincode == '311001');
    var sumTotal = coursesum + productsum + booksum + bookvideossum;
    var paybleAmount = 0 + ( productCart.length !=0 ? shippingCharges ? 0 : 90 : 0);
    var appliedCoupon = '';
    var courseIds = coursecart.map((element) => {
        return element.item_id.toString();
    });
    var productIds = productCart.map((element) => {
        return element.item_id.toString();
    });
    var bookIds = bookCart.map((element) => {
        return element.item_id.toString();
    });

    var cartVise = coupons.find(element => element.linked_category == 'cartvise');

    if(cartVise) {
        if(sumTotal >= cartVise.minimum && sumTotal <= cartVise.maximum){
            cartvisetotal = {
                amount : sumTotal - ((sumTotal*cartVise.dis)/100),
                couponName: cartVise.ccode,
                isApplied: true,
                id:cartVise.id,
                discount:cartVise.dis,
                category:cartVise.linked_category,
            };
            availableCoupons.push(cartvisetotal);
        } else {
            cartvisetotal = {
                amount : sumTotal,
                couponName: cartVise.ccode,
                isApplied: false,
                id:cartVise.id,
                discount:cartVise.dis,
                category:cartVise.linked_category,
            };
        }
    } else {
        cartvisetotal = {
            amount : sumTotal,
            couponName: '',
            isApplied: false,
            id:'',
            discount:0,
            category:'',
        };
    }

    coupons.forEach(coupon => {
        var linkedArray = coupon.linked_array.split(',');
        if(coupon.linked_category == 'course' && coupon.discount_for == 'single') {
            var courseSum = 0;
            coursecart.forEach((course) => {
                if(linkedArray.includes(course.item_id.toString())) {
                    courseSum = (course.discount_price - ((course.discount_price*coupon.dis)/100)) + courseSum;
                } else {
                    courseSum = courseSum + course.discount_price;
                }
            });
            // console.log(`courseSum = ${courseSum}`);
            courseSingleCouponTotal.push({
                amount:courseSum,
                couponName: coupon.ccode,
                isApplied: courseSum < coursesum ? true : false,
                id:coupon.id,
                discount:coupon.dis,
                category:coupon.linked_category,
            });       
        } else if(coupon.linked_category == 'course' && coupon.discount_for == 'multiple') {
            var courseMultipleSum = 0;
            if(linkedArray.every(v => courseIds.includes(v))) {
                courseMultipleSum = (coursesum - ((coursesum*coupon.dis)/100)) + courseMultipleSum;
            } else {
                courseMultipleSum = coursesum;
            }
            // console.log(`courseMultipleSum = ${courseMultipleSum}`);
            courseMultipleCouponTotal = {
                amount:courseMultipleSum,
                couponName: coupon.ccode,
                isApplied: courseMultipleSum < coursesum ? true : false,
                id:coupon.id,
                discount:coupon.dis,
                category:coupon.linked_category,
            }
        } else if(coupon.linked_category == 'product' && coupon.discount_for == 'single') {
            var productSum = 0;
            productCart.forEach((product) => {
                if(linkedArray.includes(product.item_id.toString())) {
                    productSum = (product.discount_price - ((product.discount_price*coupon.dis)/100)) + productSum;
                } else {
                    productSum = productSum + product.discount_price;
                }
            });
            // console.log(`productSum = ${productSum}`);
            productSingleCouponTotal.push({
                amount:productSum,
                couponName: coupon.ccode,
                isApplied: productSum < productsum ? true : false,
                id:coupon.id,
                discount:coupon.dis,
                category:coupon.linked_category,
            });       
        } else if(coupon.linked_category == 'product' && coupon.discount_for == 'multiple') {
            var productMultipleSum = 0;
            if(linkedArray.every(v => productIds.includes(v))) {
                productMultipleSum = (productsum - ((productsum*coupon.dis)/100)) + productMultipleSum;
            } else {
                productMultipleSum = productsum;
            }
            // console.log(`productMultipleSum = ${productMultipleSum}`);
            productMultipleCouponTotal = {
                amount:productMultipleSum,
                couponName: coupon.ccode,
                isApplied: productMultipleSum < productsum ? true : false,
                id:coupon.id,
                discount:coupon.dis,
                category:coupon.linked_category,
            }
        } else if(coupon.linked_category == 'book' && coupon.discount_for == 'single') {
            var bookSum = 0;
            bookCart.forEach((book) => {
                if(linkedArray.includes(book.item_id.toString())) {
                    bookSum = (book.discount_price - ((book.discount_price*coupon.dis)/100)) + bookSum;
                } else {
                    bookSum = bookSum + book.discount_price;
                }
            });
            // console.log(`bookSum = ${bookSum}`);
            bookSingleCouponTotal.push({
                amount:bookSum,
                couponName: coupon.ccode,
                isApplied: bookSum < booksum ? true : false,
                id:coupon.id,
                discount:coupon.dis,
                category:coupon.linked_category,
            });       
        } else if(coupon.linked_category == 'book' && coupon.discount_for == 'multiple') {
            var bookMultipleSum = 0;
            if(linkedArray.every(v => bookIds.includes(v))) {
                bookMultipleSum = (booksum - ((booksum*coupon.dis)/100)) + bookMultipleSum;
            } else {
                bookMultipleSum = booksum;
            }
            // console.log(`bookMultipleSum = ${bookMultipleSum}`);
            bookMultipleCouponTotal = {
                amount:bookMultipleSum,
                couponName: coupon.ccode,
                isApplied: bookMultipleSum < booksum ? true : false,
                id:coupon.id,
                discount:coupon.dis,
                category:coupon.linked_category,
            }
        } 
    });

    var coureSinglemin = Math.min.apply(Math, courseSingleCouponTotal.map(function(element) { return element.amount; }));
    var filteredarray = courseSingleCouponTotal.filter((element) => element.amount == coureSinglemin && element.isApplied == true);

    availableCoupons.push(...filteredarray);

    if(courseMultipleCouponTotal && courseMultipleCouponTotal.isApplied){
        availableCoupons.push(courseMultipleCouponTotal);
    }

    var productSinglemin = Math.min.apply(Math, productSingleCouponTotal.map(function(element) { return element.amount; }));
    var filteredarray = productSingleCouponTotal.filter((element) => element.amount == productSinglemin && element.isApplied == true);

    availableCoupons.push(...filteredarray);

    if(productMultipleCouponTotal && productMultipleCouponTotal.isApplied){
        availableCoupons.push(productMultipleCouponTotal);
    }

    var bookSinglemin = Math.min.apply(Math, bookSingleCouponTotal.map(function(element) { return element.amount; }));
    var filteredarray = bookSingleCouponTotal.filter((element) => element.amount == bookSinglemin && element.isApplied == true);

    availableCoupons.push(...filteredarray);

    if(bookMultipleCouponTotal && bookMultipleCouponTotal.isApplied){
        availableCoupons.push(bookMultipleCouponTotal);
    }

    availableCoupons = availableCoupons.map((element) => {
        if(element.category == 'course') {
            element.totalAmount = element.amount + productsum +booksum + bookvideossum;
            return element;
        } else if(element.category == 'product') {
            element.totalAmount = element.amount + coursesum +booksum + bookvideossum;
            return element;
        } else if(element.category == 'book') {
            element.totalAmount = element.amount + coursesum +productsum +bookvideossum;
            return element;
        } else if(element.category == 'cartvise') {
            element.totalAmount = element.amount;
            return element;
        }
    });

    // console.log(availableCoupons);
    // console.log(minimumPrice);

    if(availableCoupons.length != 0){
        var minPrice = Math.min.apply(Math, availableCoupons.map(function(element) { 
            return element.totalAmount;
        }));
    } else {
        var minPrice = sumTotal;
    }

    var finalCoupon = availableCoupons.filter((element) => element.amount == minPrice);

    // console.log(minPrice);
    // console.log(finalCoupon);

    paybleAmount = minPrice + paybleAmount;
    appliedCoupon = finalCoupon.length != 0 ? finalCoupon[0].id : '';

    return {
        coursecart:coursecart,
        productCart:productCart,
        bookCart:bookCart,
        bookVideosCart:bookVideosCart,
        courseSingleCouponTotal :courseSingleCouponTotal,
        courseMultipleCouponTotal:courseMultipleCouponTotal,
        productSingleCouponTotal:productSingleCouponTotal,
        productMultipleCouponTotal:productMultipleCouponTotal,
        bookSingleCouponTotal:bookSingleCouponTotal,
        bookMultipleCouponTotal:bookMultipleCouponTotal,
        coursesum:coursesum,
        productsum:productsum,
        booksum:booksum,
        bookvideossum:bookvideossum,
        sumTotal:sumTotal,
        cartvisetotal:cartvisetotal,
        paybleAmount:paybleAmount,
        availableCoupons:availableCoupons,
        appliedCouponId:appliedCoupon,
        shippingCharges:(shippingCharges ? 0 : 90),
        wallet : userWallet.length != 0 ? userWallet[0].wallet : 0,
    };
}

/* Get courses by category */
router.get('/getUserCart', function(req, res, next) {
    if(req.headers.token){
        var data = req.query;
        if(data.couponId){
            var coupons = "SELECT * FROM `coupon` WHERE `status` = 1 AND `id` = '"+ data.couponId +"'";
        } else {
            var coupons = "SELECT * FROM `coupon` WHERE `status` = 1";
        }
        var userWallet = "SELECT `wallet` FROM `users` WHERE `id` = '"+ data.user_id +"'";
        var courseCart = "SELECT c.`id`,c.`category`,c.`cart_category`,c.`course_id` AS item_id,c.`quantity`,b.`title` AS name,b.`discount_price`,b.`image_path`,SUM(b.`discount_price`) OVER () AS totalAmount FROM `cart` c ,(SELECT `title`,`discount_price`,`id`,(SELECT `path` FROM `images` WHERE `images`.`course_id` = `courses`.`id` AND `iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `courses`) b WHERE `user_id` = '"+ data.user_id +"' AND b.`id` = c.`course_id` AND `cart_category` IS NULL AND `category` = 'course'";
        var productCart = "SELECT c.`id`,c.`category`,c.`cart_category`,c.`product_id` AS item_id,c.`quantity`,c.`address`,c.`description`,c.`pincode`,c.`image_path`,b.`name`,b.`discount_price`,SUM(b.`discount_price`) OVER () AS totalAmount FROM `cart` c ,(SELECT `name`,`discount_price`,`id` FROM `products`) b WHERE `user_id` = '"+ data.user_id +"' AND b.`id` = c.`product_id` AND `cart_category` IS NULL AND `category` = 'product'";
        var bookCart = "SELECT c.`id`,c.`category`,c.`cart_category`,c.`book_id` AS item_id,c.`quantity`,b.`title`,b.`discount_price`,b.`image_path`,SUM(b.`discount_price`) OVER () AS totalAmount  FROM `cart` c ,(SELECT `title`,`discount_price`,`id`,(SELECT `path` FROM `images` WHERE `images`.`book_id` = `books`.`id` AND `iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `books`) b WHERE `user_id` = '"+ data.user_id +"' AND b.`id` = c.`book_id` AND `cart_category` IS NULL AND `category` = 'book'";
        var bookVideosCart = "SELECT c.`id`,c.`category`,c.`cart_category`,c.`book_id` AS item_id,c.`quantity`,b.`title` AS name,b.`discount_price`,b.`image_path`,SUM(b.`discount_price`) OVER () AS totalAmount  FROM `cart` c ,(SELECT `title`,`discount_price`,`id`,(SELECT `path` FROM `images` WHERE `images`.`book_id` = `books`.`id` AND `iv_category` = 'image' LIMIT 1 OFFSET 0) AS image_path FROM `books`) b WHERE `user_id` = '"+ data.user_id +"' AND b.`id` = c.`book_id` AND `cart_category` IS NULL AND `category` = 'book-videos'";
        pool.query(coupons,function(err,coupons){
            pool.query(courseCart,function(err,courseCart){
                pool.query(productCart,function(err,productCart){
                    pool.query(bookCart,function(err,bookCart){
                        pool.query(bookVideosCart,function(err,bookVideosCart){
                            pool.query(userWallet,function(err,userWallet){
                                getCartData(courseCart,productCart,bookCart,bookVideosCart,coupons,userWallet).then((result) => {
                                    res.json(result);
                                }).catch((err)=>{
                                    console.log(err);
                                    res.json({
                                        message : 'some_error_occurred',
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    } else {
        res.json({
            message : 'Auth_token_failure',
        });
    }
});

module.exports = router;