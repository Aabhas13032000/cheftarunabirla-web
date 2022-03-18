const { checkCategory,addcategory,getcategories,markedcategoryimportant,deletecategory } = require('../services/category');
const { getgalleryimages,addgalleryImages,getgalleryimpimages } = require('../services/gallery');
const {addbook,getbook,checkbook,getbookimages,deletebook,editbook,getuserbook,getimpbooks,getuserbookbyId,getbookvideos,deletebookvideo,addbookvideos,editbookvideos} = require('../services/books');
const {getproduct,getproductcategories,getproductsubcategories,checkproductcategory,addproductcategory,deleteproductcategory,updateproductcategory,addproduct,deleteproduct,getproductimages,editproduct,getcategoryproduct,getsearchedproduct,geteachproduct,getuserproduct,getproductwithoutoffset,getuserproductbyid} = require('../services/products');
const { getcourse,addcourse,deletecourse,getcourseimages,getcoursepdf,editcourse,getcoursevideos,addcoursevideos,deletecoursevideo,getsearchedcourse,getcategorycourse ,getusercourse,getcoursecategories,updatecoursecategory,getcoursebyId,editcoursevideos,markedcoursecategoryimportant,checkcoursecategory,addcoursecategory,deletecoursecategory,updatecoursecategoryname} = require('../services/course');
const { getcoupons,deletecoupons,addcoupons,editcoupons,getcouponsbycategory } = require('../services/coupons');
const { getslider,addslider,deleteslider,getsliderbycategory,editslider} = require('../services/slider');
const { addblog, getblogs, editblog, deleteblog,getblogimages,getsearchedblogs} =  require('../services/blogs');
const { getusers,updatedevicerequest,getsearchuser } = require('../services/user');
const { getorders } = require('../services/orders')
const { getreviews,addreviews,deletereviews,getreviewsbyitem } = require('../services/reviews');
const { getsubscription,deletesubscription,editsubscription,getsubscriptionusers,addsubscription } = require('../services/subscription');
const { getlive } = require('../services/live');
const { verify } = require('jsonwebtoken');
const { gettestimonials,addtestimonial,deletetestimonial,markedtestimonialimportant,getimptestimonials} =  require('../services/testimonial');
const accessTokenSecret = 'youraccesstokensecret';

