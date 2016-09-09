 var express    = require("express");
 var mysql      = require('mysql');
 var email   = require("emailjs/email");
 var htmlToPdf = require('html-to-pdf');
 // var pdf = require('html-pdf');
 var email   = require("emailjs/email");
 var connection = mysql.createConnection({
   host     : 'localhost',
   user     : 'root',
   password : 'admin',
   database : 'scorecarddb'
 });
var bodyParser = require('body-parser');
var app = express();

app.use(express.static('app'));
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get('/', function (req, res) {
   res.sendFile("app/index.html" );
})

app.post('/checkschool-card',  urlencodedParser,function (req, res)
{
    var id={"id":req.query.username};
    connection.query('SELECT name from md_school where id in (select school_id from md_employee where ?) ',[id],
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
    }
    else
      console.log(err);
});
});

//check the role of user
app.post('/rolecheck-service',  urlencodedParser,function (req, res)
{
  var id={"id":req.query.username};
  var username={"id":req.query.username};
  var password={"password":req.query.password};
  // connection.query('select id,role_name from md_role where id in (select role_id from md_employee where ? and ? )',[id,password],
  var qur="select mr.id,mr.role_name,(select name from md_school where id=me.school_id) as name,me.school_id "+
  "from md_role mr join md_employee me on(mr.id=me.role_id) "+
  "where me.id='"+req.query.username+"' and password='"+req.query.password+"'";

  console.log('.............role.....................');
  console.log(qur);
  connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    { 
      console.log(err);     
      res.status(200).json({'returnval': 'invalid'});
    }
    }
    else
      console.log(err);
    
  });
});


//select the username and password from login table
app.post('/login-card',  urlencodedParser,function (req, res)
{
  var id={"id":req.query.username};
  var username={"id":req.query.username};
  var password={"password":req.query.password};
  var schoolid={school_id:req.query.schoolid};
  connection.query('SELECT name as uname,  school_id as school,(select name from md_school where id=school) as name ,(select address from md_school where id=school) as addr  from md_employee where ? and ? and ? and ?',[id,username,password,schoolid],
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    { 
      console.log(err);     
      res.status(200).json({'returnval': 'invalid'});
    }
    }
    else
      console.log(err);
    
  });
});

//changing teachers password
app.post('/changepassword-service',  urlencodedParser,function (req, res)
{
  
  var username={"id":req.query.username};
  var oldpassword={"password":req.query.oldpassword};
  var newpassword={"password":req.query.newpassword};
  connection.query('UPDATE md_employee SET ? WHERE ? and ?',[newpassword,username,oldpassword],
    function(err,result)
    {
      console.log('..............result..............');
      console.log(result.affectedRows);
    if(!err)
    {  
      if(result.affectedRows>0)  
      res.status(200).json({'returnval': 'Password changed!'});
    
    else
    {
      console.log(err);     
      res.status(200).json({'returnval': 'Password not changed!'});
    }
    }
    else
      console.log(err);
    
  });
});


//Function to select the assesment type id
app.post('/assesmenttype-service',  urlencodedParser,function (req, res)
{
  var schoolid={"id":req.query.schoolid};
  var assesmentname={"assesment_name":req.query.assesmentname};  
  connection.query('SELECT * from md_assesment_type where ?',[assesmentname],
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      res.status(200).json({'returnval': 'invalid'});
    }
    }
    else
      console.log(err);
  });
});


//fetching grade info
app.post('/term-service',  urlencodedParser,function (req, res)
{
  var qur="select term_name from md_term where term_id in(select term_id from mp_assesment_term where assesment_id=(select assesment_id from md_assesment_type where assesment_name='"+req.query.termtype+"'))";

  connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
    }
    else
      console.log(err);
  });
});

//fetching grade info
app.post('/grade-service',  urlencodedParser,function (req, res)
{
  var schoolid={school_id:req.query.schoolid};
  var loggedid={id:req.query.loggedid};
  var roleid={role_id:req.query.roleid};
  // console.log(roleid);
  // var qur="select grade_name from md_grade where grade_id in(select grade_id from mp_teacher_grade where id='"+loggedid+"')";
  if(req.query.roleid=='subject-teacher')
  {
    var qur="select grade_name from md_grade where grade_id "+
  "in(select grade_id from mp_teacher_grade where "+
  "school_id='"+req.query.schoolid+"' and id='"+req.query.loggedid+"' and role_id='"+req.query.roleid+"')";
  }
  else if(req.query.roleid=='class-teacher')
  {
    var qur="select grade_name from md_grade where grade_id "+
    "in(select grade_id from mp_teacher_grade where "+
    "school_id='"+req.query.schoolid+"' and id='"+req.query.loggedid+"' and role_id='"+req.query.roleid+"')";
  }
   else if(req.query.roleid=='co-ordinator')
  {
    var qur="select grade_name from md_grade where grade_id "+
    "in(select grade_id from mp_teacher_grade where "+
    "school_id='"+req.query.schoolid+"' and id='"+req.query.loggedid+"' and role_id='"+req.query.roleid+"')";
  }
  else if(req.query.roleid=='headmistress')
  {
    var qur="select grade_name from md_grade where grade_id "+
    "in(select grade_id from mp_teacher_grade where "+
    "school_id='"+req.query.schoolid+"')";
  }
   else if(req.query.roleid=='principal')
  {
    var qur="select grade_name from md_grade where grade_id "+
    "in(select grade_id from mp_teacher_grade where "+
    "school_id='"+req.query.schoolid+"')";
  }

  console.log('-------------------grade----------------------');
  console.log(qur);

  // connection.query('select grade_name from md_grade where grade_id in(select grade_id from mp_teacher_grade where ? and ? and ?)',[roleid,schoolid,loggedid],
    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
    }
    else
      console.log(err);
  });
});

//fetching section info
app.post('/section-service',  urlencodedParser,function (req, res)
{  
   if(req.query.roleid=='subject-teacher')
  {
    var qur="select * from md_section where section_id in "+
    "(select section_id from mp_teacher_grade where "+
    "school_id='"+req.query.schoolid+"' and role_id='"+req.query.roleid+"' "+
    "and id='"+req.query.loggedid+"' and grade_id=(select grade_id from md_grade "+
    "where grade_name='"+req.query.gradename+"')) and school_id='"+req.query.schoolid+"'";
  }
  else if(req.query.roleid=='class-teacher')
  {
    var qur="select * from md_section where section_id in "+
    "(select section_id from mp_teacher_grade where "+
    "school_id='"+req.query.schoolid+"' and role_id='"+req.query.roleid+"' "+
    "and id='"+req.query.loggedid+"' and grade_id=(select grade_id from md_grade "+
    "where grade_name='"+req.query.gradename+"')) and school_id='"+req.query.schoolid+"'";
  }
   else if(req.query.roleid=='co-ordinator')
  {
    var qur="select * from md_section where section_id in "+
    "(select section_id from mp_teacher_grade where "+
    "grade_id=(select grade_id from mp_teacher_grade where "+
    "school_id='"+req.query.schoolid+"' and id='"+req.query.loggedid+"' and role_id='"+req.query.roleid+"')) and school_id='"+req.query.schoolid+"'";
  }
  else if(req.query.roleid=='headmistress')
  {
    var qur="select * from md_section where section_id in "+
    "(select section_id from mp_teacher_grade where "+
    "grade_id in(select grade_id from mp_teacher_grade where grade_id=(select grade_id from md_grade "+
    "where grade_name='"+req.query.gradename+"') and "+
    "school_id='"+req.query.schoolid+"')) and school_id='"+req.query.schoolid+"'";
  }
   else if(req.query.roleid=='principal')
  {
    var qur="select * from md_section where section_id in "+
    "(select section_id from mp_teacher_grade where "+
    "grade_id in(select grade_id from mp_teacher_grade where grade_id=(select grade_id from md_grade "+
    "where grade_name='"+req.query.gradename+"') and "+
    "school_id='"+req.query.schoolid+"')) and school_id='"+req.query.schoolid+"'";
  }


  console.log('-------------------section----------------------');
  console.log(qur);
  // var qur="select * from md_section where section_id in(select section_id from mp_teacher_grade where school_id='"+req.query.schoolid+"' and role_id='"+req.query.roleid+"' and id='"+req.query.loggedid+"' and grade_id=(select grade_id from scorecarddb.md_grade where grade_name='"+req.query.gradename+"'))";
  connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
    }
    else
      console.log(err);
  });
});

//fetching section info
app.post('/subject-service',  urlencodedParser,function (req, res)
{

   if(req.query.roleid=='subject-teacher')
  {
    var qur="select * from md_subject where subject_id in "+
  "(select subject_id from mp_teacher_grade where "+
  "school_id='"+req.query.schoolid+"' and id='"+req.query.loggedid+"' and role_id='"+req.query.roleid+"' and "+
  "grade_id=(select grade_id from md_grade where grade_name='"+req.query.gradename+"') and "+
  "section_id=(select section_id from md_section where section_name='"+req.query.section+"' and school_id='"+req.query.schoolid+"')) "+
  "and subject_category in('"+req.query.subjectcategory+"')";
  }
  else if(req.query.roleid=='class-teacher')
  {
    var qur="select * from md_subject where subject_id in "+
    "(select subject_id from mp_grade_subject where grade_id "+
    "in(select grade_id from mp_teacher_grade where "+
    "school_id='"+req.query.schoolid+"' and id='"+req.query.loggedid+"' and role_id='"+req.query.roleid+"') "+
    "and subject_category in('"+req.query.subjectcategory+"')) ";
  }
   else if(req.query.roleid=='co-ordinator')
  {
    var qur="select * from md_subject where subject_id in "+
    "(select subject_id from mp_grade_subject where grade_id "+
    "in(select grade_id from mp_teacher_grade where "+
    "school_id='"+req.query.schoolid+"' and id='"+req.query.loggedid+"' and role_id='"+req.query.roleid+"'))";
  }
  else if(req.query.roleid=='headmistress')
  {
    var qur="select * from md_subject where subject_id in "+
    "(select subject_id from mp_grade_subject where "+
    "grade_id in('g1','g2','g3','g4'))";
  }
   else if(req.query.roleid=='principal')
  {
    var qur="select * from md_subject where subject_id in "+
    "(select subject_id from mp_grade_subject)";
  }

  console.log('-------------------subject----------------------');
  console.log(qur);

  // var qur="select subject_name from md_subject where subject_id in(select subject_id from mp_grade_subject where term_id=(select assesment_id from md_assesment_type where assesment_name='"+req.query.termtype+"') and grade_id=(select grade_id from md_grade where grade_name='"+req.query.gradename+"'))";
  // console.log(qur);
  /*if(req.query.roleid=='subject-teacher'){
  var qur="select * from md_subject where subject_id in "+
  "(select subject_id from mp_teacher_grade where school_id='"+req.query.schoolid+"' and id='"+req.query.loggedid+"' and role_id='"+req.query.roleid+"' and "+
  "grade_id=(select grade_id from md_grade where grade_name='"+req.query.gradename+"') and "+
  "section_id=(select section_id from md_section where section_name='"+req.query.section+"')) and subject_category='"+req.query.subjectcategory+"' and subject_id not in('s16','s17','s20')";
  }
  if(req.query.roleid=='class-teacher'){
   var qur="select * from md_subject where subject_id in "+
  "(select subject_id from mp_teacher_grade where school_id='"+req.query.schoolid+"' and id='"+req.query.loggedid+"' and "+
  "grade_id=(select grade_id from md_grade where grade_name='"+req.query.gradename+"') and "+
  "section_id=(select section_id from md_section where section_name='"+req.query.section+"')) and subject_category='"+req.query.subjectcategory+"'"; 
  }*/
   // console.log(qur);
  connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
    }
    else
      console.log(err);
  });
});

