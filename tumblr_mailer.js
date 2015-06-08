var fs = require('fs');
var ejs = require('ejs');
var tumblr = require('tumblr.js');
var csvFile = fs.readFileSync("friend_list.csv","utf8");
var emailTemplate = fs.readFileSync('email_template.html', 'utf8');

var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('xxxxxxxxxxxxxxxxxx');

var client = tumblr.createClient({
  consumer_key: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  consumer_secret: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  token: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  token_secret: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
});


function profileObj(profile){
	this.firstName = profile[0];
	this.lastName = profile[1];
	this.numMonthsSinceContact = profile[2];
	this.emailAddress = profile[3];
}

//parse the data to array of Objects
function csvParse(data){
	var arrObjects=[];
	var arrData = data.toString().split('\n');
	arrData.shift();
	arrData.forEach(function(contact){
		if(contact!==''){
			var tempProfile = contact.split(',');
			arrObjects.push(new profileObj(tempProfile));
		}
	});
	return arrObjects;
}

//Send email functio using mandrill app to send
function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
	var message = {
	    "html": message_html,
	    "subject": subject,
	    "from_email": from_email,
	    "from_name": from_name,
	    "to": [{
	            "email": to_email,
	            "name": to_name
	        }],
	    "important": false,
	    "track_opens": true,    
	    "auto_html": false,
	    "preserve_recipients": true,
	    "merge": false,
	    "tags": [
	        "Fullstack_Tumblrmailer_Workshop"
	    ]    
	};
	var async = false;
	var ip_pool = "Main Pool";
	mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
	}, function(e) {
	    // Mandrill returns the error as an object with name and message keys
	    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
	    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
	});
}

client.posts('love4pril.tumblr.com', function(err, blog){
	var latestPosts = [];
	blog.posts.forEach(function(post){
		var currentTime = new Date();
		var datePost = new Date(post.date);
		var diff = (currentTime - datePost)/86400000;
		if(diff<=7){
			latestPosts.push(post);
		}
	});

	var csv_data = csvParse(csvFile);
	csv_data.forEach(function(profile){
		firstName = profile['firstName'];
		numMonthsSinceContact = profile['numMonthsSinceContact'];
		
		var customizedTemplate = ejs.render(emailTemplate, {firstName: firstName,
			numMonthsSinceContact: numMonthsSinceContact,
			latestPosts: latestPosts		
		 });

		sendEmail(firstName, profile["emailAddress"], "Thang Nguyen", "thanghnbk@gmail.com", "Hey, how are you doing? Wanna take a look at my tumblr?", customizedTemplate);
	});  
})

	

