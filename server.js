const express = require('express')
const app = express()
const PORT = 3004

// serve static files from /public
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', function(req, res) {
    res.render('index')
})

app.listen(PORT, function(err){
    if (err) console.log(err)
    console.log(`Server listening on PORT ${PORT}`)
})