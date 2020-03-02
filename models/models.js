var mongoose = require('mongoose');

// Step 0: Remember to add your MongoDB information in one of the following ways!
var connect = process.env.MONGODB_URI || require('./connect');
mongoose.connect(connect);

var userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: false
  },
  imgUrl: {
    type: String,
    required: false
  },
  bio: {
    type: String,
    required: false
  },
  jobDescription: {
    type: String,
    required: false
  },
  previousJob: {
    type: String,
    required: false
  },
  previousJobDescription: {
    type: String,
    required: false
  }
  /* Add other fields here */
});


userSchema.methods.getFollows = function (callback){
  // this._id refers to the current user
  console.log('this._id', this._id)
  // allFollowers = [{
  //   follower: ID_OF_FOLLOWER,
  //   following: YOUR_USER_ID
  // }, {
  //   follower: ID_OF_FOLLOWER,
  //   following: YOUR_USER_ID
  // }];
  Follow.find({follower: this._id}, function(err, isFollowingList) {
    if (err) {
      return 'error';
    }
    if (!isFollowingList) {
      return 'This user followers no one';
    }
    console.log('isFollowingList', isFollowingList);
    return isFollowingList;
  });
}


// userSchema.methods.follow = function (idToFollow, callback){
//   var newFollow = new Follow ({
//     follow: this._id,
//     following: idToFollow
//   })
//   newFollow.save(function(err, result) {
//     if(err) {
//       callback(err)
//     } else {
//       callback(null, result)
//     }
//   })
// }
//
// userSchema.methods.unfollow = function (idToUnfollow, callback){
//   Follow.findByIdandRemove({
//     follower: this._id,
//     following: idToUnfollow
//     },
//     function(err, foundIdtoRemove) {
//       if(err) {
//         callback(err)
//       } else {
//         // console.log('foundIdtoRemove', foundIdtoRemove)
//         // Follow.remove(foundIdtoRemove);
//         callback(null, foundIdtoRemove)
//       }
//     })
// }
userSchema.methods.getTweets = function (callback){

}

// the ID of the user that follows the other
// the ID of the user being followed
var FollowsSchema = mongoose.Schema({
  follower: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  following: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
});






var tweetSchema = mongoose.Schema({

});

tweetSchema.methods.numLikes = function (tweetId, callback){

}


var User = mongoose.model('User', userSchema);
var Tweet = mongoose.model('Tweet', tweetSchema);
var Follow = mongoose.model('Follow', FollowsSchema);

module.exports = {
  User: User,
  Tweet: Tweet,
  Follow: Follow
};
