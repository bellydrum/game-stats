const express = require('express')
const app = express()
const PORT = 3004

// View engine setup 
app.set('view engine', 'ejs')

// Without middleware 
app.get('/', function(req, res) {
    res.render('index')
})

app.listen(PORT, function(err){
    if (err) console.log(err)
    console.log(`Server listening on PORT ${PORT}`)
})