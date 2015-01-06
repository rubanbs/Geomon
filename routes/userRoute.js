var express = require('express');
var app = require('../app')
var router = express.Router();
var configdb = require('../config/database.js');
var geo = require('../lib/geo.js');

var mongoose = require('mongoose');

router.get('/', app.isAuthenticated, function (req, res) {
    res.render('user/map', { layout: './user/_layout' });
})

router.post('/load', app.isAuthenticated, function (req, res) {

    var User = mongoose.model('User')

    User.find({ 'email': req.user.email }, 'name lon lat update updateInterval iconType color', function (err, users) {
        if (err) throw err;
        res.json(users)
    })
});

router.post('/update', app.isAuthenticated, function (req, res) {

    var User = mongoose.model('User')

    User.findOne({ 'email': req.user.email }, function (err, user) {
        if (err) throw err;
        if (!user) throw new Error('No user found');

        var lon = req.body.position.lon;
        var lat = req.body.position.lat;
        var update = Date.now();

		user.lon = lon;
		user.lat = lat;
		user.update = update;

		var pos = {
			lon: lon,
			lat: lat,
			update: update
		}

		if (user.track.length > 0) {
			var prev = user.track[user.track.length - 1];
			if (geo.calcCrow(prev.lat, prev.lon, pos.lat, pos.lon) * 1e3 <= configdb.proximity) {
				user.track.pop();
			}
		}
		
		user.track.push(pos);

		if (configdb.trackSize >= 0 && user.track.length > configdb.trackSize) {
			user.track = user.track.slice(-configdb.trackSize);
		}

		user.save()
    })

    res.json({})
})

router.post('/history', app.isAuthenticated, function (req, res) {

    var User = mongoose.model('User')

    var period;

    switch (req.body.period) {
        case 0: period = 0; break;
        case 1: period = 1; break;
        case 3: period = 3; break;
        default: period = -1; break;
    }

    // TO+DO implement periods
    User.findOne({ 'email': req.user.email }, 'track update', function (err, user) {
        if (err) throw err;
        res.json({ user: user })
    })

})

router.post('/settings', app.isAuthenticated, function (req, res) {

    var User = mongoose.model('User')

    User.findOne({ 'email': req.user.email }, function (err, user) {

        if (err) throw err;

        if (!user) throw new Error('No user found');

        user.name = req.body.name;

        user.save()
    })

    res.json()

})

module.exports = router;