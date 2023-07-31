const express = require('express')
const app = express()
require('dotenv').config()
const path = require('path')
const bodyParser = require('body-parser')
_=require('underscore')
const expressSession = require('express-session')
const cookieParser = require('cookie-parser')


app.use(bodyParser.urlencoded({
    extended:true
}))

app.use(expressSession({
    secret: "MYS3CR3TK3Y",
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: true
}));
app.use(cookieParser())
const jwt = require('./middleware/auth')
app.use(jwt.authJwt)

const logRegApiRouter = require('./routes/logreg.routes')

app.use('/api',logRegApiRouter)

require(path.join(__dirname,'./config/database'))()

app.listen(process.env.PORT,()=>{
    console.log(`server is running at @http://127.0.0.1:${process.env.PORT}`);
})
