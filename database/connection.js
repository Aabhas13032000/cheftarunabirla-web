var mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit : 100, //important
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'cheftaruna_birla',
    debug    :  false,
    multipleStatements: true
});


pool.getConnection((err,connection)=> {
    if(err){
      console.log('Database not connected');
    }
    else {
      console.log('Database connected successfully');
      connection.release();
    }
});

module.exports = pool;