//fetching category info
app.post('/category-service',  urlencodedParser,function (req, res)
{
  //var qur="select subject_category_name from md_subject where subject_id in(select subject_id from mp_grade_subject where term_id=(select assesment_id from md_assesment_type where assesment_name='"+req.query.termtype+"') and grade_id=(select grade_id from md_grade where grade_name='"+req.query.gradename+"'))";
  // console.log(qur);
var qur="select subject_category_name from md_subject_category where subject_category_id in(select distinct subject_category_id from scorecarddb.md_grade_subject_category_mapping"+
" where term_id=(select assesment_id from md_assesment_type where assesment_name='"+req.query.termtype+"') and"+
" grade_id=(select grade_id from md_grade where grade_name='"+req.query.gradename+"') and"+
" subject_id=(select subject_id from md_subject where subject_name='"+req.query.subject+"'))";
// console.log(qur);
  connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
    }
    else
      console.log(err);
  });
});


//fetching subcategory info
app.post('/subcategory-service',  urlencodedParser,function (req, res)
{
var qur="select subject_sub_category_name from md_subject_sub_category where subject_sub_category_id in(select distinct subject_sub_category_id from md_grade_subject_category_mapping where term_id=(select assesment_id from md_assesment_type where assesment_name='"+req.query.termtype+"') and grade_id=(select grade_id from md_grade where grade_name='"+req.query.gradename+"') and subject_id=(select subject_id from md_subject where subject_name='"+req.query.subject+"') and subject_category_id=(select subject_category_id from md_subject_category where subject_category_name='"+req.query.category+"'))";
    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
    }
    else
      console.log(err);
  });
});

//fetching teachers assesment card info
app.post('/assesment-service',  urlencodedParser,function (req, res)
{
  var qur="select assesment_cyclename from md_assesment_cycle where assesment_cycleid in(select assesment_cycleid from mp_assesment_term_cycle where assesment_id=(select assesment_id from md_assesment_type where assesment_name='"+req.query.termtype+"') and term_id=(select term_id from md_term where term_name='"+req.query.termname+"'))";
  connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
    }
    else
      console.log(err);
  });
});
app.post('/fetchstudentbeginner-service',  urlencodedParser,function (req, res)
{
  var qur="select school_id,id,student_name,class_id  from md_student where  class_id="+
"(select class_id   from mp_grade_section where grade_id=(select grade_id "+
"from md_grade where grade_name='"+req.query.gradename+"') and section_id=(select "+
"section_id from md_section where section_name='"+req.query.section+"' and school_id='"+req.query.schoolid+"')) and "+
"school_id='"+req.query.schoolid+"' and id not in(select student_id from tr_beginner_assesment_marks where class_id=(select class_id  from mp_grade_section where grade_id=(select grade_id from md_grade where grade_name='"+req.query.gradename+"') and section_id=(select section_id from md_section where section_name='"+req.query.section+"' and school_id='"+req.query.schoolid+"')) and school_id='"+req.query.schoolid+"' and subject_id='"+req.query.subject+"')";
 connection.query(qur,
    function(err, rows)
    {
    if(!err)
    { 
      // console.log(JSON.stringify(rows));   
     res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }  

  });
});

app.post('/fetchstudentforhealth-service',  urlencodedParser,function (req, res)
{
  var qur="select school_id,id,student_name,class_id  from md_student where  class_id="+
"(select class_id   from mp_grade_section where grade_id=(select grade_id "+
"from md_grade where grade_name='"+req.query.gradename+"') and section_id=(select "+
"section_id from md_section where section_name='"+req.query.section+"' and school_id='"+req.query.schoolid+"')) and "+
"school_id='"+req.query.schoolid+"' and id not in(select student_id from tr_term_health where  grade='"+req.query.gradename+"' and  section='"+req.query.section+"' and school_id='"+req.query.schoolid+"')";
 connection.query(qur,
    function(err, rows)
    {
    if(!err)
    { 
      // console.log(JSON.stringify(rows));   
     res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }  

  });
});



app.post('/fetchstudentforattendance-service',  urlencodedParser,function (req, res)
{
  var qur="select school_id,id,student_name,class_id  from md_student where  class_id="+
"(select class_id   from mp_grade_section where grade_id=(select grade_id "+
"from md_grade where grade_name='"+req.query.gradename+"') and section_id=(select "+
"section_id from md_section where section_name='"+req.query.section+"' and school_id='"+req.query.schoolid+"')) and "+
"school_id='"+req.query.schoolid+"' and id not in(select student_id from tr_term_attendance where academic_year='"+req.query.academicyear+"' and term_id='"+req.query.termname+"' and  grade='"+req.query.gradename+"' and  section='"+req.query.section+"' and school_id='"+req.query.schoolid+"')";
 connection.query(qur,
    function(err, rows)
    {
    if(!err)
    { 
      // console.log(JSON.stringify(rows));   
     res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }  

  });
});


app.post('/fetchstudentreportforattendance-service',  urlencodedParser,function (req, res)
{
  var qur="select student_id as id ,student_name,attendance,working_days,speccomment,generic from tr_term_attendance where academic_year='"+req.query.academicyear+"' and term_id='"+req.query.termname+"' and  grade='"+req.query.gradename+"' and  section='"+req.query.section+"' and school_id='"+req.query.schoolid+"'";
 connection.query(qur,
    function(err, rows)
    {
    if(!err)
    { 
      // console.log(JSON.stringify(rows));   
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }  

  });
});

app.post('/fetchstudentreportforhealth-service',  urlencodedParser,function (req, res)
{
  var qur="select student_id as id,student_name,grade,section,height,weight,blood_group,vision_left,vision_right,dental from tr_term_health where  grade='"+req.query.gradename+"' and  section='"+req.query.section+"' and school_id='"+req.query.schoolid+"'";
 connection.query(qur,
    function(err, rows)
    {
    if(!err)
    { 
      // console.log(JSON.stringify(rows));   
     res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }  

  });
});

app.post('/fetchstudbeginnerreport-service',  urlencodedParser,function (req, res)
{
  var qur="select *,(select student_name from md_student where id=student_id) as student_name from tr_beginner_assesment_marks where class_id=(select class_id  from mp_grade_section where grade_id=(select grade_id from md_grade where grade_name='"+req.query.gradename+"') and section_id=(select section_id from md_section where section_name='"+req.query.section+"' and school_id='"+req.query.schoolid+"')) and school_id='"+req.query.schoolid+"' and subject_id='"+req.query.subject+"'";
 connection.query(qur,
    function(err, rows)
    {
    if(!err)
    { 
      // console.log(JSON.stringify(rows));   
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }  

  });
});




//fetching student info
app.post('/fetchstudent-service',  urlencodedParser,function (req, res)
{
var qurcheck="select * from tr_term_assesment_import_marks where school_id='"+req.query.schoolid+"' and "+
"grade='"+req.query.gradename+"' and section='"+req.query.section+"' and academic_year='"+req.query.academicyear+"' "+
" and term_name='"+req.query.termname+"' and assesment_id='"+req.query.assesment+"' and subject='"+req.query.subject+"' and flag in(0,1)";
var qur="select * from tr_student_to_subject "+
"where  class_id="+
"(select class_id from mp_grade_section where grade_id=(select grade_id "+
"from md_grade where grade_name='"+req.query.gradename+"') and section_id=(select "+
"section_id from md_section where section_name='"+req.query.section+"' and school_id='"+req.query.schoolid+"') and "+
"subject_id=(select subject_id from md_subject where subject_name='"+req.query.subject+"') and "+
"school_id='"+req.query.schoolid+"')";
var qur1="select school_id,student_id as id,student_name,class_id "+
"from tr_student_to_subject "+
"where  class_id="+
"(select class_id from mp_grade_section where grade_id=(select grade_id "+
"from md_grade where grade_name='"+req.query.gradename+"') and section_id=(select "+
"section_id from md_section where section_name='"+req.query.section+"' and school_id='"+req.query.schoolid+"') and "+
"subject_id=(select subject_id from md_subject where subject_name='"+req.query.subject+"') and "+
"school_id='"+req.query.schoolid+"' and student_id not in(select student_id from tr_term_assesment_marks where  grade='"+req.query.gradename+"' and section ='"+req.query.section+"' and school_id='"+req.query.schoolid+"' and subject_id='"+req.query.subject+"' and assesment_id='"+req.query.assesment+"' and term_name='"+req.query.termname+"'))";
var qur2="select school_id,id,student_name,class_id from md_student where  class_id="+
"(select class_id from mp_grade_section where grade_id=(select grade_id "+
"from md_grade where grade_name='"+req.query.gradename+"') and section_id=(select "+
"section_id from md_section where section_name='"+req.query.section+"' and school_id='"+req.query.schoolid+"') and "+
"school_id='"+req.query.schoolid+"')";

  console.log(qurcheck);
  console.log('............................................'); 
  console.log(qur);
  console.log('............................................'); 
  console.log(qur1); 
  console.log('............................................'); 
  console.log(qur2);     
  console.log('............................................'); 


connection.query(qurcheck,function(err, rows){
  console.log(rows.length);
if(rows.length==0){
connection.query(qur,
  function(err, rows)
  {
    if(!err)
    {
      if(rows.length>0){console.log('qur1');

       connection.query(qur1,function(err, rows){
       if(rows.length>0) 
        res.status(200).json({'returnval': rows});
       else
        res.status(200).json({'returnval': 'invalid'});
      });
      }
      else
      {
        console.log('qur2');
       connection.query(qur2,function(err, rows){
       if(rows.length>0) 
       {
        console.log(rows);
        res.status(200).json({'returnval': rows});
        
       }
       else
       {
        console.log('no');
        res.status(200).json({'returnval': 'invalid'});
        }
      });
      }
    }
    else
      console.log(err);
  
});
}
else
res.status(200).json({'returnval': 'imported'});
});

});


// fetchmarkexiststudentinfo-service

