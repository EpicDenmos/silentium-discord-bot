const Discord = require("discord.js");
var Twitter = require('node-tweet-stream');
const requestify = require('requestify'); 
var MessageFormat = require('messageformat');
var mf = new MessageFormat('en');

var mysql = require('mysql'); 

const bot = new Discord.Client();
const config = require("/silentiumbot/config.json");


bot.on("ready", () => {
    console.log(`Bot has started, with ${bot.users.size} users, in ${bot.channels.size} channels of ${bot.guilds.size} guilds.`); 

    bot.user.setGame(`Discord`);

    init();
});


bot.login(config.token);


function checkNewForumPost() {
    var con = mysql.createConnection({
        host: config.database.host,
        user: config.database.user,
        password: config.database.password
    });

    con.connect();
    
    var checkDate = Math.round(Date.now() / 1000) - 600;

    con.query('SELECT * FROM silentium.vl8rv_kunena_topics WHERE first_post_time > ' + checkDate + ' AND category_id = 3 ', function (error, results, fields) {
        if (error) throw error;

        for(var i=0; i<results.length; i++) {
            console.log('New post found : ' + results[i])
            var msg = '@everyone - Nouvelle candidature sur le forum : ' + results[i].subject;
            bot.channels.filter(chan => chan.name === 'general').forEach(function(channel){
                channel.send(msg);
            });
        }
        
    });


    con.end();
}


function sendTweetOnDiscord(tweet, channel) {
    console.log('Sending '  +tweet.text + " to chan " + channel);
    bot.channels.filter(chan => chan.name === channel).forEach(function(channel){
        channel.send(tweet.text);
    });
}

function init() {
    checkNewForumPost();

    // Check every 10 minutes for new posts
    setInterval(checkNewForumPost, 600000);    

    // Follow twitter user
    var twitter = new Twitter(config.twitter);
    
    twitter.on('tweet', function (tweet) {
        if(tweet.user.id === config.tweetsUserId) {
            sendTweetOnDiscord(tweet, config.tweetsChannel);
        }        
    });

    twitter.follow(config.tweetsUserId);
}






