const express=require('express');
const app= express();
const bodyParser=require('body-parser');
const routes=require('./routes/routes');
var cookieParser=require('cookie-parser');


//starting the server
const server=app.listen(3000||process.env.PORT);


//setting the middleware
app.set('view engine','ejs');
var bp=app.use(bodyParser.urlencoded({extended:true}));
app.use('/assets',express.static('assets'));
app.use(cookieParser());

routes(app,server);

