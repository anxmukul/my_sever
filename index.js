//http web server
const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
    console.log('query paramtere', req.query);
    res.send('Hello World!')
})


app.get('/home', (req, res) => {
  res.send('Welcome to home!')
})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})