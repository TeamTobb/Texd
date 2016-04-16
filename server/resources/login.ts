var express = require('express')
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy
var Account = require('../dao/userModel');
var router = express.Router();
var path = require('path');
var jwt = require('jwt-simple')

var secret = 'hey ho'

passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

passport.use(new BearerStrategy(
    function (token, done) {
        try {
            var decoded = jwt.decode(token, secret);
            Account.findOne({ username: decoded.username }, function (err, user) {
                if (err) {
                    console.log("error")
                    return done(err);
                }
                if (!user) {
                    console.log("no user")
                    return done(null, false);
                }
                console.log("correct! :D")
                return done(null, user, { scope: 'all' });
            });
        }
        catch (error) {
            console.log("catch error: " + error)
            return done(null, false)
        }
    }
));

router.post('/login', passport.authenticate('local'), (req, res, next) => {
    findUser(req.user.username, (user) => {
        if (user) {
            console.log('login: ' + req.user)
            var token = jwt.encode(req.user, secret);
            res.json({ success: true, token: token });
        } else {
            res.json({ success: false })
        }
    })
});

router.post('/register', (req, res) => {
    Account.register(new Account({ username: req.body.username }), req.body.password, (err, account) => {
        if (err) {
            res.send(err);
        } else {
            res.send({ success: true });
        }
    });
});

router.get('/secret', passport.authenticate('bearer', { session: false }), (req, res) => {
    res.json({ success: true });
})

function findUser(username, callback) {
    Account.findOne({ username: username }, (error, user) => {
        if (error) {
            callback(null)
        } if (user) {
            callback(user)
        }
    })
}

module.exports = router;
