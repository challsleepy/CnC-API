const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const config = require('./config.json');

app.use(cors(
    {
        origin: 'https://ranks.codenchill.org',
        optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
    }
));

app.use(function (req, res, next) {
    res.header('Content-Type', 'application/json;charset=UTF-8')
    res.header('Access-Control-Allow-Credentials', true)
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    )
    next()
})

// Import Routes
const XPSystemRoute = require('./routes/XPSystem');

// Middlewares
app.use(bodyParser.urlencoded({
    extended: true
}));


// Route Middlewares
app.use('/xp-system', XPSystemRoute);

app.set('trust proxy', true)
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(`mongodb://${config.mongoDB.username}:${config.mongoDB.password}@${config.mongoDB.host}:${config.mongoDB.port}/${config.mongoDB.database}?authSource=${config.mongoDB.authSource}`)
	.then(() => {
		app.listen(config.port);
		console.log('Connected to database and listening on port 4500')
	});