const express = require('express');
const router = express.Router();
// const fs = require('fs');
// var requests = require('requests');
const https = require('https');
var http = require("http");
// var io = require("socket.io")(express());
const mp4Url = 'https://tarunabirlavidios.s3.us-east-2.amazonaws.com/29+PIZZA/0+PROMO.mp4';
// const ufs = require("url-file-size");

router.get('/', (req, res) => {
//   const rststrem = fs.createReadStream()
    res.render('pages/video/video');
});

router.get('/video',(req,res)=> {
    https.get(mp4Url, (stream) => {
        const range = req.headers.range;
        console.log(range);
        if (!range) {
            res.status(400).send("Requires Range header");
        }
        console.log(stream.headers['content-length']);        
        var videoSize = parseInt(stream.headers['content-length']);
        const CHUNK_SIZE = 200 ** 6; // 1MB
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
        const contentLength = end - start + 1;
        const headers = {
            "content-range": `bytes ${start}-${end}/${videoSize}`,
            "accept-ranges": "bytes",
            "content-length": contentLength,
            "content-type": "video/mp4",
        };
        res.writeHead(206, headers);

        // console.log(videosize);
        // console.log(stream);

        // stream.on('data',function(chunk){
        //     res.write(chunk);
        // })

        // stream.on('error',function(chunk){
        //     res.end();
        // })
        
        stream.pipe(res);
    });
});


module.exports = router;
