const { json } = require('express');
//http web server
const express = require('express')
var bodyParser = require('body-parser')     //Its a middlewere which take request and put in req.body
var mysql = require('mysql');
const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = 5000
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "amelia053",
    database: "mukul"
});

app.get('/', (req, res) => {
    console.log('query paramtere', req.query);
    res.send('<h1>Hello There!</h1><p>Welcome to My ToDo</p>');           //.send send string;
})

app.get('/todo', (req, res) => {
    var sql = 'select * from todo';
    //res.database.con.query(sql, myFunction);
    //res.send("<h1>Here are your all ToDo's</h1>");
    con.query(sql, (err, data) => {             // Sending responce to browser after from db.
        if(err){
            console.log("Error in reading from DB");
        }
        else{
            console.log(JSON.stringify(data));
            res.send(data);
        }
    });
})
app.post('/todo', (req, res)=>{
    console.log(req.body);
    var k = req.body.time;
    var v = req.body.message;
    //res.json({key: 'Welcome to home!'});
    var post_sql = `insert into todo (time, message) values ('${k}', '${v}')`;
    con.query(post_sql, (err, body) => {
        if(err){
            console.log("Error in inserting into DB", err);
        }
        else{
            var p = `select * from todo ORDER BY todo_id DESC LIMIT 1`
            con.query(p, (err, data) => {
                if(err){
                    console.log("Coundnot render fron DB", err);
                }
                else{
                    res.json(data[0]);
                }
            })
            console.log("Added to DB");
        }
    })
})
// app.get('/blog/:name', (req, res) => {
//     console.log('path param', req.params);
//     res.json({key: 'Welcome to home!'})     //.json convert to json and send the json;
//   })
app.put('/todo/:name', (req, res) => {
    console.log('path param', req.params);
    console.log(req.body);
    var c = req.params.name;
    var t = req.body.time;
    var m = req.body.message;
    var sql = `update todo set time = '${t}', message = '${m}' where todo_id = ${c}`;
    console.log(sql);
    con.query(sql, (err, data) => {
        if(err){
            console.log("Error in updating", err);
        }
        else{
            console.log("Updated successfully");
            var sql_res = `select * from todo where todo_id = ${c}`;
           // console.log(sql_res);
            con.query(sql_res, (err, data) => {
                if(err){
                    console.log(err);
                }
                else{
                    res.json(data[0]);
                }
            })
        }
    })
   // res.send("Request Accepted");
})
app.patch('/todo/:name', (req, res) => {
  // console.log("Params ", req.params);
   //res.send("Request accepted");
   var c = req.params.name;
   //console.log(c);
   var a = [];
   a = Object.keys(req.body);
   //console.log(a);
   var sql = "update todo set ";
   for (let index = 0; index < a.length; index++) {
       var u = req.body[`${a[index]}`];
        //console.log(a[index]);
       //console.log(u);
       if(index==a.length-1){
        sql+= ` ${a[index]} = '${u}' `
       }
       else{
            sql+= ` ${a[index]} = '${u}', `
       }
    }
    sql += `where todo_id = ${c}`;
       console.log(sql);
       con.query(sql, (err, data) => {
           if(err){
               console.log(err);
           }
           else{
               console.log("Updated Successfully");
           }
       })
   var sql_r = `select * from todo where todo_id = ${c}`;
   con.query(sql_r, (err, data) => {
       if(err){
           console.log(err)
       }
       else{
           res.json(data[0]);
       }
   })
})
// app.post('/blog', (req, res) => {
//     console.log('path param', req.body);
//     res.json({key: 'Welcome to home!'})
//   })

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
con.connect(function(err){
    if(err){
        console.log("Error in connection with database");
    }
    else{
        console.log("Conection Established");
    }
})
console.log('done');