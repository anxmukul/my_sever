//http web server
const express = require('express')
const cors = require('cors')
var bodyParser = require('body-parser')     //Its a middlewere which take request and put in req.body

const prodDB = {
    host: 'ec2-54-160-161-214.compute-1.amazonaws.com',
    user: 'odeeoirltmupwn',
    password: '1479ce0b28b97770c371b7e2188e2718c304f621e8c1b3d8329545e9eb73faaa',
    database: 'df0jr1cg8fujnk',
    port: 5432
}

const localDB = {
    host: 'localhost',
    user: 'postgres',
    password: 'blah',
    database: 'mukul',
    port: 5432
}

const { Client } = require('pg')
const client = new Client(prodDB)
client.connect()

const app = express()
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = process.env.PORT || 5000

app.get('/', (req, res) => {
    console.log('query paramtere', req.query);
    res.send('<h1>Hello There!</h1><p>Welcome to My ToDo</p>');           //.send send string;
})

app.get('/todo', (req, res) => {
    var sql = 'select * from notes';
    client.query(sql, (err, data) => {             // Sending responce to browser after from db.
        if (err) {
            console.log("Error in reading from DB");
        }
        else {
            console.log(JSON.stringify(data));
            res.send(data.rows);
        }
    });
})
app.post('/todo', (req, res) => {
    console.log(req.body);
    var k = req.body.title;
    var v = req.body.message;
    //res.json({key: 'Welcome to home!'});
    var post_sql = `insert into notes (title, message) values ('${k}', '${v}') returning *`;
    client.query(post_sql, (err, data) => {
        if (err) {
            console.log("Error in inserting into DB", err);
        }
        else {
            res.send(data.rows[0]);
            console.log("Added to DB");
        }
    })
})

app.put('/todo/:name', (req, res) => {
    console.log('path param', req.params);
    console.log(req.body);
    var c = req.params.name;
    var t = req.body.title;
    var m = req.body.message;
    var sql = `update notes set title = '${t}', message = '${m}' where id = ${c} returning *`;
    console.log(sql);
    client.query(sql, (err, data) => {
        if (err) {
            console.log("Error in updating", err);
        }
        else {
            res.json(data.rows[0])
        }
    })
})
app.patch('/todo/:name', (req, res) => {
    // console.log("Params ", req.params);
    var c = req.params.name;
    //console.log(c);
    var a = [];
    a = Object.keys(req.body);
    //console.log(a);
    var sql = "update notes set ";
    for (let index = 0; index < a.length; index++) {
        var u = req.body[`${a[index]}`];
        //console.log(a[index]);
        //console.log(u);
        if (index == a.length - 1) {
            sql += ` ${a[index]} = '${u}' `
        }
        else {
            sql += ` ${a[index]} = '${u}', `
        }
    }
    sql += `where id = ${c} returning *`;
    console.log(sql);
    client.query(sql, (err, data) => {
        if (err) {
            console.log(err);
        }
        else {
            res.send(data.rows[0])
            console.log("Updated Successfully");
        }
    })
})
app.delete('/todo/:name', (req, res) => {
    var c = req.params.name;
    var sql = `delete from notes where id = ${c}`;
    //console.log(sql);
    client.query(sql, (err, data) => {
        if (err) {
            console.log("Error in deleting", err);
        }
        else {
            console.log("Deleted");
            res.send(null);
        }
    })
})
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

console.log('done');
