var express = require('express');
var router = express.Router();
var models = require('../models/models');
var User = models.User;
var Follow = models.Follow;
var Tweet = models.Tweet;
var followString = 'Follow';

router.get('/sign-s3', function(req, res) {
  console.log('a')
  const s3 = new aws.S3();
  const fileName = req.query['file-name'];
  const fileType = req.query['file-type'];
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: 'public-read'
  };
  s3.getSignedUrl('putObject', s3Params, function(err, data) {
    if(err){
      console.log('b')
      console.log(err);
      return res.end();
    }
    const returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
    };
    console.log('returnData', returnData);
    res.write(JSON.stringify(returnData));
    res.end();
  });
});

// Load the AWS SDK for Node.js
// var AWS = require('aws-sdk');
// Set the region
// AWS.config.update({region: 'REGION'});

// Create S3 service object
// s3 = new AWS.S3({apiVersion: '2006-03-01'});

// call S3 to retrieve upload file to specified bucket
// var uploadParams = {Bucket: process.argv[2], Key: '', Body: ''};
// var file = process.argv[3];

// Configure the file stream and obtain the upload parameters
// var fs = require('fs');
// var fileStream = fs.createReadStream(file);
// fileStream.on('error', function(err) {
//   console.log('File Error', err);
// });
// uploadParams.Body = fileStream;
// var path = require('path');
// uploadParams.Key = path.basename(file);

// call S3 to retrieve upload file to specified bucket
// s3.upload (uploadParams, function (err, data) {
//   if (err) {
//     console.log("Error", err);
//   } if (data) {
//     console.log("Upload Success", data.Location);
//   }
// });

// const S3_BUCKET = process.env.S3_BUCKET;
//
// router.get('/sign-s3', function(req, res) {
//   console.log('a');
//   const s3 = new aws.S3();
//   const fileName = req.query['file-name'];
//   const fileType = req.query['file-type'];
//   const s3Params = {
//     Bucket: S3_BUCKET,
//     Key: fileName,
//     Expires: 60,
//     ContentType: fileType,
//     ACL: 'public-read'
//   };
//   s3.getSignedUrl('putObject', s3Params, function(err, data) {
//     if(err){
//       console.log('b')
//       console.log(err);
//       return res.end();
//     }
//     const returnData = {
//       signedRequest: data,
//       url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
//     };
//     console.log('returnData', returnData);
//     res.write(JSON.stringify(returnData));
//     res.end();
//   });
// });

// THE WALL - anything routes below this are protected by our passport (user must be logged in to access these routes)!
router.use(function(req, res, next){
  if (!req.user) {
    res.redirect('/login');
  } else {
    return next();
  }
});

router.get('/users/', function(req, res, next) {

  // Gets all users

});

// the community page
router.get('/users/:userId', function(req, res, next) {
  var allUsers = null;
  models.User.find(function(err, users) {
    if (err) {
      return done(err);
    } else {
      allUsers = users;
      return users;
    }
  });
  // req.params.userId
  models.User.findOne({_id: req.params.userId}, function(err, user) {
    //if error
    user.getFollows();
    console.log('USER', user);
    if (err) {
      res.json({'error': 'Cannot decode token.'});
    }
    //if no userId present auth failed
    if (!user) {
      res.json({'error': 'Cannot decode token.'});
    }
    // return user
    console.log('user.email', user.email);
    res.render('community', { user: user, allUsers: allUsers, follow: followString });
  });
});

// the profile page
router.get('/profile', function(req, res, next) {
  var userId = req.user._id;
  models.User.findOne({_id: userId}, function(err, user) {
    //if error
    user.getFollows();
    if (err) { res.json({'error': 'Cannot get user.'}); }
    // if no userId present auth failed
    if (!user) { res.json({'error': 'No user exists.'}); }
    // return user
    res.render('profile', { user: user, follow: followString });
  });
});
router.post('/profile', function(req, res) {
  // res.redirect('/user/' + req.user._id);
  console.log("4");
  console.log('req.user');
  console.log(req.user);
  console.log('req.body')
  console.log(req.body);
  let updateValues = { bio: 'changed bio' };
  models.User.update(updateValues, { where: { email: "mik@gmail.com" } }).then((result) => {
      // here your result is simply an array with number of affected rows
      console.log(result);
      // [ 1 ]
  });
  // User.update({
  //   bio: 'aye',
  // }, {where: {email: 'mik@gmail.com'}})
  // .then(function(){
  //   // res.json({user: req.user})
  //   res.redirect('/profile');
  // })
  // .catch(function(err) {console.log('user not updated', err)})
});
// router.get('/user/:userId', function (req, res, next) {
//   console.log("3");
//   console.log(req.body);
 //  models.User.update(
 //   {bio: req.body.bio},
 //   {returning: true, where: {id: req.user._id} }
 // )
 // .then(function(){
 //   res.json({user: req.user})
 //   // res.redirect('/profile')
 // })
 // .catch(function(err){console.log('user not updated', err)})