//Storing marks for assesment
app.post('/insertbamark-service',  urlencodedParser,function (req, res)
{  
  var response={
         school_id:req.query.schoolid,   
         academic_year:req.query.academicyear,
         assesment_id:req.query.assesmentid,
         class_id:req.query.classid,
         subject_id:req.query.subject,
         student_id:req.query.studentid,
         category_id:req.query.category,
         mark:req.query.mark,
         score:req.query.score,
         grade:req.query.grade                       
  }
  var checkqur="SELECT * FROM tr_beginner_assesment_marks WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' "+
  " and assesment_id='"+req.query.assesmentid+"' and subject_id='"+req.query.subject+"' and category_id='"+req.query.category+"' and "+
  "class_id='"+req.query.classid+"' and student_id='"+req.query.studentid+"'";
  var updatequr="UPDATE tr_beginner_assesment_marks SET ? WHERE school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' "+
  " and assesment_id='"+req.query.assesmentid+"' and subject_id='"+req.query.subject+"' and category_id='"+req.query.category+"' and "+
  "class_id='"+req.query.classid+"' and student_id='"+req.query.studentid+"'";
  console.log('.............................checkqur.............................');
  console.log(checkqur);
  console.log('..................................................................');
  connection.query(checkqur,function(err, rows)
    {
    if(!err){
    if(rows.length>0){
    connection.query(updatequr,[response],function(err, rows){
    if(!err)
      res.status(200).json({'returnval': 'succ'});
    else
      res.status(200).json({'returnval': 'fail'});
    });
    }
    else{
    connection.query("INSERT INTO tr_beginner_assesment_marks set ?",[response],
    function(err, rows)
    {
    if(!err)
    {    
      res.status(200).json({'returnval': 'succ'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }
    });
    }
    }
    else
      console.log(err);
    });
});


//fetching grade
app.post('/fetchgrade-service',  urlencodedParser,function (req,res)
{  
  // var qur="SELECT grade FROM MD_GRADE_RATING WHERE lower_limit<='"+req.query.score+"' and higher_limit>='"+req.query.score+"'";
  var qur="SELECT * FROM md_grade_rating";
  connection.query(qur,
    function(err, rows)
    {
    if(!err)
    { 
      // console.log(JSON.stringify(rows));   
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }  

  });
});

//Storing marks for assesment
app.post('/insertassesmentmark-service',  urlencodedParser,function (req, res)
{ 
  var response={
         school_id:req.query.schoolid,
         academic_year:req.query.academicyear,   
         assesment_id:req.query.assesmentid,
         term_name:req.query.termname,
         class_id:req.query.classid,
         student_id:req.query.studentid,
         student_name:req.query.studentname,         
         grade:req.query.grade,
         section:req.query.section,
         subject_id:req.query.subject,
         category:req.query.category,
         sub_category:req.query.subcategory,
         mark:req.query.mark,
         flag:req.query.absflag,
         sub_cat_sequence:req.query.subcatseq                 
  }
  var cond1={school_id:req.query.schoolid};
  var cond2={academic_year:req.query.academicyear};
  var cond3={assesment_id:req.query.assesmentid};
  var cond4={term_name:req.query.termname};
  var cond5={class_id:req.query.classid};
  var cond6={student_id:req.query.studentid};
  var cond7={subject_id:req.query.subject};
  var cond8={category:req.query.category};
  var cond9={sub_category:req.query.subcategory};
  var subname={subject_name:req.query.subject};
  var mark={mark:req.query.mark};

  connection.query("SELECT subject_category FROM md_subject where ?",[subname],
  function(err, rows)
  {
  response.subject_category=rows[0].subject_category;
  connection.query("SELECT * FROM tr_term_assesment_marks WHERE ? and ? and ? and ? and ? and ? and ? and ? and ?",[cond1,cond2,cond3,cond4,cond5,cond6,cond7,cond8,cond9],
    function(err, rows) {
  if(rows.length==0){
  connection.query("INSERT INTO tr_term_assesment_marks set ?",[response],
  function(err, rows)


    {
    if(!err)
    {    
      res.status(200).json({'returnval': 'succ'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }
  });
  }
  else{
   connection.query("UPDATE tr_term_assesment_marks SET ? WHERE ? and ? and ? and ? and ? and ? and ? and ? and ?",[mark,cond1,cond2,cond3,cond4,cond5,cond6,cond7,cond8,cond9],function(err, rows) {
    if(!err){
      res.status(200).json({'returnval': 'succ'});
    }
    else{
      res.status(200).json({'returnval': 'fail'});
    }
   }); 
  }
  // else
    // res.status(200).json({'returnval': 'Duplicate entry!'});
  // });
});
});
});

//Storing overall marks for the assesment
app.post('/overalltermmarkinsert-service',  urlencodedParser,function (req, res){

  var qur="INSERT INTO tr_term_assesment_overall_marks SELECT school_id,academic_year,assesment_id,term_name,student_id,subject_id,category,sum(mark) as total, "+
  "sum(mark)/count(*) as rtotal,grade,section from tr_term_assesment_marks where academic_year='"+req.query.academicyear+"' "+
  "and school_id='"+req.query.schoolid+"' and term_name='"+req.query.termname+"' and assesment_id='"+req.query.assesmentid+"' "+
  "and grade='"+req.query.grade+"' and section='"+req.query.section+"' and subject_id='"+req.query.subject+"' "+
  "group by school_id,academic_year,assesment_id,term_name,subject_id,grade,section,category,student_id";

  connection.query(qur,
  function(err, rows){
     if(!err)
    {    
      res.status(200).json({'returnval': 'succ'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }
  });
});


//storing overall scholastic mark
app.post('/overalltermassesmentinsert-service',  urlencodedParser,function (req, res){

var qur=" INSERT INTO tr_term_assesment_overall_assesmentmarks SELECT school_id,academic_year,"+
"term_name,student_id,subject_id,category,sum(rtotal) as total,"+ 
"sum(rtotal)/count(*) as average,"+
"(SELECT grade from md_grade_rating where lower_limit<=round((sum(rtotal)/count(*)),2) && higher_limit>=round((sum(rtotal)/count(*)),2)) as term_cat_grade,grade,section from tr_term_assesment_overall_marks where "+
"academic_year='"+req.query.academicyear+"' "+
"and school_id='"+req.query.schoolid+"' and term_name='"+req.query.termname+"' "+
"and grade='"+req.query.grade+"' and section='"+req.query.section+"' and subject_id='"+req.query.subject+"' "+
"group by school_id,academic_year,term_name,subject_id,category,student_id";
 
  connection.query(qur,
  function(err, rows){
    if(!err)
    {    
      res.status(200).json({'returnval': 'succ'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }
  });  
});

//storing mark for coscholastic assessment
app.post('/insertcoassesmentmark-service',  urlencodedParser,function (req, res){

var response={ 
 
         school_id:req.query.schoolid,
         academic_year:req.query.academicyear,
         assessment_id:req.query.assesmentid,
         term_name:req.query.termname,
         class_id:req.query.classid,
         student_id:req.query.studentid,
         student_name:req.query.studentname,         
         grade:req.query.grade,
         section:req.query.section,
         subject_id:req.query.subject,
         grade:req.query.grade,
         section:req.query.section,         
         sub_category:req.query.subcategory,
         mark:req.query.mark,         
         category_grade:req.query.categorygrade
  }  
  
  var subname={subject_name:req.query.subject};
  connection.query("SELECT subject_category FROM md_subject where ?",[subname],
  function(err, rows)
  {
  response.subject_category=rows[0].subject_category;  
  connection.query("INSERT INTO tr_coscholastic_assesment_marks set ?",[response],
  function(err, rows)
    {
    if(!err)
    {    
      res.status(200).json({'returnval': 'succ'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }
  });
  });
});

//storing overall coscholastic mark
app.post('/overallinsertcoassesment-service',  urlencodedParser,function (req, res){
   var response={
         school_id:req.query.schoolid,
         academic_year:req.query.academicyear,
         assesment_id:req.query.assesmentid,
         term_name:req.query.termname,         
         student_id:req.query.studentid,
         student_name:req.query.studentname,         
         subject_id:req.query.subject,
         type:req.query.type,
         category:req.query.category,         
         total:req.query.total,
         rtotal:req.query.rtotal,
         grade:req.query.grade                
  }
  var subname={subject_name:req.query.subject};
  connection.query("SELECT subject_category FROM md_subject where ?",[subname],
  function(err, rows)
  {
  response.subject_category=rows[0].subject_category; 
  connection.query("INSERT INTO tr_term_co_assesment_overall_marks set ?",[response],
  function(err, rows){
     if(!err)
    {    
      res.status(200).json({'returnval': 'succ'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }
  
  });
  });
});

//storing mark for coscholastic assessment
app.post('/insertcocurricularmark-service',  urlencodedParser,function (req, res){

var response={ 
 
         school_id:req.query.schoolid,
         academic_year:req.query.academicyear,
         assessment_id:req.query.assesmentid,
         term_name:req.query.termname,
         class_id:req.query.classid,
         student_id:req.query.studentid,
         student_name:req.query.studentname,         
         grade:req.query.grade,
         section:req.query.section,
         subject_id:req.query.subject,
         grade:req.query.grade,
         section:req.query.section,         
         sub_category:req.query.subcategory,
         mark:req.query.mark,         
         category_grade:req.query.categorygrade
  }  
  
  var subname={subject_name:req.query.subject};
  connection.query("SELECT subject_category FROM md_subject where ?",[subname],
  function(err, rows)
  {  
  response.subject_category=rows[0].subject_category;
  
  connection.query("INSERT INTO tr_cocurricular_term_marks set ?",[response],
  function(err, rows)
    {
    if(!err)
    {    
      res.status(200).json({'returnval': 'succ'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }
  });
  });
});

//storing overall coscholastic mark
app.post('/overallinsertcocurricularmark-service',  urlencodedParser,function (req, res){
   var response={
         school_id:req.query.schoolid,
         academic_year:req.query.academicyear,
         assesment_id:req.query.assesmentid,
         term_name:req.query.termname,         
         student_id:req.query.studentid,
         student_name:req.query.studentname,         
         subject_id:req.query.subject,
         type:req.query.type,
         category:req.query.category,         
         total:req.query.total,
         rtotal:req.query.rtotal,
         grade:req.query.grade                
  }
  var subname={subject_name:req.query.subject};  
  connection.query("SELECT subject_category FROM md_subject where ?",[subname],
  function(err, rows)
  {
  response.subject_category=rows[0].subject_category; 
  connection.query("INSERT INTO tr_cocurricular_overallterm_marks set ?",[response],
  function(err, rows){
     if(!err)
    {    
      res.status(200).json({'returnval': 'succ'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }
  
  });
  });
});


//fetching student names
app.post('/scorecardreadyness-service',  urlencodedParser,function (req,res)
{   

var qur="select * from md_grade_subject_count where no_of_subjects=(( "+
"select count(distinct(subject_id)) from tr_term_assesment_overall_assesmentmarks where "+
"school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and "+
"grade='"+req.query.grade+"' and section='"+req.query.section+"')/"+
"(select count(distinct(term_name)) from tr_term_assesment_overall_assesmentmarks where "+
"school_id='"+req.query.schoolid+"' and academic_year='"+req.query.academicyear+"' and "+
"grade='"+req.query.grade+"' and section='"+req.query.section+"')) and school_id='"+req.query.schoolid+"' and "+
"academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and section='"+req.query.section+"'";
console.log('.........................score card-----------------------------------');
console.log(qur);

  connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {  
      if(rows.length>0)
      res.status(200).json({'returnval': 'match'});
      else
      res.status(200).json({'returnval': 'mismatch'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }  

  });
});

//fetching student names
app.post('/fetchstudname-service',  urlencodedParser,function (req,res)
{   
  var schoolid={school_id:req.query.schoolid};
  var gradeid={grade_id:req.query.grade};
  var sectionid={section_id:req.query.section};

  var qur="SELECT * FROM md_student where class_id=(select class_id from mp_grade_section where grade_id=(select grade_id from md_grade where grade_name='"+req.query.grade+"') and section_id=(select section_id from md_section where section_name='"+req.query.section+"'))";
  connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {  
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }  

  });
});     

//fetch the Life SKill SUb category
app.post('/fetchlifeskill',  urlencodedParser,function (req,res)
{  
  var type=req.query.termtype;
  // console.log(type);
  // var qur="SELECT grade FROM MD_GRADE_RATING WHERE lower_limit<='"+req.query.score+"' and higher_limit>='"+req.query.score+"'";
 
  connection.query( "SELECT * FROM md_coscholastic_metrics where sub_category=?",[type],
    function(err, rows)
    {
    if(!err)
    { 
      // console.log(JSON.stringify(rows));   

      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }  

  });
});


//fetching student info
app.post('/fetchstudinfo-service',  urlencodedParser,function (req,res)
{   
  var schoolid={school_id:req.query.schoolid};
  var studid={id:req.query.studid};
  var qur="select (select grade_name from md_grade where grade_id="+
  "(select grade_id from mp_grade_section where class_id=s.class_id)) grade,"+
  "(select section_name from md_section where section_id="+
  "(select section_id from mp_grade_section where class_id=s.class_id)) section,"+
  "s.id,p.student_id,s.student_name,p.parent_name,p.email,p.mobile,p.address1 "+
  "from md_student s join parent p on(s.id=p.student_id) and s.id='"+req.query.studid+"' and s.school_id='"+req.query.schoolid+"'";

  console.log(qur);
  connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {       
      global.studentinfo=rows; 
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }  

  });
});

//fetching subject info
app.post('/fetchsubjectname-service',  urlencodedParser,function (req,res)
{   
  var schoolid={school_id:req.query.schoolid};
  var studid={student_id:req.query.studid};
  var qur="select subject_id,subject_name,subject_category from md_subject where subject_id in"+
  "(select subject_id from mp_grade_subject where grade_id="+
  "(select grade_id from mp_grade_section where class_id="+
  "(select class_id from md_student where id='"+req.query.studid+"' "+
  "and school_id='"+req.query.schoolid+"') and school_id='"+req.query.schoolid+"')) order by subject_category";

  connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {       
      global.subjectinfo=rows;
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }  

  });
});

//fetching mark
app.post('/fetchmark-service',  urlencodedParser,function (req,res)
{   
  var schoolid={school_id:req.query.schoolid};
  var studid={student_id:req.query.studid};  
  connection.query("SELECT * FROM tr_term_assesment_overall_marks WHERE ? AND ? order by subject_id",[studid,schoolid],
    function(err, rows)
    {
    if(!err)
    {       
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }  
  });
});

//fetchscholasticmark-service
app.post('/fetchscholasticmark-service',  urlencodedParser,function (req,res)
{   
  var schoolid={school_id:req.query.schoolid};
  var studid={student_id:req.query.studid}; 
  var academicyear={academic_year:req.query.academicyear};  
  var qur="SELECT * FROM tr_term_assesment_overall_assesmentmarks am join "+
  "md_grade_descriptor gd on(am.category=gd.category) WHERE school_id='"+req.query.schoolid+"' AND academic_year='"+req.query.academicyear+"' AND student_id='"+req.query.studid+"' and am.term_cat_grade=gd.grade and "+
  "am.subject_id=gd.subject_name";
  console.log('.........................Score card....................................');
  console.log(qur);
  connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {       
      global.scholasticinfo=rows;
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }  
  });
});

//fetchcoscholasticmark-service
app.post('/fetchcoscholasticmark-service',  urlencodedParser,function (req,res)
{   
  var schoolid={school_id:req.query.schoolid};
  var studid={student_id:req.query.studid}; 
  var academicyear={academic_year:req.query.academicyear};  

  connection.query("SELECT * FROM tr_term_co_assesment_overall_marks WHERE ? AND ? AND ? order by subject_id",[studid,schoolid,academicyear],
    function(err, rows)
    {
    if(!err)
    {
      global.coscholasticinfo=rows;       
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }  

  });
});

//fetchcocurricularmark-service
app.post('/fetchcocurricularmark-service',  urlencodedParser,function (req,res)
{   
  var schoolid={school_id:req.query.schoolid};
  var studid={student_id:req.query.studid}; 
  var academicyear={academic_year:req.query.academicyear};  

  connection.query("SELECT * FROM tr_cocurricular_overallterm_marks WHERE ? AND ? AND ? order by subject_id",[studid,schoolid,academicyear],
    function(err, rows)
    {
    if(!err)
    {  
      global.cocurricularinfo=rows;     
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }  

  });
});

//term attendance
app.post('/insertattendance-service',  urlencodedParser,function (req,res)
{   
  var response={
         school_id: req.query.schoolid, 
         academic_year: req.query.academicyear,         
         term_id:req.query.termname,
         class_id:req.query.classid,
         student_id:req.query.studentid,
         student_name:req.query.studentname,         
         attendance:req.query.attendance,
         working_days:req.query.workingdays,
         generic:req.query.generic,
         speccomment:req.query.specific,
         grade:req.query.grade,
         section:req.query.section                 
  } 
  var qur="SELECT * FROM tr_term_attendance where school_id='"+req.query.schoolid+"' and "+
  "academic_year='"+req.query.academicyear+"' and term_id='"+req.query.termname+"' and class_id='"+req.query.classid+"' and "+
  "student_id='"+req.query.studentid+"'";

  // console.log(qur);
  
connection.query(qur,
function(err, rows)
{
  if(rows.length==0){ 
  connection.query("INSERT INTO tr_term_attendance SET ?",[response],
    function(err, rows)
    {
    if(!err)
    {       
      res.status(200).json({'returnval': 'succ'});
    }
    else
    {
      console.log("error in insert......"+err);
      res.status(200).json({'returnval': 'fail'});
    }  

  });
}
else
{
  connection.query("UPDATE tr_term_attendance SET ? where school_id='"+req.query.schoolid+"' and "+
  "academic_year='"+req.query.academicyear+"' and term_id='"+req.query.termname+"' and class_id='"+req.query.classid+"' and "+
  "student_id='"+req.query.studentid+"'",[response],
    function(err, rows)
    {
    if(!err)
    {       
      res.status(200).json({'returnval': 'succ'});
    }
    else
    {
      console.log("error in update......"+err);
      res.status(200).json({'returnval': 'fail'});
    }  

  });
}
});
});

//term health
app.post('/inserthealth-service',  urlencodedParser,function (req,res)
{   
  var response={
         school_id: req.query.schoolid, 
         academic_year: req.query.academicyear,         
         term_id:req.query.termname,
         class_id:req.query.classid,
         student_id:req.query.studentid,
         student_name:req.query.studentname,         
         height:req.query.height,
         weight:req.query.weight,
         grade:req.query.grade,
         section:req.query.section,
         blood_group:req.query.bloodgroup,
         vision_left:req.query.visionleft,                          
         vision_right:req.query.visionright,
         dental:req.query.dental
  }  
connection.query("select* from tr_term_health where student_id='"+req.query.studentid+"' and academic_year='"+req.query.academicyear+"' and term_id='"+req.query.termname+"' and school_id='"+req.query.schoolid+"'",
  function(err, rows)
    {
      if(rows.length==0)
      {
  connection.query("INSERT INTO tr_term_health SET ?",[response],
    function(err, rows)
    {
    if(!err)
    {       
      res.status(200).json({'returnval': 'succ'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }  

  });
  }
  else
  {
    connection.query("update tr_term_health SET ? where student_id='"+req.query.studentid+"' and academic_year='"+req.query.academicyear+"' and term_id='"+req.query.termname+"' and school_id='"+req.query.schoolid+"' ",[response],
    function(err, rows)
    {
    if(!err)
    {       
      res.status(200).json({'returnval': 'succ'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }  

  });

  }
});

});


//fetchhealthattendanceinfo
app.post('/fetchhealthattendanceinfo-service',  urlencodedParser,function (req,res)
{   
  var schoolid={school_id:req.query.schoolid};
  var studid={student_id:req.query.studid};  
  var academicyear={academic_year:req.query.academicyear}; 
  var qur="select * from tr_term_attendance ta join tr_term_health th on(ta.student_id=th.student_id)"+
  " where ta.student_id='"+req.query.studid+"' "+
  "and ta.school_id='"+req.query.schoolid+"' and  ta.academic_year='"+req.query.academicyear+"'";
  // console.log(qur);
  connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {  
      global.healthattendanceinfo=rows;     
      res.status(200).json({'returnval': rows});

    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }  

  });
});

//fetchcoscholasticinfo
app.post('/fetchcoscholasticmetrics-service',  urlencodedParser,function (req,res)
{   
  var schoolid={school_id:req.query.schoolid};
  var studid={student_id:req.query.studid};  
  var qur="SELECT * FROM tr_coscholastic_assesment_marks where school_id='"+req.query.schoolid+"' and student_id='"+req.query.studid+"'";
  // console.log(qur);
  connection.query(qur,
     function(err, rows)
    {
    if(!err)
    {       
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }  
});
});

//fetch the name for performance report

app.post('/nameforonetofourreport-service',  urlencodedParser,function (req,res)
{   
  var schoolid={school_id:req.query.schoolid};

  connection.query("SELECT id,student_name FROM md_student WHERE ?",[schoolid],
    function(err, rows)
    {
    if(!err)
    {       
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }  

  });
});

//fetchcoscholasticinfo
app.post('/fetchcoscholasticinfo-service',  urlencodedParser,function (req,res)
{   
  var schoolid={school_id:req.query.schoolid};
  var studid={student_id:req.query.studid};  
  // var qur="SELECT subject_id,round((sum(mark)/count(subject_id))/10,1) as mark FROM tr_coscholastic_assesment_marks where school_id='"+req.query.schoolid+"' and student_name='"+req.query.studname+"' group by subject_id ";
  var qur="SELECT subject_id,sub_category,round(mark/10) as mark FROM tr_coscholastic_assesment_marks where school_id='"+req.query.schoolid+"' and student_id='"+req.query.studid+"' group by subject_id,sub_category";
  // console.log(qur);
  connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {       

      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }  

});
});

app.post('/onetofourreport-service',  urlencodedParser,function (req,res)
{   
  var schoolid={school_id:req.query.schoolid};
  var id={student_id:req.query.student_id}
  

  connection.query("SELECT subject_id,term_name, count(mark) as cnt, category, sum(mark) as val  FROM tr_term_assesment_marks WHERE ? and ? group by category,term_name,subject_id",[schoolid,id],
    function(err, rows)
    {
    if(!err)
    {      
    console.log(rows); 
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }  

  });
});



app.post('/fetchstudentreport-service',  urlencodedParser,function (req, res)
{

  var qur="select * from tr_term_assesment_marks where  grade='"+req.query.gradename+"' and section ='"+req.query.section+"' and school_id='"+req.query.schoolid+"' and subject_id='"+req.query.subject+"' and assesment_id='"+req.query.assesment+"' and term_name='"+req.query.termname+"'";
  console.log('----------------------------------------fetchreport----------');
  console.log(qur);
  connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    { 

      
      res.status(200).json({'returnval': rows});
      
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
    }
    else
      console.log(err);
  });
});

app.post('/fetchworkingdays-service',  urlencodedParser,function (req, res)
{
  var qur="select * from md_workingdays where ? and ? and ? and ?";
  console.log(qur);
  var academicyear={academic_year:req.query.academicyear};
  var schoolid={school_id:req.query.schoolid};
  var termname={term_name:req.query.termname};
  var type={type:req.query.type};
  // console.log(req.query.academicyear+" "+req.query.schoolid+" "+req.query.termname+" "+req.query.type);
  connection.query(qur,[academicyear,schoolid,termname,type],
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
    }
    else
      console.log(err);
  });
});


app.post('/updateimportmarkcheck-service' ,  urlencodedParser,function (req, res)
{
var qur;
if(req.query.subject=='Hindi'||req.query.subject=='Kannada'){
qur="SELECT CASE WHEN count1 = count2 THEN 'match' ELSE 'mismatch' END as result FROM(SELECT "+
"(select count(distinct(student_id)) from tr_term_assesment_marks "+
"where school_id='"+req.query.schoolid+"' and grade='"+req.query.gradename+"' and section='"+req.query.sectionname+"' "+
"and subject_id='"+req.query.subject+"' and term_name='"+req.query.termname+"' and assesment_id='"+req.query.assesmentid+"') AS count1, "+
"(select count(*) from tr_student_to_subject where school_id='"+req.query.schoolid+"' and class_id=(select class_id from mp_grade_section where grade_id=(select grade_id "+
"from md_grade where grade_name='"+req.query.gradename+"') and section_id=(select "+
"section_id from md_section where section_name='"+req.query.sectionname+"') and subject_id="+
"(SELECT subject_id from md_subject where subject_name='"+req.query.subject+"') and school_id='"+req.query.schoolid+"')) AS count2)  AS counts";
}
else{
qur="SELECT CASE WHEN count1 = count2 THEN 'match' ELSE 'mismatch' END as result FROM(SELECT "+
"(select count(distinct(student_id)) from tr_term_assesment_marks "+
"where school_id='"+req.query.schoolid+"' and grade='"+req.query.gradename+"' and section='"+req.query.sectionname+"' "+
"and subject_id='"+req.query.subject+"' and term_name='"+req.query.termname+"' and assesment_id='"+req.query.assesmentid+"') AS count1, "+
"(select count(*) from md_student where school_id='"+req.query.schoolid+"' and class_id=(select class_id from mp_grade_section where grade_id=(select grade_id "+
"from md_grade where grade_name='"+req.query.gradename+"') and section_id=(select "+
"section_id from md_section where section_name='"+req.query.sectionname+"' and school_id='"+req.query.schoolid+"'))) AS count2)  AS counts";
}
console.log('----------------------------------------------------------');
console.log(qur);
  connection.query(qur,
      function(err, rows)
      {
    if(!err)
    {
      if(rows.length>0)
      {
      res.status(200).json({'returnval': rows});
      }
      else
      {
      res.status(200).json({'returnval': 'invalid'});
      }
    }
    else
    {
      console.log('No data Fetched'+err);
    }
    });
});


app.post('/updateimportmark-service' ,  urlencodedParser,function (req, res)
{
    var data={
      school_id:req.query.schoolid,
      grade:req.query.gradename,
      section:req.query.sectionname,
      academic_year: req.query.academicyear,
      term_name:req.query.termname,
      assesment_id:req.query.assesmentid,
      subject:req.query.subject,
      flag:0
    };
    var qur="select * from tr_term_assesment_import_marks where school_id='"+req.query.schoolid+"' and "+
    "grade='"+req.query.gradename+"' and section='"+req.query.sectionname+"' and academic_year='"+req.query.academicyear+"' "+
    " and term_name='"+req.query.termname+"' and assesment_id='"+req.query.assesmentid+"' and subject='"+req.query.subject+"' and flag=0";
    console.log('...............update import..........');
    console.log(qur);
    connection.query(qur,
     function(err, rows)
      {
      if(!err)
      {
        console.log();
      if(rows.length>0)
      {
        res.status(200).json({'returnval': 'exist'});
      }
      else{ 
      connection.query('insert into tr_term_assesment_import_marks set ?',[data],
      function(err, rows)
      {
      if(!err)
      {
      res.status(200).json({'returnval': 'succ'});
      }
    else
    {
      console.log('No data Fetched'+err);
    }
});
  }
}
else
console.log(err);
});
  });



app.post('/updateflag-service' ,  urlencodedParser,function (req, res)
{
    
 var qur="update tr_term_assesment_import_marks set flag='"+req.query.flag+"' where school_id='"+req.query.schoolid+"' and grade='"+req.query.gradename+"' and  section='"+req.query.sectionname+"' and academic_year='"+req.query.academicyear+"' and term_name='"+req.query.termname+"' and assesment_id='"+req.query.assesmentid+"'  and subject='"+req.query.subject+"'";
      connection.query(qur,
        function(err, rows)
        {
        if(!err)
    {
      if(rows.length>0)
      {

      res.status(200).json({'returnval': rows});
      }
      else
      {
      res.status(200).json({'returnval': 'invalid'});
      }
    }
    else
    {
      console.log('No data Fetched'+err);
    }
});
  });
app.post('/approvemark-service',  urlencodedParser,function (req, res)
{

  var qur="select * from tr_term_assesment_import_marks where flag='"+req.query.flag+"' and school_id='"+req.query.schoolid+"'";
  
  connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
    }
    else
      console.log(err);
  });
});


app.post('/fetchimportmark-service',  urlencodedParser,function (req, res)
{

  var qur="select * from tr_term_assesment_marks where  grade='"+req.query.gradename+"'and section ='"+req.query.section+"' and school_id='"+req.query.schoolid+"' and subject_id='"+req.query.subject+"' and assesment_id='"+req.query.assesment+"' and term_name='"+req.query.term+"' order by CAST(sub_cat_sequence AS UNSIGNED)";
  //console.log(qur);
  connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
    }
    else
      console.log(err);
  });
});


