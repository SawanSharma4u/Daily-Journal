const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const request = require("request");
const https = require("https");
const res = require("express/lib/response");

const app = express();

let posts = [];

const aboutPageContent = "The best ideas can change who we are. DAILY JOURNAL is where those ideas take shape, take off, and spark powerful conversations. We’re an open platform where over 100 million readers come to find insightful and dynamic thinking. Here, expert and undiscovered voices alike dive into the heart of any topic and bring new ideas to the surface. Our purpose is to spread these ideas and deepen understanding of the world.";
const homePageContent1 = "Anyone can write on DAILY JOURNAL. Thought-leaders, journalists, experts, and individuals with unique perspectives share their thinking here. You’ll find pieces by independent writers from around the globe, stories we feature and leading authors, and smart takes on our own suite of blogs and publications.";
const homePageContent2 = "We’re creating a new model for digital publishing. One that supports nuance, complexity, and vital storytelling without giving in to the incentives of advertising. It’s an environment that’s open to everyone but promotes substance and authenticity. And it’s where deeper connections forged between readers and writers can lead to discovery and growth. Together with millions of collaborators, we’re building a trusted and vibrant ecosystem fueled by important ideas and the people who think about them.";

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res){
    res.render("home", {
        Content1 : homePageContent1, 
        Content2 : homePageContent2,
        posts : posts
    });
});

app.get("/about", function(req, res){
    res.render("about", {
        Content : aboutPageContent,
        Content1 : homePageContent1, 
        Content2 : homePageContent2
    });
});

app.get("/contact", function(req, res){
    res.render("contact");
});

app.get("/compose", function(req, res){
    res.render("compose");
});

app.get("/posts/:postId", function(req, res){
    const postId = _.lowerCase(req.params.postId);
    for(let i = 0; i < posts.length; i++){
        if(postId === _.lowerCase(posts[i].title)){
            res.render("post", {
                postTitle : posts[i].title,
                Content : posts[i].content
            });
            break;
        }
        else if(i === posts.length-1){
            res.render("post", {
                postTitle : "Oh Oh, Looks like the post '" + postId +"' is not available or it is missing.",
                Content : ""
            });
        }
    }
});

app.post("/", function(req, res){
    res.redirect("/compose");
})

app.post("/compose", function(req, res){
    const post = {
        title : req.body.postTitle,
        content : req.body.postContent
    }
    posts.push(post);
    res.redirect("/");
});

app.post("/contact", function(req, res){
    const firstName = req.body.fName;
    const lastName = req.body.lName;
    const email = req.body.email;
    
    const data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName
                }
            }
        ]
    };

    const jsonData = JSON.stringify(data);
    const url = "https://us14.api.mailchimp.com/3.0/lists/3363cf9ac2";
    const options = {
        method: "POST",
        auth: "sawan1:30dd9fa63f84e242cd12d888144e5d8b-us14"
    };
    
    const request = https.request(url,options, function(response){
        if(response.statusCode===200){
            res.render("post", {
                postTitle : "Awesome!",
                Content : firstName + " " + lastName + ", we've recieved your query, we will get back to you soon!"
            });
        }
        else{
            res.render("post", {
                postTitle : "Uh oh",
                Content : firstName + " " + lastName + ", there is a problem, please try again or contact the developer!"
            });
        }
        response.on("data", function(data){
            console.log(JSON.parse(data));
        });
    });

    request.write(jsonData);
    request.end();
});

app.listen(process.env.PORT || 3000, function(req, res){
    console.log("Server is running");
});