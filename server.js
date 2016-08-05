var express    = require("express");
 var mysql      = require('mysql');
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
  connection.query('select id,role_name from md_role where id in (select role_id from md_employee where ? and ? )',[id,password],
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
  connection.query('SELECT  school_id as school,(select name from md_school where id=school) as name ,(select address from md_school where id=school) as addr  from md_employee where ? and ? ',[id,username,password],
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
  console.log(roleid);
  // var qur="select grade_name from md_grade where grade_id in(select grade_id from mp_teacher_grade where id='"+loggedid+"')";
  connection.query('select grade_name from md_grade where grade_id in(select grade_id from mp_teacher_grade where ? and ? and ?)',[roleid,schoolid,loggedid],
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
  var qur="select * from md_section where section_id in(select section_id from mp_teacher_grade where school_id='"+req.query.schoolid+"' and role_id='"+req.query.roleid+"' and id='"+req.query.loggedid+"' and grade_id=(select grade_id from scorecarddb.md_grade where grade_name='"+req.query.gradename+"'))";
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
  // var qur="select subject_name from md_subject where subject_id in(select subject_id from mp_grade_subject where term_id=(select assesment_id from md_assesment_type where assesment_name='"+req.query.termtype+"') and grade_id=(select grade_id from md_grade where grade_name='"+req.query.gradename+"'))";
  // console.log(qur);
  if(req.query.roleid=='subject-teacher'){
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
  }
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

//fetching student info
app.post('/fetchstudent-service',  urlencodedParser,function (req, res)
{
var qur2="select school_id,id,student_name,class_id from md_student where  class_id="+
"(select class_id from mp_grade_section where grade_id=(select grade_id "+
"from md_grade where grade_name='"+req.query.gradename+"') and section_id=(select "+
"section_id from md_section where section_name='"+req.query.section+"' and school_id='"+req.query.schoolid+"') and "+
"school_id='"+req.query.schoolid+"')";
var qur1="select distinct student_id as id,student_name,school_id,class_id from tr_student_to_subject where "+
"grade=(select grade_id from md_grade where grade_name='"+req.query.gradename+"') and "+
"section=(select section_id from md_section where section_name='"+req.query.section+"' "+
"and school_id='"+req.query.schoolid+"') and school_id='"+req.query.schoolid+"'";

var qur="select * from mp_teacher_grade tg join tr_student_to_subject ss "+
        "on(tg.subject_id=ss.subject_id) and ss.subject_id=(select subject_id from md_subject where "+
        "subject_name='"+req.query.subject+"') and ss.grade=tg.grade_id "+
        "and ss.section=tg.section_id";

  connection.query(qur,
    function(err, rows)
    {
    if(!err)
    {
    if(rows.length>0)
    {
      connection.query(qur1,function(err, rows){
       if(rows.length>0) 
        res.status(200).json({'returnval': rows});
       else
        res.status(200).json({'returnval': 'invalid'});
      });
      //res.status(200).json({'returnval': rows});
    }
    else
    {
      connection.query(qur2,function(err, rows){
       if(rows.length>0) 
        res.status(200).json({'returnval': rows});
       else
        res.status(200).json({'returnval': 'invalid'});
      });
      //console.log(err);
      //res.status(200).json({'returnval': 'invalid'});
    }
    }
    else
      console.log(err);
  });
});

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
         mark:req.query.mark                 
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

  connection.query("SELECT subject_category FROM md_subject where ?",[subname],
  function(err, rows)
  {
  response.subject_category=rows[0].subject_category;
  // connection.query("SELECT * FROM tr_term_assesment_marks WHERE ? and ? and ? and ? and ? and ? and ? and ? and ?",[cond1,cond2,cond3,cond4,cond5,cond6,cond7,cond8,cond9],function(err, rows) {
  // if(rows.length==0){
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
  // }
  // else
    // res.status(200).json({'returnval': 'Duplicate entry!'});
  // });
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
"s.id,p.student_id,s.student_name,s.dob,p.parent_name,p.email,p.mobile,p.address1 "+
"from md_student s join parent p on(s.id=p.student_id) and s.id='"+req.query.studid+"' and s.school_id='"+req.query.schoolid+"'";

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

  connection.query("SELECT * FROM tr_term_assesment_overall_assesmentmarks am join "+
  "md_grade_descriptor gd on(am.category=gd.category) WHERE ? AND ? AND ? and am.term_cat_grade=gd.grade and "+
  "am.subject_id=gd.subject_name",[studid,schoolid,academicyear],
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
         working_days:req.query.workingdays                 
  }  

  connection.query("INSERT INTO tr_term_attendance SET ?",[response],
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
});


//fetchhealthattendanceinfo
app.post('/fetchhealthattendanceinfo-service',  urlencodedParser,function (req,res)
{   
  var schoolid={school_id:req.query.schoolid};
  var studid={student_id:req.query.studid};  
  var academicyear={academic_year:req.query.academicyear}; 
  var qur="select * from scorecarddb.tr_term_attendance "+
  " where student_id='"+req.query.studid+"' "+
  "and school_id='"+req.query.schoolid+"' and  academic_year='"+req.query.academicyear+"'";
  console.log(qur);
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

  var qur="select * from tr_term_assesment_marks where  grade='"+req.query.gradename+"'and section ='"+req.query.section+"' and school_id='"+req.query.schoolid+"' and subject_id='"+req.query.subject+"' and assesment_id='"+req.query.assesment+"'";
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

app.post('/fetchworkingdays-service',  urlencodedParser,function (req, res)
{
  var qur="select * from md_workingdays where ? and ? and ? and ?";
  // console.log(qur);
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
 
      connection.query('insert into tr_term_assesment_import_marks set ?',[data],
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

  var qur="select * from tr_term_assesment_marks where  grade='"+req.query.gradename+"'and section ='"+req.query.section+"' and school_id='"+req.query.schoolid+"' and subject_id='"+req.query.subject+"' and assesment_id='"+req.query.assesment+"' and term_name='"+req.query.term+"'";
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


app.post('/updatemark-service' ,  urlencodedParser,function (req, res)
{
  // console.log('come');
  var qur="update tr_term_assesment_marks set mark='"+req.query.mark+"' where school_id='"+req.query.schoolid+"' and subject_id='"+req.query.subject+"' and assesment_id='"+req.query.assesment+"' and term_name='"+req.query.term+"' and academic_year='"+req.query.academic+"' and sub_category='"+req.query.sub_category+"'and student_id='"+req.query.studid+"'";
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
"ta.subject_id,ba.grade as beginner_grade from scorecarddb.tr_term_assesment_overall_marks ta "+
"join tr_beginner_assesment_marks ba on(ta.subject_id=ba.subject_id) "+
"where ta.subject_id='"+req.query.subject+"' and ta.school_id='"+req.query.schoolid+"' and ta.academic_year='"+req.query.academicyear+"' "+
"and ta.grade='"+req.query.grade+"' and ta.section='"+req.query.section+"' "+
"group by ta.subject_id,ta.term_name,ta.assesment_id,ta.student_id ";

console.log(qur);
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
    "ta.subject_id,ba.grade as beginner_grade from scorecarddb.tr_term_assesment_overall_marks ta "+
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

var server = app.listen(5000, function () {
var host = server.address().address
var port = server.address().port
console.log("Example app listening at http://%s:%s", host, port)
});