app.post('/updatemark-service' ,  urlencodedParser,function (req, res)
{
  // console.log('come');
  var qur="update tr_term_assesment_marks set mark='"+req.query.mark+"' where school_id='"+req.query.schoolid+"' and subject_id='"+req.query.subject+"' and assesment_id='"+req.query.assesment+"' and term_name='"+req.query.term+"' and academic_year='"+req.query.academic+"' and category='"+req.query.category+"' and sub_category='"+req.query.sub_category+"' and student_id='"+req.query.studid+"'";
      connection.query(qur,
        function(err, rows)
        {
        if(!err)
    {
      console.log('s');
    }
    else
    {
      console.log('No data Fetched'+err);
    }
  });
});


app.post('/fetchtermmarkforreport-service' ,  urlencodedParser,function (req, res)
{
  
    // var qur="select term_name,assesment_id,student_id,(SELECT grade FROM MD_GRADE_RATING WHERE "+
    // "lower_limit<=round(avg(rtotal),2) and higher_limit>=round(avg(rtotal),2)) as term_grade,"+
    // "subject_id from tr_term_assesment_overall_marks where subject_id='EVS' and school_id='SCH001' "+ 
    // "and academic_year='"+req.query.academicyear+"' and grade='"+req.query.grade+"' and section='"+req.query.section+"' "+
    // "group by subject_id,term_name,assesment_id,student_id ";

    var qur="select ta.term_name,ta.assesment_id,ta.student_id,(SELECT grade FROM MD_GRADE_RATING WHERE "+
"lower_limit<=round(avg(ta.rtotal),2) and higher_limit>=round(avg(ta.rtotal),2)) as term_grade,"+
"ta.subject_id,ba.grade as beginner_grade from tr_term_assesment_overall_marks ta "+
"join tr_beginner_assesment_marks ba on(ta.subject_id=ba.subject_id) "+
"where ta.subject_id='"+req.query.subject+"' and ta.school_id='"+req.query.schoolid+"' and ta.academic_year='"+req.query.academicyear+"' "+
"and ta.grade='"+req.query.grade+"' and ta.section='"+req.query.section+"' "+
"group by ta.subject_id,ta.term_name,ta.assesment_id,ta.student_id ";

// console.log(qur);
    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      console.log('yessssssssssssssssssssss');
      res.status(200).json({'returnval': rows});
    }
    else
    {
      // console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
    }
    else
      console.log(err);
});
});


