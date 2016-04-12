var express    = require("express");
 var mysql      = require('mysql');
 var connection = mysql.createConnection({
   host     : 'localhost',
   user     : 'root',
   password : 'admin',
   database : 'transport'
 });
var bodyParser = require('body-parser');
 var app = express();

app.use(express.static('app'));
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get('/', function (req, res) {
   res.sendFile("app/index.html" );
})
//select the username and password from login table
app.post('/login-card',  urlencodedParser,function (req, res)
{

	var username={"username":req.query.username};
    var password={"password":req.query.password};
       connection.query('SELECT role_name  from role where id=(select role_id from employee where ? and ? )',[username,password],
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
});
	});

//select the route

app.post('/getroute' ,  urlencodedParser,function (req, res)
{	
	    connection.query('select route_name from route',
       	function(err, rows)
       	{
      	if(!err)
		{
			if(rows.length>0)
			{
				//console.log(rows);
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



app.post('/getroutedetail' ,  urlencodedParser,function (req, res)
{
	var routename={"route_name":req.query.routename};
	var trip={"trip":req.query.tripnos};
	//console.log('in server...');
	//console.log('hello route'+routename);
	//console.log('hello trip...'+trip);
	connection.query('select * from point where route_id=(select id from route where ?) and ?',[routename,trip],
   	function(err, rows){
		if(!err){
			if(rows.length>0){
				//console.log(rows);
				res.status(200).json({'returnval': rows});
			} else {
				res.status(200).json({'returnval': 'invalid'});
			}
		} else{
				console.log('No data Fetched'+err);
			}
		});
});


app.post('/insertpoint' ,  urlencodedParser,function (req, res)
{
		
		var rouname={"id":req.query.id,"point_name":req.query.points,"route_id":req.query.routes,"trip":req.query.trip,"pickup_time":req.query.pick,"drop_time":req.query.drop};
		//console.log('in server...'+routename);
		//console.log(rouname);
	    connection.query('insert into point set ?',[rouname],
       	function(err, rows)
       	{
		if(!err)
		{
			console.log('inserted');
			res.status(200).json({'returnval': 'success'});
		}
		else
		{
			console.log("error");
			console.log(err);
			res.status(200).json({'returnval': 'invalid'});
		}
		
	
});
	});


app.post('/routeid' ,  urlencodedParser,function (req, res)
{
		
		 var routename={"route_name":req.query.routename};
	    connection.query('select * from route where ?',[routename], 
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
			res.status(200).json({'returnval': 'invalid'});
			}
		}
		else
		{
			console.log('No data Fetched'+err);
		}
		
		
	
});
	});


app.post('/sequence' ,  urlencodedParser,function (req, res)
{
	
	    connection.query('select count(id) as count from point',
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

app.post('/getzone' ,  urlencodedParser,function (req, res)
{
	    connection.query('select * from md_zone',
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



app.post('/getfee' ,  urlencodedParser,function (req, res)
{
	var zone={"zone_name":req.query.zone};
	    connection.query('select fees from md_distance where id=(select distance_id from md_zone where ? )',[zone],
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

app.post('/gettermdate' ,  urlencodedParser,function (req, res)
{
	var idz={"school_type":req.query.grade};
	    connection.query('select start_date,end_date from transport_details where ?',[idz],
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
			res.status(200).json({'returnval': 'invalid'});
			}
		}
		else
		{
			console.log('No data Fetched'+err);
		}
});
	});

app.post('/setzone' ,  urlencodedParser,function (req, res)
{
	var queryy="insert into student_fee values('"+req.query.studid+"','"+req.query.zone+"',0,0,'"+req.query.fee+"','','','','',STR_TO_DATE('"+req.query.fromdate+"','%Y/%m/%d'),STR_TO_DATE('"+req.query.todate+"','%Y/%m/%d'))";
	    console.log(queryy);
	    connection.query(queryy,
       	function(err, rows)
       	{
      	
		
			if(!err)
			{
			res.status(200).json({'returnval': 'success'});
			}
			else
			{
				console.log(err);
			res.status(200).json({'returnval': 'invalid'});
			}
		
});
	});

app.post('/getstd' ,  urlencodedParser,function (req, res)
{	
	    connection.query('select distinct class from class_details ',
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



app.post('/getsec' ,  urlencodedParser,function (req, res)
{
		var std={"class":req.query.std};
	    connection.query('select section from class_details where ?',[std],
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



app.post('/getname' ,  urlencodedParser,function (req, res)
{
		var std={"class":req.query.std};
		var sec={"section":req.query.sec};
		var trans_req={"transport_required":"yes"};
	    connection.query('select student_name from student_details where class_id=(select id from class_details where ? and ?) and? ',[std,sec,trans_req],
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


app.post('/getstudetail' ,  urlencodedParser,function (req, res)
{
		var id={"student_name":req.query.studid};
	    connection.query('select * from student_details where ?',[id],
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



app.post('/getroute' ,  urlencodedParser,function (req, res)
{	
	    connection.query('select route_name from md_route',
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

app.post('/report-card',  urlencodedParser,function (req, res)
{

	var stu_id={"id":req.query.studid};
	var class_id={"class_id":req.query.studid};
	var stu_name={"student_name":req.query.studid};
       connection.query('SELECT s.id,s.student_name,(select class from class_details where id=s.class_id) as class_id,s.photo,s.dob,s.transport_required,z.zone_id,z.fees ,z.installment_1,z.installment_2 as total, z.fees-z.installment_1+z.installment_2 as due,(select point_name from point where id=(select pickup_point from student_point where student_id=s.id)) as pick,(select point_name from point where id=(select drop_point from student_point where student_id=s.id)) as drop1  from student_details s left join student_fee z on s.id=z.student_id where id in(select id from student_details where ? or ? or ? )',[stu_id,class_id,stu_name],
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
});
	});





app.post('/selectclass',  urlencodedParser,function (req, res)
{

       connection.query('SELECT distinct school_type from student_details',
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
});
	});
app.post('/classpick',  urlencodedParser,function (req, res)
{
	var class_id={"school_type":req.query.classes};
	var trans_req={"transport_required":"yes"};
	//console.log('in server...');
       connection.query('SELECT id, student_name from student_details where ? and ?',[class_id,trans_req],
       	function(err, rows)
       	{ 
		if(!err)
		{
		if(rows.length>0)
		{
			//console.log(rows);
			res.status(200).json({'returnval': rows});
		}
		else
		{
			res.status(200).json({'returnval': 'invalid'});
		}
	}
});
});

app.post('/pickpoints',  urlencodedParser,function (req, res)
{
		var route_id={"route_id":req.query.routept};
		
       connection.query('SELECT id, point_name from point where ?',[route_id],
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
});
});
app.post('/routedroppoint',  urlencodedParser,function (req, res)
{
		var route_id={"route_id":req.query.routedroppt};

       connection.query('SELECT id, point_name from point where ?',[route_id],
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
});
});
app.post('/routepoint',  urlencodedParser,function (req, res)
{
       connection.query('SELECT * from route', 
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
});
});

app.post('/submiturl',  urlencodedParser,function (req, res)
{
		var mappointtostudent={"student_id":req.query.studentid,"school_type":req.query.class_id,"pickup_route_id":req.query.pickroute,"pickup_point":req.query.pickpoint,"drop_route_id":req.query.droproute, "drop_point":req.query.droppoint};
		//console.log(mappointtostudent);
	    connection.query('insert into student_point set ?',[mappointtostudent],
       	function(err, rows) 
       	{
		if(!err)
		{
			res.status(200).json({'returnval': 'success'});
		}
		else
		{
			//console.log(err);
			res.status(200).json({'returnval': 'invalid'});
		}
	
});    
	});


app.post('/gettrip' ,  urlencodedParser,function (req, res)
{
		
		 var routen={"route_name":req.query.triproute};
		 //console.log('in server...');
		 //console.log(routen);
	    connection.query('select distinct trip from point where route_id=(select id from route where ?)',[routen],
       	function(err, rows)
       	{
		if(!err)
		{
			if(rows.length>0)
			{
				//console.log(rows);
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
app.post('/cancellation',  urlencodedParser,function (req, res)
{

	var stu_id={"id":req.query.studid};
	var class_id={"class_id":req.query.studid};
	var stu_name={"student_name":req.query.studid};
       connection.query('SELECT s.id,s.student_name,s.class_id,s.school_type,s.photo,s.dob,s.transport_required,z.zone_id,z.fees ,z.installment_1,z.installment_2 as total, z.fees-z.installment_1+z.installment_2 as due,(select point_name from point where id=(select pickup_point from student_point where student_id=s.id)) as pick,(select point_name from point where id=(select drop_point from student_point where student_id=s.id)) as drop1  from student_details s left join student_fee z on s.id=z.student_id where id in(select id from student_details where ? or ? or ? )',[stu_id,class_id,stu_name],
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
});
});
app.post('/cancel',  urlencodedParser,function (req, res){
	var school_type={"school_type":req.query.school_type};
	var student_id={"student_id":req.query.student_id};
	var end_transport=req.query.end_date;

	var queryy="SELECT student_id, DATEDIFF(STR_TO_DATE('"+end_transport+"', '%m/%d/%Y'),start_date) AS Days_used, DATEDIFF(end_date,start_date) AS Total_days, installment_1 + installment_2 as total, fees FROM transport_details join student_fee where ? and  ?";
    connection.query(queryy,[end_transport,school_type, student_id],
		function(err, rows){
       	if(err){
       		console.log(err);
       	}
			if(!err){
				if(rows.length>0){
					res.status(200).json({'returnval': rows});
				} else {
					console.log(err);
					res.status(200).json({'returnval': 'invalid'});
				}
			}
		});
});
app.post('/proceedcancel',  urlencodedParser,function (req, res){
	var collection={"student_id":req.query.student_id,"student_name":req.query.student_name,"months_used":req.query.months_used,"refund_amount":req.query.refund_amount, "status":"1", "reason":req.query.reason};
    connection.query('insert into cancellation set ?',[collection],
	function(err, rows){
		if(err){
			console.log(err);
		}
		if(!err){
			if(rows.length>0){
				res.status(200).json({'returnval': rows});
			} else {
				console.log(err);
				res.status(200).json({'returnval': 'invalid'});
			}
		}
	});
	});
app.post('/transportrequiredstatus',  urlencodedParser,function (req, res)
{
	var student_id = {"id":req.query.student_id};
	var transport_required = {"transport_required":'no'};
    connection.query('update student_details set ? where ? ',[transport_required,student_id],
       	function(err, rows)
       	{
       	if(err){
       		console.log(err);
       	}
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
});
	});


app.post('/reportfee-card',  urlencodedParser,function (req, res)
{

	var stu_id={"id":req.query.studid};
	var class_id={"class_id":req.query.studid};
	var stu_name={"student_name":req.query.studid};
       connection.query('SELECT s.id,s.student_name,(select class from class_details where id=s.class_id) as class_id,s.photo,s.dob,s.transport_required,z.zone_id,z.fees ,z.installment_1,z.installment_2,z.installment_1+z.installment_2 as total, z.fees-(z.installment_1+z.installment_2) as due,z.fees/2 as install,z.installment_1Date,z.installment_2Date,z.modeofpayment1,z.modeofpayment2,(select point_name from point where id=(select pickup_point from student_point where student_id=s.id)) as pick,(select point_name from point where id=(select drop_point from student_point where student_id=s.id)) as drop1  from student_details s left join student_fee z on s.id=z.student_id where id in(select id from student_details where ? or ? or ? )',[stu_id,class_id,stu_name],
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
});
	});




app.post('/getnameofstu-card',  urlencodedParser,function (req, res)
{

       connection.query('SELECT student_name from student_details',
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
});
	});


app.post('/payfee-card',  urlencodedParser,function (req, res)
{
		var d = new Date();
		var studid={"student_id":req.query.studid};
		var mode={"modeofpayment1":req.query.paytype};
		var install1={"installment_1":req.query.installfee};
		var install1date={"installment_1Date":d}
	    connection.query('update  student_fee set ?,?,? where ?',[mode,install1,install1date,studid],
       	function(err, rows) 
       	{
		if(!err)
		{
			res.status(200).json({'returnval': 'success'});
		}
		else
		{
			console.log(err);
			res.status(200).json({'returnval': 'invalid'});
		}
	
});    
	});
app.post('/chequedetails',  urlencodedParser,function (req, res)
{
		
		var studid={"student_id":req.query.studid,"name":req.query.name,"cheque_no":req.query.chequenum,"bank_name":req.query.bankname,"cheque_date":req.query.chequedate};
	    connection.query('insert into cheque_details  set ?',[studid],
       	function(err, rows) 
       	{
		if(!err)
		{
			res.status(200).json({'returnval': 'success'});
		}
		else
		{
			console.log(err);
			res.status(200).json({'returnval': 'invalid'});
		}
	
});    
	});



app.post('/payfee2-card',  urlencodedParser,function (req, res)
{
	var d = new Date();
		
		var studid={"student_id":req.query.studid};
		var mode={"modeofpayment2":req.query.paytype};
		var install1={"installment_2":req.query.installfee};
		var install1date={"installment_2Date":d}
	    connection.query('update  student_fee set ?,?,? where ?',[mode,install1,install1date,studid],
       	function(err, rows) 
       	{
		if(!err)
		{
			res.status(200).json({'returnval': 'success'});
		}
		else
		{
			console.log(err);
			res.status(200).json({'returnval': 'invalid'});
		}
	
});    
	});
app.post('/chequedetails2',  urlencodedParser,function (req, res)
{
		
		var studid={"student_id":req.query.studid,"name":req.query.name,"cheque_no":req.query.chequenum,"bank_name":req.query.bankname,"cheque_date":req.query.chequedate};
	    connection.query('insert into cheque_details  set ?',[studid],
       	function(err, rows) 
       	{
		if(!err)
		{
			res.status(200).json({'returnval': 'success'});
		}
		else
		{
			console.log(err);
			res.status(200).json({'returnval': 'invalid'});
		}
	
});    
	});


app.post('/refund-card',  urlencodedParser,function (req, res)
{

       connection.query('SELECT student_id,student_name,refund_amount,reason,DATE_FORMAT( cancelled_date, "%d/%m/%Y" ) as cancelled_date from  cancellation where status=1',
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
});
	});


app.post('/approval-card',  urlencodedParser,function (req, res)
{
		


		var studid={"student_id":req.query.studid};
		console.log(studid);
	    connection.query('update  cancellation set status=2 where ?',[studid],
       	function(err, rows) 
       	{
		if(!err)
		{
			console.log("success");
			res.status(200).json({'returnval': 'success'});
		}
		else
		{
			console.log(err);
			res.status(200).json({'returnval': 'invalid'});
		}
	
});    
	});

app.post('/name',  urlencodedParser,function (req, res){

       connection.query('select student_id, student_name from student_details join student_fee on student_fee.student_id=student_details.id',
       	function(err, rows)
       	{
       		if(err){
       			console.log(err);
       		}
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
});
	});

app.post('/getfeedata' ,  urlencodedParser,function (req, res)
{	
		var studid={"student_id":req.query.studid};
	    connection.query('select student_id,zone_id,fees,from_date,to_date from student_fee where ?',[studid],
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


app.post('/getfeezone' ,  urlencodedParser,function (req, res)
{	
		var zoneid={"id":req.query.zone};
	    connection.query('select zone_name from md_zone where ?',[zoneid],
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


app.post('/getfeename' ,  urlencodedParser,function (req, res)
{	
		var stid={"id":req.query.sid};
	    connection.query('select student_name,school_type from student_details where ?',[stid],
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

app.post('/sendrequest',  urlencodedParser,function (req, res)
{
	
    var queryyz="insert into md_discount values('"+req.query.stid+"','"+req.query.stname+"','"+req.query.schooltypezx+"','"+req.query.zoname+"',"+req.query.feesx+",STR_TO_DATE('"+req.query.fromdatx+"','%Y/%m/%d'),STR_TO_DATE('"+req.query.todatx+"','%Y/%m/%d'),'"+req.query.disamtx+"','"+req.query.reasonx+"','Requested',3,STR_TO_DATE('"+req.query.todayx+"','%Y/%m/%d'),null,null)";
	    console.log(queryyz);
	    connection.query(queryyz,
       	function(err, rows)
       	{
		if(!err)
		{
			res.status(200).json({'returnval': 'success'});
		}
		else
		{
			console.log(err);
			res.status(200).json({'returnval': 'invalid'});
		}
	
});
	});




app.post('/generatereportbyname',  urlencodedParser,function (req, res)
{

       connection.query('SELECT student_name from student_details',
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
});
	});


app.post('/deletemappoint-card',  urlencodedParser,function (req, res)
{
console.log('come');
	var ptarr=req.query.pointarray;
	var rtname=req.query.routenam;
	var trip1=req.query.tripnum;
console.log('come'+ptarr);
       connection.query('delete from point where point_name in (?) and trip=? and route_id=(select id from route where route_name=?)',[ptarr,trip1,rtname],
       	function(err, rows)
       	{
		if(!err)
		{
			console.log('suc');
			res.status(200).json({'returnval': rows});
		}
		else
		{
			console.log(err);
			res.status(200).json({'returnval': 'invalid'});
		}
	
});
});


app.post('/getstudapproval',  urlencodedParser,function (req, res)
{
	
	    connection.query('SELECT * from md_discount where flag=3',
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


app.post('/confirmdisc',  urlencodedParser,function (req, res)
{
	var val={"stud_id":req.query.stid};
	var vari={"admin_reason":req.query.admrea,"approve_discount":req.query.accdis,"updatation":req.query.nowdate,"status":req.query.status,"flag":req.query.flag};
	    connection.query('update md_discount set ? where ? ',[vari,val],
       	function(err, rows)
       	{
		if(!err)
		{
			res.status(200).json({'returnval': 'success'});
		}
		else
		{
			console.log(err);
			res.status(200).json({'returnval': 'invalid'});
		}
	
});
	});


app.post('/getapprovalverify',  urlencodedParser,function (req, res)
{
	
	    connection.query('SELECT * from md_discount where flag=2',
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


app.post('/confirmedfee',  urlencodedParser,function (req, res)
{
	
    var val={"stud_id":req.query.stid};
	var vari={"updatation":req.query.date,"status":req.query.status,"flag":req.query.flag};
	    connection.query('update md_discount set ? where ? ',[vari,val],
       	function(err, rows)
       	{
		if(!err)
		{
			res.status(200).json({'returnval': 'success'});
		}
		else
		{
			console.log(err);
			res.status(200).json({'returnval': 'invalid'});
		}
	
});
	});

app.post('/confirmfee',  urlencodedParser,function (req, res)
{
	
    var val={"student_id":req.query.stid};
	var vari={"fees":req.query.fees};
	    connection.query('update student_fee set ? where ? ',[vari,val],
       	function(err, rows)
       	{
		if(!err)
		{
			res.status(200).json({'returnval': 'success'});
		}
		else
		{
			console.log(err);
			res.status(200).json({'returnval': 'invalid'});
		}
	
});
	});


app.post('/cancelledfee',  urlencodedParser,function (req, res)
{
	
    var val={"stud_id":req.query.stid};
	var vari={"status":req.query.status,"flag":req.query.flag};
	    connection.query('update md_discount set ? where ? ',[vari,val],
       	function(err, rows)
       	{
		if(!err)
		{
			res.status(200).json({'returnval': 'success'});
		}
		else
		{
			console.log(err);
			res.status(200).json({'returnval': 'invalid'});
		}
	
});
	});


function setvalue()
{
	console.log("calling setvalue.....");
}

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})
