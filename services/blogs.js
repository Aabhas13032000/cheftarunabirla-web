const pool = require('../database/connection');

module.exports ={
    getblogs : (data,callback) => {
        const query = "SELECT * FROM `blog` WHERE `status` = 1 LIMIT 20 OFFSET "+ data.offset +"";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    getsearchedblogs : (data,callback) => {
        const query = "SELECT * FROM `blog` WHERE `status` = 1 AND `title` LIKE '%"+ data.value +"%'";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
    addblog : (data,callback) => {
        var images_array = [];
        if(typeof (Object.entries(data)[2])[1] != 'string'){
            images_array = (Object.entries(data)[2])[1];
        } else {
            images_array.push((Object.entries(data)[2])[1]);
        }
        const query  = "INSERT INTO `blog` (`title`,`description`,`path`,`pdf`) VALUES ('"+ data.title +"','"+ data.description +"','"+ images_array[0] +"','"+ data.pdf +"')";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                for(var i=0;i<images_array.length;i++) {
                    var query  = "INSERT INTO `images` (`path`,`iv_category`,`category`,`blog_id`) VALUES ('"+ images_array[i] +"','image','blog','"+ results.insertId +"')";
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
    deleteblog : (data,callback) => {
        const query2  = "UPDATE `blog` SET `status` = 0  WHERE `id` = '"+ data.id +"'";
        pool.query(query2,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });            
    },
    editblog : (data,id,callback) => {
        const query2  = "UPDATE `blog` SET `title` = '"+ data.title +"',`description` = '"+ data.description +"' WHERE `id` = '"+ id +"'";
        pool.query(query2,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });        
        
    },
    getblogimages : (data,callback) => {
        const query  = "SELECT * FROM `images` WHERE `blog_id` = '"+ data +"'";
        pool.query(query,function(err,results,fields){
            if(err) {
                callback(err);
            } else {
                callback(null,results);
            }
        });
    },
}