// })



// router.post('/profile', function(req, res, next) {
//   console.log("post profile body")
//   console.log(req.body);
//   console.log(req.user.email);
//   models.User.update({
//     email: req.user.email,
//     password: req.user.password,
//     displayName: req.body.displayName,
//     imgUrl: req.body.imgUrl,
//     bio: req.body.bio,
//     jobDescription: req.body.jobDescription,
//     previousJob: req.body.previousJob,
//     previousJobDescription: req.body.previousJobDescription
//   }, {where: {email: req.user.email}})
//   .then(function(){
//     res.json({user: req.user})
//     // res.redirect('/profile')
//   })
//   .catch(function(err){console.log('user not updated', err)})
// });
// router.post('/profile', function(req, res) {
//   var userId = req.user.id;
//   console.log('inside profile POST');
//   console.log(req.body);
  // models.User.findOne({_id: userId}, function(err, user) {
  //   .on('success', function (user) {
  //     // Check if record exists in db
  //     if (user) {
  //       user.update({
  //         displayName: req.body.displayName,
  //         bio: req.body.bio,
  //         jobDescription: req.body.jobDescription,
  //         previousJob: req.body.previousJob,
  //         previousJobDescription: req.body.previousJobDescription
  //       })
  //       .success(function () {})
  //     }
  //   })
  // })
  // models.User.findOne({ _id: userId }, function(err, user) {
  //   if (err) { res.json({'error': 'Cannot get user.'}); }
  //   if (!user) { res.json({'error': 'No user exists.'}); }
  //   if (user) {
  //     console.log('user is found')
  //     console.log(user);
  //     console.log(req.body);
  //     models.User.update(
  //       {bio: req.body.bio},
  //       {returning: true, where: {_id: userId} }
  //     )
  //     .then(function([ rowsUpdate, [updatedUser] ]) {
  //       res.json(updatedUser)
  //     })
  //    }
      // user.update({
      //   email: user.email,
      //   password: user.password,
      //   displayName: req.body.displayName,
      //   bio: req.body.bio,
      //   jobDescription: req.body.jobDescription,
      //   previousJob: req.body.previousJob,
      //   previousJobDescription: req.body.previousJobDescription
      // })
    // }
//   })
//
// });


router.get('/tweets/', function(req, res, next) {

  // Displays all tweets in the DB

});

router.get('/tweets/:tweetId', function(req, res, next) {

  //Get all information about a single tweet

});

router.get('/tweets/:tweetId/likes', function(req, res, next) {

  //Should display all users who like the current tweet

});

router.post('/tweets/:tweetId/likes', function(req, res, next) {

  //Should add the current user to the selected tweets like list (a.k.a like the tweet)

});

router.get('/tweets/new', function(req, res, next) {

  //Display the form to fill out for a new tweet

});

router.post('/tweets/new', function(req, res, next) {

  // Handle submission of new tweet form, should add tweet to DB

});

// shortcut.add("Ctrl+B", function() {
//   alert("The bookmarks of your browser will show up after this alert");
// }, { 'type':'keydown', 'propagate':true, 'target':document});

// var btn = window.document.getElementById("pintrest");
// btn.onclick = function () {
//     var e = window.document.createElement('script');
//     e.setAttribute('type', 'text/javascript');
//     e.setAttribute('charset', 'UTF-8');
//     e.setAttribute('src', 'http://assets.pinterest.com/js/pinmarklet.js?r=' + Math.random() * 99999999);
//     window.document.body.appendChild(e);
// };

// window.addEventListener('load', yourFunction, false);
//
// window.addEventListener('DOMContentLoaded', yourFunction, false);


router.post('/follow/:userId', function(req, res, next) {
  // user id of current person
  // user id of person you're following
  //
  console.log('req.user._id', req.user._id)
  console.log('req.params.userId', req.params.userId)
  Follow.findOne({follower: req.user._id, following: req.params.userId},
      function(err, result) {
          if(err){
              res.send(err)
          } else {
              console.log('UNFOLLOW JUST RAN')
              console.log('RESULT FOUND', result)
              if (result) {
                  result.remove(function(err) {
                    if (err) {
                      res.status(500);
                      res.json({'error': 'Did not remove token.'});
                    } else {
                      res.status(200);
                      res.redirect('/users/' + req.params.userId)
                    }
                  });
              } else {
                  var newFollow = new Follow({
                      follower: req.user._id,
                      following: req.params.userId
                  })
                  newFollow.save(function(err, result) {
                      if(err){
                          res.send(err)
                      } else {
                          console.log('FOLLOW JUST RAN')
                          followString = 'Unfollow'
                          res.redirect('/users/' + req.params.userId)
                      }
                  })
              }
          }
      })
})





module.exports = router;
