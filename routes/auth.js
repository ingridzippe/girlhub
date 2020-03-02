// Add Passport-related auth routes here.

var express = require('express');
var router = express.Router();
var models = require('../models/models');


module.exports = function(passport) {

  router.get('/', function(req, res) {
    res.redirect('/login');
  });
  // GET registration page
  router.get('/signup', function(req, res) {
    res.render('signup');
  });

  // POST registration page
  var validateReq = function(userData) {
    return (userData.password === userData.passwordRepeat);
  };

  router.post('/signup', function(req, res) {
    if (!validateReq(req.body)) {
      return res.render('signup', {
        error: "Passwords don't match."
      });
    }
    console.log('req.body', req.body)

    var u = new models.User({
      // Note: Calling the email form field 'username' here is intentional,
      //    passport is expecting a form field specifically named 'username'.
      //    There is a way to change the name it expects, but this is fine.
      imgURL: req.body.profilePhoto,
      displayName: req.body.displayName,
      bio: req.body.bio,
      email: req.body.username,
      password: req.body.password,
      jobDescription: '',
      previousJob: '',
      previousJobDescription: ''
    });

    u.save(function(err, user) {
      if (err) {
        console.log(err);
        res.status(500).redirect('/register');
        return;
      }
      console.log(user);
      res.redirect('/login');
    });
  });

  // GET Login page
  router.get('/login', function(req, res) {
    // console.log('window.location.pathname', window.location.pathname);
    // console.log('window.location.href', window.location.href);
    // console.log('$(location).attr('href')', $(location).attr('href'));
    // console.log('$(location).attr('pathname')', $(location).attr('pathname'));
    res.render('login');
  });

  // POST Login page
  router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/users/' + req.user._id);
  });

  // GET Logout page
  router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
  });

  return router;
};
