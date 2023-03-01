const path = require('path');
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const encoder = express.urlencoded({
    extended: false 
});

var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');

app.use(cookieParser());

//initialise session middleware - flash express depends on it
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false ,maxAge: 60000 }
  }))

//initialise the flash middleware
app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'root',
    database:'nodejs'
});

connection.connect(function(error){
    if(!!error) console.log(error);
    else console.log('Database Connected!');
})

//set views file
app.set('views',path.join(__dirname,'views'));

//set view engine
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/',(req,res) => {
    let sql = "SELECT * FROM users"
    let query = connection.query(sql,(err,rows) =>{
        if(err) throw err;
        res.render('user_index',{
            title : "Result Management System",
            users : rows
        });
    });
});

//Teacher login
//route to Teacher login page
app.get('/log',(req,res) => {
    res.render('teacher_login', {
        title: 'Result Management System',
        serverError : req.flash('error')
    });
});

//authenticate the teacher and route to welcome page to display the result 
app.post("/loginteach",encoder, function(req,res){
    var teacherid = req.body.teacherid;
    var password = req.body.password;

    connection.query("select * from teachers where  teacherid = ? and password = ?",[teacherid,password] , function(error,results,fields){    
         if(results.length > 0)
         {
            res.redirect('/loginTeacher');
          } 
         else{
            req.flash('error', 'Invalid Username or Password!!');
            res.redirect('/log')
         }
    });
});

//get value from database and show in html table using ExpressJS / MySQL
app.get('/loginTeacher',(req,res) => {
    let sql = "SELECT * FROM users";
    let query = connection.query(sql,(err,rows) => {
        if(err) throw err;
        res.render('student_list',{
            title: 'Result Management System',
            users : rows
        });
    });
});

//route for add student page
app.get('/add',(req,res) => {
    res.render('add_student',{
        title: 'Result Management System',
    });
});

//post value from database and show in html table using ExpressJS / MySQL
app.post('/save',encoder,(req,res) => {
    let data ={roll_number: req.body.roll_number, name: req.body.name, dob: req.body.dob, score: req.body.score};
    let sql ="INSERT INTO users SET ?";
    let query = connection.query(sql,data,(err, results) => {
        if(err) throw err;
        res.redirect('/loginTeacher');
   });
});

//route for edit student page by selecting a particular record to edit
app.get('/edit/:userId',(req,res) => {
   const userId = req.params.userId;
   let sql = "Select * from users where id = '"+userId+"'";
   let query = connection.query(sql,(err, result) => {
       if(err) throw err;
       res.render('edit_student', {
           title: 'Result Management System',
           user : result[0]
       });
   });
});

//post value from database and show in html table using ExpressJS / MySQL
app.post('/update',encoder, (req,res) => {
    const userId = req.body.id;
    let sql ="update users SET roll_number ='" +req.body.roll_number+"', name ='" +req.body.name+"',  dob ='" +req.body.dob+"',  score ='" +req.body.score+"' where id ="+userId;
    let query = connection.query(sql,(err, results) => {
        if(err) throw err;
        res.redirect('/loginTeacher');
    });
});

//Delete record from table
app.get('/delete/:userId',(req,res) => {
    const userId = req.params.userId;
    let sql = "Delete from users where id = '"+userId+"'";
    let query = connection.query(sql,(err, result) => {
        if(err) throw err;
        res.redirect('/loginTeacher');
    });
});    

//route to student login page
app.get('/login',(req,res) => {
    res.render('student_login', {
        title: 'Result Management System',
        serverError : req.flash('error')
    });
});

//authenticate the student and route to student result page to display the result 
app.post("/loginstr",encoder, function(req,res){
    var roll_number = req.body.roll_number;
    var dob = req.body.dob;

    connection.query("select * from users where  roll_number = ? and dob = ?",[roll_number,dob] , function(error,results,fields){
        if(results.length > 0)
        res.render("student_result",{
            title: 'Result Management System',
            user : results[0]
        });
        else{
            req.flash('error', 'Incorrect Roll number or Date of Birth!');
            res.redirect('/login')
         }
    });
});

//Server Listening
app.listen(3000, () => {
    console.log('Server is running at port 3000');
});