module.exports = {
    getLive: (req,res) => {
        getlive((err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getTestimonials: (req,res) => {
        gettestimonials((err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getImpTestimonials: (req,res) => {
        getimptestimonials((err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    addTestimonial: (req,res) => {
        addtestimonial(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({message:'Book added successfully'});
            }
        });
    },
    deleteTestimonial: (req,res) => {
        deletetestimonial(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({message:'Book added successfully'});
            }
        });
    },
    markedTestimonialImportant: (req,res) => {
        markedtestimonialimportant(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getOrders: (req,res) => {
        getorders(req.params,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getSubscription: (req,res) => {
        getsubscription(req.params,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getSubscriptionUsers: (req,res) => {
        getsubscriptionusers((err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    deleteSubscription: (req,res) => {
        deletesubscription(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({message:'Book added successfully'});
            }
        });
    },
    addSubscription: (req,res) => {
        addsubscription(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({message:'Book added successfully'});
            }
        });
    },
    editSubscription: (req,res) => {
        editsubscription(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getReviews: (req,res) => {
        getreviews(req.params,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getReviewsByItem: (req,res) => {
        getreviewsbyitem(req.params,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    addReviews: (req,res) => {
        addreviews(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    deleteReviews: (req,res) => {
        deletereviews(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getGalleryImages: (req,res) => {
        getgalleryimages(req.params,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getGalleryImpImages: (req,res) => {
        getgalleryimpimages(req.params,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    deleteCategory: (req,res) => {
        deletecategory(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    markedCategoryImportant: (req,res) => {
        markedcategoryimportant(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getCategories: (req,res) => {
        getcategories((err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    checkingCategory: (req,res) => {
        checkCategory(req.params.name,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    addCategory: (req,res) => {
        addcategory(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({message:'Category added successfully'});
            }
        })
    },
    addGalleryImages: (req,res) => {
        verify(req.session.token,accessTokenSecret,(err,decoded) => {
            console.log(err);
            if(!err) {
                req.body.user_id = decoded.user_id;
                addgalleryImages(req.body,(err,results) => {
                    if(err) {
                        console.log(err);
                        res.json({message:'Database connection error !!'});
                    } else {
                        // console.log(results);
                        res.json({message:'Images added successfully'});
                    }
                })
            }
        });
    },
    addBook: (req,res) => {
        // console.log(req.body);
        addbook(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({message:'Book added successfully'});
            }
        });
    },
    getBook: (req,res) => {
        getbook((err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    checkBook: (req,res) => {
        checkbook(req.params.name,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getBookImages: (req,res) => {
        getbookimages(req.params.id,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getUserBook: (req,res) => {
        getuserbook(req.params,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getUserBookbyId: (req,res) => {
        getuserbookbyId(req.params,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getImpBooks: (req,res) => {
        getimpbooks((err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    deleteBook: (req,res) => {
        deletebook(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    editBook: (req,res) => {
        editbook(req.body,req.params.id,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getBookVideos: (req,res) => {
        getbookvideos(req.params.id,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    addBookVideos: (req,res) => {
        addbookvideos(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    editBookVideos: (req,res) => {
        editbookvideos(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    deleteBookVideo: (req,res) => {
        deletebookvideo(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({message:'Book added successfully'});
            }
        });
    },
    getProducts: (req,res) => {
        getproduct(req.params.offset,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getProductWithoutOffset: (req,res) => {
        getproductwithoutoffset((err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getCategoryProduct: (req,res) => {
        getcategoryproduct(req.params,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getSearchedProduct: (req,res) => {
        getsearchedproduct(req.params,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getUserProduct: (req,res) => {
        getuserproduct(req.params,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getUserProductById: (req,res) => {
        getuserproductbyid(req.params,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getProductCategories: (req,res) => {
        getproductcategories((err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getEachProduct: (req,res) => {
        geteachproduct(req.params,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getProductSubCategories: (req,res) => {
        getproductsubcategories(req.params.category_id,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    checkProductCategory: (req,res) => {
        checkproductcategory(req.params.name,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    addProductCategory: (req,res) => {
        addproductcategory(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({message:'Category added successfully'});
            }
        })
    },
    deleteProductCategory: (req,res) => {
        deleteproductcategory(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    updateProductCategory: (req,res) => {
        updateproductcategory(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    addProduct: (req,res) => {
        // console.log(req.body);
        addproduct(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({message:'Book added successfully'});
            }
        });
    },
    deleteProduct: (req,res) => {
        deleteproduct(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getProductImages: (req,res) => {
        getproductimages(req.params.id,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    editProduct: (req,res) => {
        editproduct(req.body,req.params.id,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getCourse: (req,res) => {
        getcourse((err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getUserCourse: (req,res) => {
        getusercourse(req.params,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getCourseById: (req,res) => {
        getcoursebyId(req.params,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    markedCourseCategoryImportant: (req,res) => {
        markedcoursecategoryimportant(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    addCourse: (req,res) => {
        // console.log(req.body);
        addcourse(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({message:'Book added successfully'});
            }
        });
    },
    deleteCourse: (req,res) => {
        deletecourse(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getCourseImages: (req,res) => {
        getcourseimages(req.params.id,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getCategoryCourse: (req,res) => {
        getcategorycourse(req.params,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getSearchedCourse: (req,res) => {
        getsearchedcourse(req.params,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getCourseVideos: (req,res) => {
        getcoursevideos(req.params.id,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    addCourseVideos: (req,res) => {
        addcoursevideos(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    editCourseVideos: (req,res) => {
        editcoursevideos(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getCoursePdf: (req,res) => {
        getcoursepdf(req.params.id,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    editCourse: (req,res) => {
        editcourse(req.body,req.params.id,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getCourseCategories: (req,res) => {
        getcoursecategories((err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    updateCourseCategory: (req,res) => {
        updatecoursecategory(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    updateCourseCategoryName: (req,res) => {
        updatecoursecategoryname(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    checkCourseCategory: (req,res) => {
        checkcoursecategory(req.params.name,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    addCourseCategory: (req,res) => {
        addcoursecategory(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({message:'Category added successfully'});
            }
        })
    },
    deleteCourseCategory: (req,res) => {
        deletecoursecategory(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getCoupons: (req,res) => {
        getcoupons((err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getCouponsByCategory: (req,res) => {
        getcouponsbycategory(req.params,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    deleteCoupons: (req,res) => {
        deletecoupons(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    addCoupons: (req,res) => {
        addcoupons(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({message:'Book added successfully'});
            }
        });
    },
    editCoupons: (req,res) => {
        editcoupons(req.body,req.params.id,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    deleteCourseVideo: (req,res) => {
        deletecoursevideo(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({message:'Book added successfully'});
            }
        });
    },
    getSlider: (req,res) => {
        getslider((err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getSliderByCategory: (req,res) => {
        getsliderbycategory(req.params,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    addSlider: (req,res) => {
        addslider(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({message:'Book added successfully'});
            }
        });
    },
    editSlider: (req,res) => {
        editslider(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    deleteSlider: (req,res) => {
        deleteslider(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({message:'Book added successfully'});
            }
        });
    },
    getBlogs: (req,res) => {
        getblogs((err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getSearchedBlogs: (req,res) => {
        getsearchedblogs(req.params,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    addBlog: (req,res) => {
        addblog(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({message:'Book added successfully'});
            }
        });
    },
    editBlog: (req,res) => {
        editblog(req.body,req.params.id,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({message:'Book added successfully'});
            }
        });
    },
    deleteBlog: (req,res) => {
        deleteblog(req.body,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({message:'Book added successfully'});
            }
        });
    },
    getBlogImages: (req,res) => {
        getblogimages(req.params.id,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getUsers: (req,res) => {
        getusers(req.params,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    updateDeviceRequest: (req,res) => {
        updatedevicerequest(req.params,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
    getSearchUser: (req,res) => {
        getsearchuser(req.params,(err,results) => {
            if(err) {
                console.log(err);
                res.json({message:'Database connection error !!'});
            } else {
                // console.log(results);
                res.json({data:results});
            }
        });
    },
}