app.post('/fetchbeginnermarkforreport-service' ,  urlencodedParser,function (req, res)
{  
    var qur="select ta.term_name,ta.assesment_id,(SELECT grade FROM MD_GRADE_RATING WHERE "+
    "lower_limit<=round(avg(ta.rtotal),2) and higher_limit>=round(avg(ta.rtotal),2)) as term_grade, "+
    "ta.subject_id,ba.grade as beginner_grade from tr_term_assesment_overall_marks ta "+
    "join tr_beginner_assesment_marks ba on(ta.subject_id=ba.subject_id) "+
    "group by ta.subject_id,ta.term_name,ta.assesment_id ";
    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
    }
    else
      console.log(err);
});
});

app.post('/assesmentwisereport-service' ,  urlencodedParser,function (req, res)
{  
    var qur="select student_id,subject_id,avg(rtotal),(SELECT grade FROM MD_GRADE_RATING WHERE "+
    "lower_limit<=round(avg(rtotal),2) and higher_limit>=round(avg(rtotal),2)) as grade "+
    "from tr_term_assesment_overall_marks  where school_id='"+req.query.schoolid+"' and "+
    "academic_year='"+req.query.academicyear+"' and term_name='"+req.query.termname+"' and assesment_id='"+req.query.assesment+"' "+
    "and grade='"+req.query.grade+"' and section='"+req.query.section+"' group by subject_id,student_id";
    console.log('...............................assessmentwise..............................');
    console.log(qur);
    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
    }
    else
      console.log(err);
});
});

app.post('/termwisereport-service' ,  urlencodedParser,function (req, res)
{  
    var qur="select assesment_id,student_id,subject_id,avg(rtotal),(SELECT grade FROM MD_GRADE_RATING WHERE "+
    "lower_limit<=round(avg(rtotal),2) and higher_limit>=round(avg(rtotal),2)) as grade "+
    "from tr_term_assesment_overall_marks  where school_id='"+req.query.schoolid+"' and "+
    "academic_year='"+req.query.academicyear+"' and term_name='"+req.query.termname+"' "+
    "and grade='"+req.query.grade+"' and section='"+req.query.section+"' group by assesment_id,subject_id,student_id";
    
    console.log('......................termwise..............................');
    console.log(qur);
    connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
    }
    else
      console.log(err);
});
});

app.post('/teacherid-service' ,  urlencodedParser,function (req, res)
{ 
  var qur;
 var schol={school_id:req.query.schoolid};
 var teacherid=req.query.id;
 if(req.query.roleid=="co-ordinator")
 {
  qur="select DISTINCT id,name,password from md_employee where id!='"+req.query.id+"' and school_id='"+req.query.schoolid+"'  and role_id='subject-teacher'";
 }
 else  if(req.query.roleid=="headmistress")
 {
  qur="select DISTINCT id,name,password from md_employee where id!='"+req.query.id+"' and id in(select name from tr_teacher_observation_flag where flag>='0') and school_id='"+req.query.schoolid+"'  and role_id='subject-teacher'";
 }
  else  if(req.query.roleid=="principal")
 {
  qur="select DISTINCT id,name,password from md_employee where id!='"+req.query.id+"' and id in(select name from tr_teacher_observation_flag where flag>='1') and school_id='"+req.query.schoolid+"'  and role_id='subject-teacher'";
 }
connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
    }
    else
      console.log(err);
});
});


app.post('/observerdescriptor-service' ,  urlencodedParser,function (req, res)
{ 

connection.query("select * from md_observer_descriptor",
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
    }
    else
      console.log(err);
});
});

app.post('/teachergrade-service' ,  urlencodedParser,function (req, res)
{ 
  var qur;

var schol={school_id:req.query.schoolid};
 var teacherid={id:req.query.id};
 if(req.query.roleid=="co-ordinator")
 {
  qur="select  distinct grade_id as gid,(select grade_name from md_grade where grade_id=gid) as gradename from mp_teacher_grade where school_id='"+req.query.schoolid+"' and id='"+req.query.id+"' and role_id='subject-teacher'"

}
else  if(req.query.roleid=="headmistress")
 {
  qur="select  distinct grade_id as gid,(select grade_name from md_grade where grade_id=gid) as gradename from mp_teacher_grade where grade_id in(select grade from tr_teacher_observation_flag where flag>='0' and name='"+req.query.id+"') and school_id='"+req.query.schoolid+"' and id='"+req.query.id+"' and role_id='subject-teacher'"

}
else  if(req.query.roleid=="principal")
 {
  qur="select  distinct grade_id as gid,(select grade_name from md_grade where grade_id=gid) as gradename from mp_teacher_grade where grade_id in(select grade from tr_teacher_observation_flag where flag>='1' and name='"+req.query.id+"') and school_id='"+req.query.schoolid+"' and id='"+req.query.id+"' and role_id='subject-teacher'"

}
connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
    }
    else
      console.log(err);
});
});


