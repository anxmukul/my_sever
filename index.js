//http web server
const express = require('express')
const cors = require('cors')
var bodyParser = require('body-parser')     //Its a middlewere which take request and put in req.body
const jwt = require("jsonwebtoken");
const config = require("./config");

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

verifyToken = (req, res) => {
    let token = req.headers["x-access-token"];
    try {
        const decoded = jwt.verify(token, config.secret)
        console.log(decoded);
        return decoded.id;
    }
    catch (err) {
        return res.status(401).send({
            message: "Unauthorized!"
        });
    }
};

app.get('/', (req, res) => {
    console.log('query paramtere', req.query);
    res.send('<h1>Hello There!</h1><p>Welcome to My ToDo</p>');           //.send send string;
})

app.get('/todo', (req, res) => {
    const userId = verifyToken(req, res);
    console.log('req id is', req.id)
    var sql = `select * from notes where user_id=${userId}`;
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
    const userId = verifyToken(req, res);
    var post_sql = `insert into notes (title, message, user_id) values ('${k}', '${v}', ${userId}) returning *`;
    client.query(post_sql, (err, data) => {
        if (err) {
            console.log("Error in inserting into DB", err);
        }
        else {
            res.status(201);
            res.send(data.rows[0]);
            console.log("Added to DB");
        }
    })
})
app.post('/user', (req, res) => {
    if (req.body.user_name == ' ') {
        res.status(406);
        res.send({
            message: "Invalid Username"
        });
    }
    else if (req.body.password == ' ') {
        res.status(406);
        res.send({
            message: "Invalid Password"
        });
    }
    else {
        var n = req.body.user_name;
        var p = req.body.password;
        var post_sql = `insert into accounts(user_name, password) values('${n}', '${p}') returning *`;
        client.query(post_sql, (err, data) => {
            if (err) {
                console.log("Error while inserting into Database", err);
                if (err.code == 23506) {
                    console.log("User not Exits")
                    res.send(err);
                }
                else {
                    res.send(err);
                }
            }
            else {
                res.send(data.rows);
            }
        })
    }

})
app.get('/user', (req, res) => {
    var n = req.query.user_name;
    var p = req.query.password;
    var post_sql = `select * from accounts where user_name = '${n}' and password = '${p}'`;  //Do i need password check?
    client.query(post_sql, (err, data) => {
        if (err) {
            res.send(err);
        }
        else {
            if (data.rowCount == 0) {
                res.status(404);
                res.send({
                    message: "Not Found"
                });
            }
            else {
                console.log(`Logged in as userid = '${data.rows[0].user_id}'`)
                console.log(data.rows);
                var token = jwt.sign({ id: data.rows[0].user_id }, config.secret, {
                    expiresIn: 86400 // 24 hours
                });
                let result = data.rows[0];
                result.accessToken = token;
                res.send(result)
            }
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
    var c = req.params.name;
    var a = [];
    a = Object.keys(req.body);
    var sql = "update notes set ";
    for (let index = 0; index < a.length; index++) {
        var u = req.body[`${a[index]}`];
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
