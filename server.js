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
		 console.log(routename);
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


app.post('/gradediscount' ,  urlencodedParser,function (req, res)
{
		
		 var gradename={"grade_type":req.query.grade};
		 console.log(gradename);
	    connection.query('select discount_percent from md_discount where ?',[gradename], 
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


app.post('/addcalc' ,  urlencodedParser,function (req, res)
{
	var gradeid={"grade_id":req.query.id};
	console.log(gradeid);
	    connection.query('select * from md_discount where ? ',[gradeid],
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
	var stdzone={"student_id":req.query.studid,"zone_id":req.query.zone,"installment_1":0,"installment_2":0,"fees":req.query.fee};
	    connection.query('insert into student_fee set ? ',[stdzone],
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
	    connection.query('select id,student_name from student_details where class_id=(select id from class_details where ? and ?) and? ',[std,sec,trans_req],
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
		var id={"id":req.query.studid};
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
	console.log(stu_id);
       connection.query('SELECT s.id,s.student_name,s.class_id,s.photo,s.dob,s.transport_required,z.zone_id,z.fees ,z.installment_1,z.installment_2 as total, z.fees-z.installment_1+z.installment_2 as due,(select point_name from point where id=(select pickup_point from student_point where student_id=s.id)) as pick,(select point_name from point where id=(select drop_point from student_point where student_id=s.id)) as drop1  from student_details s left join student_fee z on s.id=z.student_id where id in(select id from student_details where ? or ? or ? )',[stu_id,class_id,stu_name],
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



function setvalue()
{
	console.log("calling setvalue.....");
}

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})