app.post('/teachersection-service' ,  urlencodedParser,function (req, res)
{ 
  var qur;

var schol={school_id:req.query.schoolid};
 var teacherid={id:req.query.id};
 var gradeid={grade_id:req.query.gradeid};
  if(req.query.roleid=="co-ordinator")
 {
  qur="select  distinct section_id from mp_teacher_grade where school_id='"+req.query.schoolid+"' and id='"+req.query.id+"' and grade_id='"+req.query.gradeid+"' and role_id='subject-teacher'";
}
else if(req.query.roleid=="headmistress")
 {
  qur="select  distinct section_id from mp_teacher_grade where section_id in (select section from tr_teacher_observation_flag where name='"+req.query.id+"' and grade='"+req.query.gradeid+"' and flag>='0') and school_id='"+req.query.schoolid+"' and id='"+req.query.id+"' and grade_id='"+req.query.gradeid+"' and role_id='subject-teacher'";
}
else if(req.query.roleid=="principal")
 {
  qur="select  distinct section_id from mp_teacher_grade where section_id in (select section from tr_teacher_observation_flag where name='"+req.query.id+"' and grade='"+req.query.gradeid+"' and flag>='1') and school_id='"+req.query.schoolid+"' and id='"+req.query.id+"' and grade_id='"+req.query.gradeid+"' and role_id='subject-teacher'";
}
connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
    }
    else
      console.log(err);
});
});




app.post('/teachersubject-service' ,  urlencodedParser,function (req, res)
{ 
  var qur;
var schol={school_id:req.query.schoolid};
 var teacherid={id:req.query.id};
 var gradeid={grade_id:req.query.gradeid};
 var sectionid={section_id:req.query.sectionid};
 if(req.query.roleid=="co-ordinator")
 {
qur= "select subject_id as sid,(select subject_name from md_subject where subject_id= sid) as subjectname from mp_teacher_grade where school_id='"+req.query.schoolid+"' and id='"+req.query.id+"' and grade_id='"+req.query.gradeid+"' and section_id='"+req.query.sectionid+"' and role_id='subject-teacher'";
}
else if(req.query.roleid=="headmistress")
 {
qur= "select subject_id as sid,(select subject_name from md_subject where subject_id= sid) as subjectname from mp_teacher_grade where  subject_id in (select subject from tr_teacher_observation_flag where flag>='0' and name='"+req.query.id+"' and grade='"+req.query.gradeid+"' and section='"+req.query.sectionid+"') and  school_id='"+req.query.schoolid+"' and id='"+req.query.id+"' and grade_id='"+req.query.gradeid+"' and section_id='"+req.query.sectionid+"' and role_id='subject-teacher'";
}
else if(req.query.roleid=="principal")
 {
qur= "select subject_id as sid,(select subject_name from md_subject where subject_id= sid) as subjectname from mp_teacher_grade where  subject_id in(select subject from tr_teacher_observation_flag where flag>='1' and name='"+req.query.id+"' and grade='"+req.query.gradeid+"' and section='"+req.query.sectionid+"') and  school_id='"+req.query.schoolid+"' and id='"+req.query.id+"' and grade_id='"+req.query.gradeid+"' and section_id='"+req.query.sectionid+"' and role_id='subject-teacher'";
}
connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
    }
    else
      console.log(err);
});
});



app.post('/observermarkflag-service' ,  urlencodedParser,function (req, res)
{ 
var schol={school_id:req.query.schoolid};
 var teacherid={name:req.query.id};
 var gradeid={grade:req.query.gradeid};
 var sectionid={section:req.query.sectionid};
 var subjectid={subject:req.query.subjectid};
connection.query("select * from tr_teacher_observation_flag where ? and ? and ? and ? and ?",[schol,teacherid,gradeid,sectionid,subjectid],
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
    }
    else
      console.log(err);
});
});


