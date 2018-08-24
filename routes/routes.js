var bodyParser=require('body-parser');
var mongoose=require('mongoose');
var cookieParser=require('cookie-parser');
var moment = require('moment');


//database schemas

var answerSchema=new mongoose.Schema({level:Number,
                                        ans1:String,
                                        ans2:String,
                                        });
var answerModel=mongoose.model('answers',answerSchema);                                        
var userSchema=new mongoose.Schema({name:String,
                                    username:{type:String,unique: true},
                                    email:{type:String,unique: true},
                                    password:String,
                                    date:Date,
                                    level:Number,
                                    college:String})

var userModel=mongoose.model('users',userSchema);

mongoose.connect('mongodb://jagdish123:bryant824@ds125862.mlab.com:25862/kalpana',{ useNewUrlParser: true });

module.exports= function(app,server){
    app.use(bodyParser.urlencoded({extended:true}));
    // index  get route
    app.get('/',function(req,res){
        res.render('index');
    });

    // register  and login get routes 

    app.get('/register',function(req,res){

        res.render('register');
    });

    app.get('/login',function(req,res){

        res.render('login');
    });
    app.get('/logout',function(req,res){
        res.clearCookie('email');
        res.render('logout');
    });

    
    app.get('/about',function(req,res){
        res.render('about');
    });
    //main get req
    app.get('/main',function(req,res){
        var email=req.cookies.email;
        if(email)
        {
        console.log(email+"is email");
        userModel.findOne({'email':email},function(err,data){
            if(err)
            {console.log(err);res.send("404 login again");}
            else
            {   console.log(moment().utcOffset("+05:30").format());
                console.log(Date());
                var level= data.level;
                var username=data.username;
               
                
                res.render('main',{data:data});

            }
        });
    }
    else
    {
        res.render("404",{err:"You are not logged in"})
    }
        


        
    });
    
    
    app.post('/register',function(req,res){
       var d=new Date();
       d.setHours(d.getHours()+5);
       d.setMinutes(d.getMinutes()+30);
      var udata={name:req.body.name,
        username:req.body.username,
        email:req.body.email,
        password:req.body.password,
        date:d,
        level:0,
        college:req.body.college}
        // check if user name or email alredy exist
       
            
                userModel(udata).save(function(err){
                    if(err)
                    res.render('404',{err:"username or Email alredy exist"});
                    else
                    res.render('registered');
                });
                    
                
            
       
        
    });
    
    app.post('/login',function(req,res){
       
        var email=req.body.email;
        var pass=req.body.password;
        console.log(pass)

        userModel.findOne({'email':email,'password':pass},function(err,data){
            if(err)
            console.log(err);
            else
            {   res.cookie('email',email,{maxAge:2*60*60*60*1000,httpOnly:true});
                res.render('logged',{data:data.name});                
                console.log(data.username);
            }

        });
          
          
      });
    
    

      //answer validation 

     app.post('/main',function(req,res){
        var email=req.cookies.email;
        if(email)
        {
        var udata;
        var ulevel;
        
        
        userModel.findOne({'email':email},function(err,data){
            if(err)
            {console.log(err);res.send("404 login again");}
            else
            {   
                udata=data;
                ulevel= data.level;
                //console.log("level is"+ulevel);
                var username=data.username;
                
            }
            answerModel.findOne({level:ulevel},function(err,data){
            
                if(err)
                console.log(err);
                else
                {console.log(data);
                var ans=req.body.ans;
                ans=ans.toLowerCase();
                if(ans==data.ans1||ans==data.ans2)
                {
                    console.log("true");
                    ulevel++;
                   // console.log(ulevel);
                   var d=new Date();
                    d.setHours(d.getHours()+5);
                    d.setMinutes(d.getMinutes()+30)
                    userModel.findOneAndUpdate({'email':email},{$set:{level:ulevel,date:d}},function(err){
                        console.log(err);
                    });
                    res.render("next");
                    
                }
                else
                {
                    userModel.findOne({'email':email},function(err,data){
                        if(err)
                        {console.log(err);res.send("404 login again");}
                        else
                        {   
                            udata=data;
                    res.render('main',{data:data});}
                });
                }
            }
                
            });
            

        });
    }
    else{
        res.render('404',{err:"YOu are not logged in"});
    }
       
       
        


     }); 

     app.get('/leader',function(req,res){
      var q=  userModel.find({}).sort({'level':-1,'date':1}).limit(40);
        q.exec(function(err,data){
            if(err)
            console.log(err);
            else
            {  //console.log({data:data});
                res.render('leader',{data:data});
        }

        })

     });
     
     
     app.get('/answer',function(req,res){
        res.render('answer');


     });
     app.post('/answer',function(req,res){
        var l=req.body.level;
        var a1=req.body.answer;
        var a2=req.body.answer2;
         answerModel({level:l,ans1:a1,ans2:a2}).save(function(err){
            if(err)
            console.log(err);
            else
           { console.log("answer saved");
            res.end("answer saved"+"for level" + l);
        }
        });
       


     });




}