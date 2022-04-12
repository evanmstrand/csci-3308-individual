//Used Lab 10 Template!!

/***********************
  Load Components!

  Express      - A Node.js Framework
  Body-Parser  - A tool to help use parse the data in a post request
  Pg-Promise   - A database tool to help use connect to our PostgreSQL database
***********************/
const express = require('express'); //Ensure our express framework has been added
const app = express();
var bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
app.use(bodyParser.json());              // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
const axios = require('axios');

//const qs = require('query-string');

//Create Database Connection
var pgp = require('pg-promise')();

const dev_dbConfig = {
	host: 'db',
	port: 5432,
	database: process.env.POSTGRES_DB,
	user:  process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD
};

/** If we're running in production mode (on heroku), the we use DATABASE_URL
 * to connect to Heroku Postgres.
 */
const isProduction = process.env.NODE_ENV === 'production';
const dbConfig = isProduction ? process.env.DATABASE_URL : dev_dbConfig;

// Heroku Postgres patch for v10
// fixes: https://github.com/vitaly-t/pg-promise/issues/711
if (isProduction) {
  pgp.pg.defaults.ssl = {rejectUnauthorized: false};
}

const db = pgp(dbConfig);

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/'));//This line is necessary for us to use relative paths and access our resources directory


//home page
app.get('/', function(req, res) {
	res.render('pages/home',{
		my_title:"Home Page",
		data: ''
	});
});

app.get('/home', function(req, res) {
	res.render('pages/home',{
		my_title:"Home Page",
		data: ''
	});
});

// review page
app.get('/reviews', function(req, res) {
	var allReviews = 'SELECT * FROM review_table;';
	db.task('get-everything', task=>{
		return task.batch([
			task.any(allReviews)
		]);
	})
	.then(info => {

		res.render('pages/reviews',{
			my_title:"Review Page",
			result: info[0]
		});
	})

	.catch(error => {
		console.log('Uh Oh I made an oopsie');
		req.flash('error', err);
		res.render('pages/reviews', {
			my_title: '',
			result: '',
		})
	});
	
});

app.post('/add_review', function(req, res){
	var artist = req.body.artistName;
	var review = req.body.review;
	//var date = '20210430';
	var insert_statement = "INSERT INTO review_table(artist, review) VALUES('"+ artist +"','" + review +"') ON CONFLICT DO NOTHING;";
	var allReviews = 'SELECT * FROM review_table;';
	db.task('get-everything', task => {
		return task.batch([
			task.any(insert_statement),
			task.any(allReviews)
		]);
	})
	.then(info => {

		res.render('pages/reviews',{
			my_title:"Review Page",
			result: info[1]
		});
		//console.log(info[0]);
	})

	.catch(error => {
		console.log('Uh Oh I made an oopsie');
		req.flash('error', err);
		res.render('pages/reviews', {
			my_title: '',
			result: '',
		})
	});
	
});

app.post('/sort_table', function(req, res){
	var sort = req.body.sort;
	var sortedDB = "SELECT * FROM review_table WHERE artist= '" + sort + "';";
	db.task('get-everything', task=>{
		return task.batch([
			task.any(sortedDB)
		]);
	})
	.then(info => {

		res.render('pages/reviews',{
			my_title:"Review Page",
			result: info[0]
		});
		//console.log(info[0]);
	})

	.catch(error => {
		console.log('Uh Oh I made an oopsie');
		req.flash('error', err);
		res.render('pages/reviews', {
			my_title: '',
			result: '',
		})
	});
	
});

app.post('/get_feed', function(req, res) {
	var search = req.body.search;
	if(search) {
	  axios({
		url:`https://www.theaudiodb.com/api/v1/json/1/search.php?s=${search}`,
		  method: 'GET',
		  dataType:'json',
		})
		  .then(items => {
			console.log(items.data.artists[0].strArtist);
			res.render('pages/home',{
			  my_title: "home search output",
			  data: items.data.artists[0]
			 
			})
			
		  })
		  .catch(error => {
			console.log(error);
			res.render('pages/home',{
			  my_title: "home search err",
			  data:'',
			  items: '',
			  error: true,
			  message: error
			})
		  });
  
  
	}
	else {
	  res.render('pages/home',{
		message: "no names"
	  })
	}
  });




//app.listen(3000);
const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Express running → PORT ${server.address().port}`);
});