app.post('/observerscore-service',  urlencodedParser,function (req, res)
{  
  var response={
         
         description_id:req.query.desid,
         score:req.query.score,
         teacher_id:req.query.teacherid,
         observer_id:req.query.observerid,
         role:req.query.roleid,
         grade:req.query.grade,
         section:req.query.section,
         subject:req.query.subject                      
  }
  connection.query("INSERT INTO tr_teacher_observation_mark set ?",[response],
    function(err, rows)
    {
    if(!err)
    {    
      res.status(200).json({'returnval': 'succ'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }  

  });
});


app.post('/observerinsertflag-service',  urlencodedParser,function (req, res)
{  
  var response={
         
         school_id:req.query.schoolid,
         name:req.query.id,
         grade:req.query.gradeid,
         section:req.query.sectionid,
         subject:req.query.subjectid,
         flag:req.query.flag                    
  }
  connection.query("INSERT INTO tr_teacher_observation_flag set ?",[response],
    function(err, rows)
    {
    if(!err)
    {    
      res.status(200).json({'returnval': 'succ'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }  

  });
});

app.post('/observerupdateflag-service',  urlencodedParser,function (req, res)
{  
  
         
       var schol= {school_id:req.query.schoolid};
       var name={name:req.query.id};
       var grade={grade:req.query.gradeid};
        var section={section:req.query.sectionid};
        var subject={subject:req.query.subjectid};
        var flag={flag:req.query.flag};                    
  
  connection.query(" update tr_teacher_observation_flag set ? where ? and ? and ? and ? and ?",[flag,schol,name,grade,section,subject],
    function(err, rows)
    {
    if(!err)
    {    
      res.status(200).json({'returnval': 'succ'});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'fail'});
    }  

  });
});


app.post('/fetchobservermark-service' ,  urlencodedParser,function (req, res)
{ 
 var teacherid={teacher_id:req.query.id};
 var gradeid={grade:req.query.gradeid};
 var sectionid={section:req.query.sectionid};
 var subjectid={subject:req.query.subjectid};
connection.query("select * from tr_teacher_observation_mark where ? and ? and ? and ?",[teacherid,gradeid,sectionid,subjectid],
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      console.log(rows);
      res.status(200).json({'returnval': rows});
    }
    else
    {
      console.log(err);
      res.status(200).json({'returnval': 'invalid'});
    }
    }
    else
      console.log(err);
});
});
app.post('/mailreportcard-service' ,  urlencodedParser,function (req, res)
{
        var adterm1="";
        var adterm2="";
        var adterm3="";
        var wdterm1="";
        var wdterm2="";
        var wdterm3="";
        var pterm1="";
        var pterm2="";
        var pterm3="";
        var t1height="";
        var t2height="";
        var t3height="";
        var t1weight="";
        var t2weight="";
        var t3weight="";

        console.log('.........................healthattendanceinfo....................................');
        console.log(global.healthattendanceinfo.length);
        console.log('.................................................................................');

        if(global.healthattendanceinfo.length==1||global.healthattendanceinfo.length==2||global.healthattendanceinfo.length==3){
        adterm1=global.healthattendanceinfo[0].attendance;
        wdterm1=global.healthattendanceinfo[0].working_days;
        pterm1=parseFloat((global.healthattendanceinfo[0].attendance/global.healthattendanceinfo[0].working_days)*100).toFixed(2)+"%";
        t1height=global.healthattendanceinfo[0].height;
        t1weight=global.healthattendanceinfo[0].weight;        
        }
        if(global.healthattendanceinfo.length==2){
        adterm2=global.healthattendanceinfo[1].attendance;
        wdterm2=global.healthattendanceinfo[1].working_days;
        pterm2=parseFloat((global.healthattendanceinfo[1].attendance/global.healthattendanceinfo[1].working_days)*100).toFixed(2)+"%";
        t2height=global.healthattendanceinfo[1].height;
        t2weight=global.healthattendanceinfo[1].weight;
        }
        if(global.healthattendanceinfo.length==3){
        adterm3=global.healthattendanceinfo[2].attendance; 
        wdterm3=global.healthattendanceinfo[2].working_days;
        pterm3=parseFloat((global.healthattendanceinfo[2].attendance/global.healthattendanceinfo[2].working_days)*100).toFixed(2)+"%";
        t3height=global.healthattendanceinfo[2].height;
        t3weight=global.healthattendanceinfo[2].weight;
        }

        var engarr=[];
        var matharr=[];
        var evsarr=[];
        var hinarr=[];
        var comarr=[];
        var gkarr=[];
        var acarr=[];
        var mdarr=[];
        var gamearr=[];
        var parr=[];
        
        for(var i=0;i<global.scholasticinfo.length;i++){          
          var obj={"category":"","t1grade":"","t2grade":"","t3grade":"","comment":""};          
          if(global.scholasticinfo[i].subject_name=="English"){
            obj.category=global.scholasticinfo[i].category;
            obj.comment=global.scholasticinfo[i].description;
            if(global.scholasticinfo[i].term_name=="term1")
            obj.t1grade=global.scholasticinfo[i].term_cat_grade;
            if(global.scholasticinfo[i].term_name=="term2")
            obj.t2grade=global.scholasticinfo[i].term_cat_grade;
            if(global.scholasticinfo[i].term_name=="term3")
            obj.t3grade=global.scholasticinfo[i].term_cat_grade;    
            engarr.push(obj);
          }
          if(global.scholasticinfo[i].subject_name=="Mathematics"){
            obj.category=global.scholasticinfo[i].category;
            obj.comment=global.scholasticinfo[i].description;
            if(global.scholasticinfo[i].term_name=="term1")
            obj.t1grade=global.scholasticinfo[i].term_cat_grade;
            if(global.scholasticinfo[i].term_name=="term2")
            obj.t2grade=global.scholasticinfo[i].term_cat_grade;
            if(global.scholasticinfo[i].term_name=="term3")
            obj.t3grade=global.scholasticinfo[i].term_cat_grade;
            matharr.push(obj);
          }
          if(global.scholasticinfo[i].subject_name=="EVS"){
            obj.category=global.scholasticinfo[i].category;
            obj.comment=global.scholasticinfo[i].description;
            if(global.scholasticinfo[i].term_name=="term1")
            obj.t1grade=global.scholasticinfo[i].term_cat_grade;
            if(global.scholasticinfo[i].term_name=="term2")
            obj.t2grade=global.scholasticinfo[i].term_cat_grade;
            if(global.scholasticinfo[i].term_name=="term3")
            obj.t3grade=global.scholasticinfo[i].term_cat_grade;
            evsarr.push(obj);
          }
          if((global.scholasticinfo[i].subject_name).trim()=="Hindi"){
            obj.category=global.scholasticinfo[i].category;
            obj.comment=global.scholasticinfo[i].description;
            if(global.scholasticinfo[i].term_name=="term1")
            obj.t1grade=global.scholasticinfo[i].term_cat_grade;
            if(global.scholasticinfo[i].term_name=="term2")
            obj.t2grade=global.scholasticinfo[i].term_cat_grade;
            if(global.scholasticinfo[i].term_name=="term3")
            obj.t3grade=global.scholasticinfo[i].term_cat_grade;
            hinarr.push(obj);
          }
           if((global.scholasticinfo[i].subject_name).trim()=="Kannada"){
            obj.category=global.scholasticinfo[i].category;
            obj.comment=global.scholasticinfo[i].description;
            if(global.scholasticinfo[i].term_name=="term1")
            obj.t1grade=global.scholasticinfo[i].term_cat_grade;
            if(global.scholasticinfo[i].term_name=="term2")
            obj.t2grade=global.scholasticinfo[i].term_cat_grade;
            if(global.scholasticinfo[i].term_name=="term3")
            obj.t3grade=global.scholasticinfo[i].term_cat_grade;
            hinarr.push(obj);
          }
          if((global.scholasticinfo[i].subject_name).trim()=="Computer"){            
            obj.category=global.scholasticinfo[i].category;
            obj.comment=global.scholasticinfo[i].description;
            if(global.scholasticinfo[i].term_name=="term1")
            obj.t1grade=global.scholasticinfo[i].term_cat_grade;
            if(global.scholasticinfo[i].term_name=="term2")
            obj.t2grade=global.scholasticinfo[i].term_cat_grade;
            if(global.scholasticinfo[i].term_name=="term3")
            obj.t3grade=global.scholasticinfo[i].term_cat_grade;
            comarr.push(obj);            
          }          
          if(global.scholasticinfo[i].subject_name=="GK"){
            obj.category=global.scholasticinfo[i].category;
            obj.comment=global.scholasticinfo[i].description;
            if(global.scholasticinfo[i].term_name=="term1")
            obj.t1grade=global.scholasticinfo[i].term_cat_grade;
            if(global.scholasticinfo[i].term_name=="term2")
            obj.t2grade=global.scholasticinfo[i].term_cat_grade;
            if(global.scholasticinfo[i].term_name=="term3")
            obj.t3grade=global.scholasticinfo[i].term_cat_grade;
            gkarr.push(obj);
          }          
                   
          if(global.scholasticinfo[i].subject_name=="Art&Craft"){            
            obj.category=global.scholasticinfo[i].category;
            obj.comment=global.scholasticinfo[i].description;
            if(global.scholasticinfo[i].term_name=="term1")
            obj.t1grade=global.scholasticinfo[i].term_cat_grade;
            if(global.scholasticinfo[i].term_name=="term2")
            obj.t2grade=global.scholasticinfo[i].term_cat_grade;
            if(global.scholasticinfo[i].term_name=="term3")
            obj.t3grade=global.scholasticinfo[i].term_cat_grade;     
            acarr.push(obj);
          }
          if(global.scholasticinfo[i].subject_name=="music"){
            obj.category=global.scholasticinfo[i].category;
            obj.comment=global.scholasticinfo[i].description;
            if(global.scholasticinfo[i].term_name=="term1")
            obj.t1grade=global.scholasticinfo[i].term_cat_grade;
            if(global.scholasticinfo[i].term_name=="term2")
            obj.t2grade=global.scholasticinfo[i].term_cat_grade;
            if(global.scholasticinfo[i].term_name=="term3")
            obj.t3grade=global.scholasticinfo[i].term_cat_grade;
            mdarr.push(obj);
          }
          if(global.scholasticinfo[i].subject_name=="dance"){
            obj.category=global.scholasticinfo[i].category;
            obj.comment=global.scholasticinfo[i].description;
            if(global.scholasticinfo[i].term_name=="term1")
            obj.t1grade=global.scholasticinfo[i].term_cat_grade;
            if(global.scholasticinfo[i].term_name=="term2")
            obj.t2grade=global.scholasticinfo[i].term_cat_grade;
            if(global.scholasticinfo[i].term_name=="term3")
            obj.t3grade=global.scholasticinfo[i].term_cat_grade;
            mdarr.push(obj);
          }
          if(global.scholasticinfo[i].subject_name=="Games"){
            obj.category=global.scholasticinfo[i].category;
            obj.comment=global.scholasticinfo[i].description;
            if(global.scholasticinfo[i].term_name=="term1")
            obj.t1grade=global.scholasticinfo[i].term_cat_grade;
            if(global.scholasticinfo[i].term_name=="term2")
            obj.t2grade=global.scholasticinfo[i].term_cat_grade;
            if(global.scholasticinfo[i].term_name=="term3")
            obj.t3grade=global.scholasticinfo[i].term_cat_grade;
            gamearr.push(obj);
          }

        if(global.scholasticinfo[i].subject_name=="Personality Development"){ 
          obj.category=global.scholasticinfo[i].category; 
          obj.comment=global.scholasticinfo[i].description;      
          if(global.scholasticinfo[i].term_name=="term1"){            
          obj.t1grade=global.scholasticinfo[i].term_cat_grade;
          }
          if(global.scholasticinfo[i].term_name=="term2"){            
          obj.t2grade=global.scholasticinfo[i].term_cat_grade;
          }
          if(global.scholasticinfo[i].term_name=="term3"){            
          obj.t3grade=global.scholasticinfo[i].term_cat_grade;
          }
          parr.push(obj);          
        }
       }
    console.log('....................schoolname.........................');
    console.log(req.query.schoolname+"   "+req.query.academicyear); 
    console.log('.......................................................');
      
    var header = "<table class='logo' style='width:100%;height: 15%; margin-top: 4%;'><tr><th><img src='./app/images/zeesouth.png' height='100px' width='100px'></img></th><th>"
    header += "<img src='./app/images/mount.png' height='110px' width='200px' style='margin-left:100px'></img><center><p>"+req.query.schoolname+"</p>ACHIEVEMENT RECORD("+req.query.academicyear+")</center></th>"
    header += "<th><img src='./app/images/zee.gif' height='100px' width='100px'></img></th></tr></table><br>"
    header += "<div class='saph' style='margin-left: 3%;'><img src='./app/images/saph.jpg' height='120px' width='630px'></img></div>";

    var studinfo= "<table class='studentinfo' style='border-collapse: collapse;width:95%;height: 10%;margin-left: 3%;margin-top: 5%;'><tr><th align='left'>Student Name: </th>"
    studinfo += "<th align='left' colspan='3' style='background-color: white;'>"+global.studentinfo[0].student_name+"</th></tr><tr style='height: 10px;'><th colspan='4'></th></tr><tr>"
    studinfo += "<th align='left'>Parent Name: </th><th align='left' colspan='3' style='background-color: white;'>"+global.studentinfo[0].parent_name+"</th></tr><tr style='height: 10px;'><th colspan='4'></th></tr><tr><th align='left'>Class: </th>";    
    studinfo += "<th align='left' style='background-color: white;'>"+req.query.grade+"&nbsp;&nbsp;"+req.query.section+"</th><th align='left'>Admission No: </th><th align='left' style='background-color: white;'>"+global.studentinfo[0].student_id+"</th></tr></table> <br><br><br>";
     
    var attendance= "<table style='border-collapse: collapse;width:95%;height: 15%; margin-left: 3%;margin-top: 5%;' class='attendance'><tr><th style='width: 25%;'>Attendance</th><th colspan='2' style='width: 25%;'>Term1</th><th colspan='2' style='width: 25%;'>Term2</th><th colspan='2' style='width: 25%;'>Term3</th></tr>"
    attendance += "<tr style='height: 10px;'><th colspan='7'></th></tr><tr><td style='width: 25%;'>Total Attended Days</td><td align='right' style='width: 13%;'>"+adterm1+"</td>"
    attendance += "<td rowspan='2' align='right'><div class='fab'>"+pterm1+"</div></td><td align='right' style='width: 13%;'>"+adterm2+"</td>"
    attendance += "<td rowspan='2' align='right'><div class='fab'>"+pterm2+"</div></td><td align='right' style='width: 13%;'>"+adterm3+"</td>"
    attendance += "<td rowspan='2' align='right'><div class='fab'>"+pterm3+"</div></td></tr><tr style='height: 10px;'><th colspan='7'></th></tr>"
    attendance += "<tr><td style='width: 25%;'>Total Working Days</td><td align='right' style='width: 13%;'>"+wdterm1+"</td>"
    attendance += "<td align='right' style='width: 13%;'>"+wdterm2+"</td><td align='right' style='width: 13%;'>"+wdterm3+"</td></tr></table><br><br><br>"
    attendance += "<table  style='width: 95%;margin-left: 3%;' class='general'> <tr><th style='width: 25%;'>General Feedback: </th><th style='background-color: white;'></th></tr></table><br><br><br><br><br><br><br><br>"; 

    var signature= "<table  style='width: 650px;margin-left:10px;' class='signature'><tr><th>----------------------------------------</th><th></th><th>---------------------------------------</th><th></th>"
    signature += "<th>----------------------------------------</th><th></th></tr><tr><th><center>Class Teacher</center></th><th></th><th><center>Principal</center></th><th></th><th><center>Parent</center></th><th></th></tr></table><br><br><br><br>";

    var clr;
    var subjecteng = "<table style='width: 95%;margin-left: 3%;' class='subject'><tr style='background: #4d94ff;'><th style='width: 35%;'>ENGLISH</th><th style='width:5%;'>T1</th><th style='width: 5%;'>T2</th><th style='width: 5%;'>T3</th><th style='width:50%;'>Comments</th></tr>"
    for(var i=0; i<engarr.length; i++) {
    if(i%2!=0){
    subjecteng += "<tr class='eng' style='background:#f1f1f1'><th style='width: 35%;text-align: left;'>"+engarr[i].category+"</th><th style='width: 5%;'>"
    subjecteng += "<div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+engarr[i].t1grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+engarr[i].t2grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+engarr[i].t3grade+"</div></th><th style='width: 50%;text-align: left;'>"+engarr[i].comment+"</th></tr>"  
    }else{ 
    subjecteng += "<tr class='eng' style='background:#b3d1ff'><th style='width: 35%;text-align: left;'>"+engarr[i].category+"</th><th style='width: 5%;'>"
    subjecteng += "<div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+engarr[i].t1grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+engarr[i].t2grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+engarr[i].t3grade+"</div></th><th style='width: 50%;text-align: left;'>"+engarr[i].comment+"</th></tr>"
    }
    }
    subjecteng += "</table>";

    var subjectmath = "<table style='width: 95%;margin-left: 3%;' class='subject'><tr style='background: #86b300;'><th style='width: 35%;' >MATHEMATICS</th><th style='width: 5%;'>T1</th><th style='width: 5%;'>T2</th><th style='width: 5%;'>T3</th><th style='width: 50%;'>Comments</th></tr>"
    for(var i=0; i<matharr.length; i++) {
    if(i%2!=0)
    {
    subjectmath += "<tr class='math' style='background:#f1f1f1'><th style='width: 35%;text-align: left;'>"+matharr[i].category+"</th><th style='width: 5%;'>"
    subjectmath += "<div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+matharr[i].t1grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+matharr[i].t2grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+matharr[i].t3grade+"</div></th><th style='width: 50%;text-align: left;'>"+matharr[i].comment+"</th></tr>"
    }
    else{
    subjectmath += "<tr class='math' style='background:#dfff80'><th style='width: 35%;text-align: left;'>"+matharr[i].category+"</th><th style='width: 5%;'>"
    subjectmath += "<div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+matharr[i].t1grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+matharr[i].t2grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+matharr[i].t3grade+"</div></th><th style='width: 50%;text-align: left;'>"+matharr[i].comment+"</th></tr>"
    }
    }
    subjectmath += "</table>";

    var subjectevs = "<table style='width: 95%;margin-left: 3%;' class='subject'><tr style='background: #ffad33;'><th style='width: 35%;'>EVS</th><th style='width: 5%;'>T1</th><th style='width: 5%;'>T2</th><th style='width: 5%;'>T3</th><th style='width: 50%;'>Comments</th></tr>"
    for(var i=0; i<evsarr.length; i++) {
    if(i%2!=0)
    subjectevs += "<tr class='evs' style='background:#f1f1f1'><th style='width: 35%;text-align: left;'>"+evsarr[i].category+"</th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+evsarr[i].t1grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+evsarr[i].t2grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+evsarr[i].t3grade+"</div></th><th style='width: 50%;text-align: left;'>"+evsarr[i].comment+"</th></tr>"
    else
    subjectevs += "<tr class='evs' style='background:#ffd699'><th style='width: 35%;text-align: left;'>"+evsarr[i].category+"</th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+evsarr[i].t1grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+evsarr[i].t2grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+evsarr[i].t3grade+"</div></th><th style='width: 50%;text-align: left;'>"+evsarr[i].comment+"</th></tr>"
    }
    subjectevs += "</table>";

    var subjecthindi = "<table style='width: 95%;margin-left: 3%;' class='subject'><tr style='background: #ac39ac;'><th style='width: 35%;'>HINDI/KANADA(II Language)</th><th style='width: 5%;'>T1</th><th style='width: 5%;'>T2</th><th style='width: 5%;'>T3</th><th style='width: 50%;'>Comments</th></tr>"
    for(var i=0; i<hinarr.length; i++) {
    if(i%2!=0)
    subjecthindi += "<tr class='hin' style='background:#f1f1f1'><th style='width: 35%;text-align: left;'>"+hinarr[i].category+"</th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+hinarr[i].t1grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+hinarr[i].t2grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+hinarr[i].t3grade+"</div></th><th style='width: 50%;text-align: left;'>"+hinarr[i].comment+"</th></tr>"
    else
    subjecthindi += "<tr class='hin' style='background:#d98cd9'><th style='width: 35%;text-align: left;'>"+hinarr[i].category+"</th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+hinarr[i].t1grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+hinarr[i].t2grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+hinarr[i].t3grade+"</div></th><th style='width: 50%;text-align: left;'>"+hinarr[i].comment+"</th></tr>"
    }
    subjecthindi += "</table>";

    var subjectcomputer = "<table style='width: 95%;margin-left: 3%;' class='subject'><tr style='background: #4d94ff;'><th style='width: 35%;'>COMPUTER SCIENCE</th><th style='width: 5%;'>T1</th><th style='width: 5%;'>T2</th><th style='width: 5%;'>T3</th><th style='width: 50%;'>Comments</th></tr>"
    for(var i=0; i<comarr.length; i++) {
    if(i%2!=0)
    subjectcomputer += "<tr class='comp' style='background:#f1f1f1'><th style='width: 35%;text-align: left;'>"+comarr[i].category+"</th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+comarr[i].t1grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+comarr[i].t2grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+comarr[i].t3grade+"</div></th><th style='width: 50%;text-align: left;'>"+comarr[i].comment+"</th></tr>"
    else
    subjectcomputer += "<tr class='comp' style='background:#b3d1ff'><th style='width: 35%;text-align: left;'>"+comarr[i].category+"</th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+comarr[i].t1grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+comarr[i].t2grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+comarr[i].t3grade+"</div></th><th style='width: 50%;text-align: left;'>"+comarr[i].comment+"</th></tr>"
    }
    subjectcomputer += "</table>";

    var subjectgk = "<table style='width: 95%;margin-left: 3%;' class='subject'><tr style='background: #ac39ac;'><th style='width: 35%;'>GENERAL KNOWLEDGE</th><th style='width: 5%;'>T1</th><th style='width: 5%;'>T2</th><th style='width: 5%;'>T3</th><th style='width: 50%;'>Comments</th></tr>"
    for(var i=0; i<gkarr.length; i++) {
    if(i%2!=0)
    subjectgk += "<tr class='gk' style='background:#f1f1f1'><th style='width: 35%;text-align: left;'>"+gkarr[i].category+"</th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+gkarr[i].t1grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+gkarr[i].t2grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+gkarr[i].t3grade+"</div></th><th style='width: 50%;text-align: left;'>"+gkarr[i].comment+"</th></tr>"
    else
    subjectgk += "<tr class='gk' style='background:#ffd699'><th style='width: 35%;text-align: left;'>"+gkarr[i].category+"</th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+gkarr[i].t1grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+gkarr[i].t2grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+gkarr[i].t3grade+"</div></th><th style='width: 50%;text-align: left;'>"+gkarr[i].comment+"</th></tr>"
    }
    subjectgk += "</table>";

    var subjectartcraft = "<table style='width: 95%;margin-left: 3%;' class='subject'> <tr style='background: #86b300;'><th style='width: 35%;'>ART/CRAFT</th><th style='width: 5%;'>T1</th><th style='width: 5%;'>T2</th><th style='width: 5%;'>T3</th><th style='width: 50%;'>Comments</th></tr>"
    for(var i=0; i<acarr.length; i++) {
    if(i%2!=0)
    subjectartcraft += "<tr class='art' style='background:#f1f1f1'><th style='width: 35%;text-align: left;'>"+acarr[i].category+"</th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+acarr[i].t1grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+acarr[i].t2grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+acarr[i].t3grade+"</div></th><th style='width: 50%;text-align: left;'>"+acarr[i].comment+"</th></tr>"
    else
    subjectartcraft += "<tr class='art' style='background:#dfff80'><th style='width: 35%;text-align: left;'>"+acarr[i].category+"</th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+acarr[i].t1grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+acarr[i].t2grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+acarr[i].t3grade+"</div></th><th style='width: 50%;text-align: left;'>"+acarr[i].comment+"</th></tr>"
    }
    subjectartcraft += "</table>";

    var subjectmusic = "<table style='width: 95%;margin-left: 3%;' class='subject'><tr style='background:  #ac39ac;'><th style='width: 35%;'>MUSIC/DANCE</th><th style='width: 5%;'>T1</th><th style='width: 5%;'>T2</th><th style='width: 5%;'>T3</th><th style='width: 50%;'>Comments</th></tr>"
    for(var i=0; i<mdarr.length; i++) {
    if(i%2!=0)
    subjectmusic += "<tr class='music' style='background:#f1f1f1'><th style='width: 35%;text-align: left;'>"+mdarr[i].category+"</th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+mdarr[i].t1grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+mdarr[i].t2grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+mdarr[i].t3grade+"</div></th><th style='width: 50%;text-align: left;'>"+mdarr[i].comment+"</th></tr>"
    else
    subjectmusic += "<tr class='music' style='background:#d98cd9'><th style='width: 35%;text-align: left;'>"+mdarr[i].category+"</th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+mdarr[i].t1grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+mdarr[i].t2grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+mdarr[i].t3grade+"</div></th><th style='width: 50%;text-align: left;'>"+mdarr[i].comment+"</th></tr>"
    }
    subjectmusic += "</table>";

    var subjectgames = "<table style='width: 95%;margin-left: 3%;' class='subject'> <tr style='background: #4d94ff;'><th style='width: 35%;'>GAMES</th><th style='width: 5%;'>T1</th><th style='width: 5%;'>T2</th><th style='width: 5%;'>T3</th><th style='width: 50%;'>Comments</th></tr>"
    for(var i=0; i<gamearr.length; i++) {
    if(i%2!=0)
    subjectgames += "<tr class='game' style='background:#f1f1f1'><th style='width: 35%;text-align: left;'>"+gamearr[i].category+"</th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+gamearr[i].t1grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+gamearr[i].t2grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+gamearr[i].t3grade+"</div></th><th style='width: 50%;text-align: left;'>"+gamearr[i].comment+"</th></tr>"
    else
    subjectgames += "<tr class='game' style='background:#b3d1ff'><th style='width: 35%;text-align: left;'>"+gamearr[i].category+"</th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+gamearr[i].t1grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+gamearr[i].t2grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+gamearr[i].t3grade+"</div></th><th style='width: 50%;text-align: left;'>"+gamearr[i].comment+"</th></tr>"
    }
    subjectgames += "</table>";

    var subjectpersonality = "<table style='width: 95%;margin-left: 3%;' class='subject'><tr style='background:  #86b300;'><th style='width: 35%;'>PERSONALITY DEVELOPMENT</th><th style='width: 5%;'>T1</th><th style='width: 5%;'>T2</th><th style='width: 5%;'>T3</th><th style='width: 50%;'>Comments</th></tr>"
    for(var i=0; i<parr.length; i++) {
    if(i%2!=0)
    subjectpersonality += "<tr class='pd' style='background:#f1f1f1'><th style='width: 35%;text-align: left;'>"+parr[i].category+"</th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+parr[i].t1grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+parr[i].t2grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+parr[i].t3grade+"</div></th><th style='width: 50%;text-align: left;'>"+parr[i].comment+"</th></tr>"
    else
    subjectpersonality += "<tr class='pd' style='background:#dfff80'><th style='width: 35%;text-align: left;'>"+parr[i].category+"</th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+parr[i].t1grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+parr[i].t2grade+"</div></th><th style='width: 5%;'><div class='circle' style='width:40px;height:40px;border-radius:50px;font-size:15px;line-height:40px;text-align:center;background:#d6d6c2;'>"+parr[i].t3grade+"</div></th><th style='width: 50%;text-align: left;'>"+parr[i].comment+"</th></tr>"
    }
    subjectpersonality += "</table>   <br><br><br>";

    var health = "<table class='health' border='1' style='border-collapse: collapse;width: 95%;margin-left: 3%;'><tr style='background: #ac39ac;'><th>Health</th><th>T1</th><th>T2</th><th>T3</th></tr>"
    health += "<tr class='health'><th>Height</th><th>"+t1height+"</th><th>"+t2height+"</th><th>"+t3height+"</th></tr>"
    health += "<tr class='health'><th>Weight</th><th>"+t1weight+"</th><th>"+t2weight+"</th><th>"+t3weight+"</th></tr></table><br><br>";

    // $('tr:nth-child(even)').css("background", "red");


    var finalpdf=header+studinfo+attendance+signature+subjecteng+subjectmath+subjectevs+subjecthindi+subjectcomputer+subjectgk+subjectartcraft+subjectmusic+subjectgames+subjectpersonality+health;

    htmlToPdf.convertHTMLString(finalpdf, './app/reportcard/reportcard.pdf',
    function (error, success) {
       if (error) {
            console.log('Oh noes! Errorz!');
            console.log(error);
        } else {
          console.log('Converted');
          res.status(200).json({'returnval': 'converted'});     
        }
    });
});


app.post('/sendmail-service', urlencodedParser,function (req, res) {
  console.log(global.studentinfo[0].email);
  var server  = email.server.connect({
   user:    "samsidhgroupzeeschool@gmail.com",
   password:"mlzsinstitutions",
   host:    "smtp.gmail.com",
   ssl:     true
  });
  server.send({
   text:    "Score Card",
   from:    "samsidhgroupzeeschool@gmail.com",
   to:      "rmpraba@gmail.com",
   subject: "Score Card",
   attachment:
   [{
    filename: 'reportcard.pdf',
    path: './app/reportcard/reportcard.pdf',
    type: 'application/pdf'
   }]
  },function(err, message) { console.log(err || message); });
  res.status(200).json('mail sent');
});

var server = app.listen(5000, function () {
var host = server.address().address
var port = server.address().port
console.log("Example app listening at http://%s:%s", host, port)
});