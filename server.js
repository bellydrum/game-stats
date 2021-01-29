const express = require('express')
const path = require('path')
const app = express()
const PORT = 3004

app.use(express.static(path.join(__dirname, 'public')))

app.listen(PORT, function(err){
    if (err) console.log(err)
    console.log(`Server listening on PORT ${PORT}`)
})