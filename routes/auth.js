// Add Passport-related auth routes here.

var express = require('express');
var router = express.Router();
var models = require('../models/models');
const https = require('https');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const fs = require('fs');
const AWS = require('aws-sdk');

// Enter copied or downloaded access ID and secret key here
console.log("1");
const ID = 'AKIAICV3ZHL6P7A2HU3A';
const SECRET = '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';
// The name of the bucket that you have created
const BUCKET_NAME = 'girlhub-bucket';

console.log("2");
const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
});
console.log("3");
const params = {
    Bucket: BUCKET_NAME,
    CreateBucketConfiguration: {
        // Set your region here
        LocationConstraint: "us-west-1"
    }
};
console.log("4");
s3.createBucket(params, function(err, data) {
    if (err) console.log(err, err.stack);
    else console.log('Bucket Created Successfully', data.Location);
});
console.log("5");
const uploadFile = (fileName) => {
    // Read content from the file
    console.log("6");
    console.log("fileName");
    console.log(fileName);
    const fileContent = fs.readFileSync(fileName);
    console.log("17");
    // Setting up S3 upload parameters
    const params = {
        Bucket: BUCKET_NAME,
        Key: 'cat.jpg', // File name you want to save as in S3
        Body: fileContent
    };
    // Uploading files to the bucket
    console.log("8");
    s3.upload(params, function(err, data) {
        if (err) {
            throw err;
        }
        console.log(`File uploaded successfully. ${data.Location}`);
    });
    console.log("9");
};

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

  router.post('/fileupload', function(req, res) {
    console.log("file upload");
    console.log(req.data);
    console.log(req.body);
    let form = new multiparty.Form();

    form.parse(req, function(err, fields, files) {
       Object.keys(fields).forEach(function(name) {
            console.log('got field named ' + name);
        });
    });
  });

  router.post('/signup', function(req, res) {
    if (!validateReq(req.body)) {
      return res.render('signup', {
        error: "Passwords don't match."
      });
    }
    console.log('req.body', req.body)
    console.log("req.body.profilePhoto");
    console.log(req.body.profilePhoto);
    console.log("upload file start");
    uploadFile(req.body.profilePhoto);
    console.log("upload file end");

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

  router.get('/linkedin', function(req, res) {
    console.log("linkedin");
    res.redirect("https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=78w1f2pk5r3x2y&redirect_uri=https://infinite-garden-97012.herokuapp.com/auth/linkedin/callback&state=fooobar&scope=r_liteprofile%20r_emailaddress%20w_member_social");
  });

  router.get('/auth/linkedin/callback', function(req, res) {
    console.log("callback");

    const accessCode = req.query.code;
    var clientId = "78w1f2pk5r3x2y";
    var clientSecret = "7XrmOoEUZC27RAUN";
    var accessToken = null;

    const Http = new XMLHttpRequest();
    const url='https://www.linkedin.com/oauth/v2/accessToken?client_id='+clientId+'&client_secret='+clientSecret+'&grant_type=authorization_code&redirect_uri=https://infinite-garden-97012.herokuapp.com/auth/linkedin/callback&code='+accessCode;
    Http.open("GET", url);
    Http.send();
    Http.onreadystatechange = (e) => {
      console.log("type of HttpResonseText");
      console.log(typeof Http.responseText);
      accessToken = Http.responseText.slice(17, Http.responseText.length-23);
      console.log(accessToken);

      // This sample code will make a request to LinkedIn's API to retrieve and print out some
      // basic profile information for the user whose access token you provide.
      // Replace with access token for the r_liteprofile permission
      if (accessToken != null) {

        // printing info
        const options = {
          host: 'api.linkedin.com',
          path: '/v2/me',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'cache-control': 'no-cache',
            'X-Restli-Protocol-Version': '2.0.0'
          }
        };
        const profileRequest = https.request(options, function(res) {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            console.log('gets in here?')
            const profileData = JSON.parse(data);
            console.log(profileData);
            // console.log(JSON.stringify(profileData, 0, 2));
            // console.log("profileData.firstName.en_US");
            //console.log("LAST NAME");
            //console.log(profileData.lastName.localized.en_US);
            // console.log("profileData.lastName.en_US");
            // console.log(profileData.lastName.en_US);
          });
        });
        profileRequest.end();

        // print image photo
        // GET https://api.linkedin.com/v2/me?projection=(id,profilePicture(displayImage~digitalmediaAsset:playableStreams))
        const options2 = {
          host: 'api.linkedin.com',
          path: '/v2/me?projection=(id,profilePicture(displayImage~digitalmediaAsset:playableStreams))',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'cache-control': 'no-cache',
            'X-Restli-Protocol-Version': '2.0.0'
          }
        };
        const profileRequest2 = https.request(options2, function(res) {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            console.log('prints email?')
            const profileData = JSON.parse(data);

            console.log("profileData");
            console.log(profileData);

            console.log("JSON.stringify(profileData, 0, 2)");
            console.log(JSON.stringify(profileData, 0, 2));

            console.log("profileData.elements.identifiers");
            console.log(profileData.elements.identifiers);

            // var profileString = JSON.stringify(profileData.elements);
            // console.log(profileString);
            // var profileArray = profileString.split(`"`);
            // console.log(profileArray);
          });
        });
        profileRequest2.end();


        // printing email
        // const options2 = {
        //   host: 'api.linkedin.com',
        //   path: '/v2/emailAddress?q=members&projection=(elements*(handle~))',
        //   method: 'GET',
        //   headers: {
        //     'Authorization': `Bearer ${accessToken}`,
        //     'cache-control': 'no-cache',
        //     'X-Restli-Protocol-Version': '2.0.0'
        //   }
        // };
        // const profileRequest2 = https.request(options2, function(res) {
        //   let data = '';
        //   res.on('data', (chunk) => {
        //     data += chunk;
        //   });
        //   res.on('end', () => {
        //     console.log('prints email?')
        //     const profileData = JSON.parse(data);
        //
        //     console.log("profileData");
        //     console.log(profileData);
        //
        //     console.log("JSON.stringify(profileData, 0, 2)");
        //     console.log(JSON.stringify(profileData, 0, 2));
        //
        //     console.log("profileData.elements");
        //     console.log(profileData.elements);
        //
        //     // var profileString = JSON.stringify(profileData.elements);
        //     // console.log(profileString);
        //     // var profileArray = profileString.split(`"`);
        //     // console.log(profileArray);
        //   });
        // });
        // profileRequest2.end();


      }

    }

    res.render('login')
  });

  return router;
};
