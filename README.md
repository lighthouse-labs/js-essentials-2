# Javascript Essentials Part II

### PRE-REQ

If you are thinking about taking this course, you've probably attended Part I where we built a simple chat application using modern web tools such as Node.js, Websockets and JQuery.  If you didn't, please note that we'll start exactly where we left off. It would be wise to at the very least go through the Part I notes (insert link) to warm up.

### GOAL

Today' session goal is to show you how modern web application are built by bringing together software components that may be located elsewhere but that can be combined to create more complex behaviour.  To do so, we'll learn how Javascript provides all the essential tools to GET data from other sources and manipulate that data to fit our needs.

### PRODUCT

If you recall, by the end of the previous session we had managed to create a Chat Application, (show running version).  Our focus today will be to make this Chat Application much smarter by adding some super powers, very much the way that Messenger or Slack or many other conversational interfaces are becoming smarter:  with a BOT.

### APPROACH

Not an easy goal, particularly for a single session like the one we have planned today.  To make it possible we'll follow the Lighthouse Labs approach:

- Lots of coding!  I'll be coding things on screen.  Try to make sense of things I'm doing.  

- When you are ready to code, follow the very same code snippets found in these notes. Don't worry if you fall behind, the notes are very thorough.  I rather you understand now and code at your own pace later on.

- Ask questions! we have a number of mentors helping out.  If you have any question or something is not working as planned, don't be afraid to raise your hand.

Let's start by reviewing the very final version of the product we built during our last sesion:

## PART I - Review

### CLONE 

I'll share a lot of code, just in case you don't have it.  As many professional software developers do these days, I'll share it by simply giving you access to the Github project (link to github).  You can either download the project and `clone` it.

The following sequence of commands will download the code into a new folder and prepare your computer to run the software.  This is necessary because you may not have all the tools and libraries that the software needs to run.
```
git clone https://github.com/lighthouse-labs/js-essentials-2
cd js-essentials-2
npm install
npm start
```

If everything worked out well, you should see the message
```
Chat Application running...
```

And if you use your browser to open the URL:  http://localhost:8080 you should see the chat application.  Go ahead, give it a try.

[Screenshot]: https://github.com/jugonzal/gitbook-node-chat-tutorial/blob/master/assets/example-cropped.png "Screenshot"

### CODE REVIEW

There is much code to get acquainted with as we will be upgrading it with super powers.  How about we try to follow the fundamental sequence of events that makes our chat room possible:

1. The index.html page contains a form:
```
<form>
  <input id="initials">
  <input id="message">
  <button>Send!</button>
</form>
```

2. The app.js creates an event handler that "listens" to clicks on the `<button>Send!</button>` and uses websockets to emit (send) a message using websockets:
```
$("button").on('click', function() {
  var text = $("#message").val();
  var who = $("#initials").val();
  
  socket.emit('message', who + ": " + text);
  $('#message').val('');
  
  return false;
});
```

3. The server.js is listening for messages coming from any client connected and will simply "echo" the same message back to ALL clients:
```
socket.on('message', function (msg) {
  console.log('Received Message: ', msg);
  io.emit('message', msg);
});
```

4. The app.js is listening for messages from the server and upon receiving one, it will simply use JQuery to add a new entry to the HTML.
```
socket.on('message', function (msg) {
  $('<li>').text(msg).appendTo('#history');
});
```

A good way to confirm that you understand the code now in your hands is to hack away.  Follow a quick, iterative approach when coding:  think of a feature you want to add, write as little code as possible, test and confirm your assumptions, repeat.

Here are a few ideas to try:

- Change the formatting of the message
- Add a timestamp to each message
- Display past messages when joining the chat room
- Reply to simple questions such as "What time is it?"

### CONVERSATIONAL BOTS

Did you try to make your chat room answer simple questions? How would we go about implementing such a feature?   

1. First we need to realize that a message is meant as a question.  How would we do that?

We'll use the power of [Regular Expressions](https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions), an old technique that is very useful when searching for certain patterns within strings of characters.  For example the expression ` /\?$/ ` means: _"look for a question mark at the end of the message"_

To keep things tidy, we will create a function that is ONLY responsible for figuring out if a message has a question mark at the end, using the regular expression above.

```
function isQuestion(msg) {
  return msg.match(/\?$/)
}
```

2. Then we should figure out what is being asked and calculate an answer.  A very simplistic approach would be to have a list of questions we understand.

As the only thing we care about at this time is the word "time" we can use a very similar approach.  Have you noticed how I try to write simple functions that do ONE very simple thing at a time?  And test.  If you master this simple cycle, you will make much more progress.  The *Single Responsibility Principle* is an important tenet of Software Development.

```
function askingTime(msg) {
  return msg.match(/time/i)
}
```

3. Then, instead of simply "echoing" the message, we should respond with our calculated answer.  The one place where it makes sense to do this is that time when a message arrives at the server.  Let's put it all together

```
if (!isQuestion(msg)) {
  io.emit('message', msg);
} else if (askingTime(msg)) {
  io.emit('message', new Date);
} 
```

I'm happy that our bot is capable of answering the simple question: "what time is it?".  However, I'm starting to realize the complexity of building a bot that would truly be able to understand this and many other questions.  Which regular expressions would be useful if we want to expand our "smartness"?  Time is an easy thing to "calculate", but how about more complicated things?

## APIS

The good news is that the web is full of resources.  Most answers you need are out there, somewhere, available to be shared. We just need to know how to ask.  And we need to know WHO to ask. 

To get a feel for how much can be done with APIs, take a look at [Todd Motto's list of public APIs](https://github.com/toddmotto/public-apis)

Our next trick will involve giving our Bot the ability to provide weather updates.  Weather is one of those things that we couldn't possibly calculate in our application, but that it is easily available on the web.

### CURL 

To get started try the following command in your Terminal:

```
curl https://www.metaweather.com/api/location/4118/
```

Before we start writing any code, let's understand what exactly is happening here:

- `curl` is a tool that does much of what a browser does, but in your terminal.  
- In this particular case we are using it to navigate to a website called `www.metaweather.com`.  Have you heard about it before?  Probably not, it is meant for computers, not humans.  Instead of a human interface (a webpage), it provides its data in a programming interface.  This is why it is called an API (Application Programming Interface)
- Much like some sites that contain a lot of information, it organizes all its data in a hierarchical way, in this case by location.  We'll talk more about this soon.
- When the site responds, the data comes back in a format that may be hard to read for humans, but it is super easy for programs.  This format is called JSON and it is particularly friendly to Javascript.

### JSON

```json
{ "consolidated_weather": 
   [ { "id": 5093320921448448,
       "weather_state_name": "Heavy Rain",
       "weather_state_abbr": "hr",
       "wind_direction_compass": "S",
       "created": "2017-08-11T20:34:23.801200Z",
       "applicable_date": "2017-08-11",
       "min_temp": 19.16,
       "max_temp": 23.448333333333334,
       "the_temp": 22.886666666666667,
       "wind_speed": 6.816575418346193,
       "wind_direction": 179.21851889023347,
       "air_pressure": 1012.51,
       "humidity": 84,
       "visibility": 11.815062534796787,
       "predictability": 77 } ],
  "time": "2017-08-11T19:10:55.555640-04:00",
  "sun_rise": "2017-08-11T06:17:56.668717-04:00",
  "sun_set": "2017-08-11T20:28:07.284434-04:00",
  "timezone_name": "LMT",
  "parent": 
   { "title": "Canada",
     "location_type": "Country",
     "woeid": 23424775,
     "latt_long": "56.954681,-98.308968" },
  "sources": 
   [ { "title": "BBC",
       "slug": "bbc",
       "url": "http://www.bbc.co.uk/weather/",
       "crawl_rate": 180 } ],
  "title": "Toronto",
  "location_type": "City",
  "woeid": 4118,
  "latt_long": "43.648560,-79.385368",
  "timezone": "America/Toronto" }
```

Reading JSON notation and figuring out how to access this data is half the battle of integrating data from the web into your application.  We should practice that.

Take the JSON code above and use it to practice the "dot notation" of javascript objects.  

```
node
> data = { consolidated_weather:  ... }
> data.title
'Toronto'
> data.parent.title
'Canada'
```

Go from there and see if you can come up with an expression that would simply tell you what the weather forecast for today is. 

### GET

Now that we have discovered a particularly useful resource on the web, let's work on our server.js so it knows weather.

```
function getWeather(callback) {
  var request = require('request');
  request.get("https://www.metaweather.com/api/location/4118/", function (error, response) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(response.body);
      callback(data.consolidated_weather[0].weather_state_name);
    }
  })
}
```

There are 2 things that are super important in this small snippet of code:

1. Notice that `request.get` function?  For now think of it like your very own `curl` inside your javascript code.  What else is interesting about the parameters that we pass to that function?   CALLBACKS!   Where did we see this before?  

2. Whenever data is received in JSON, we can use `JSON.parse` to convert plain text data into an actual javascript object.  After this point any element of data can be accessed as if it was a variable in our application, using our dot-notation approach.

### CALLBACKS 

We are almost at the end of our session.  But for things to work well, we have to integrate that `function getWeather()` into the rest of our code.  Your instinct should be to try to do something very similar to what we did earlier today to handle the _Time_ questions. 

Before we go through the solution, give it a try on your own following these tips:

1. Where in the `getWeather` function is the answer we need?
2. How is that answer being sent out from the function?
3. What is the role of the callback parameter?

To keep you at the edge of your seats, I'll give you the WRONG answer:

```
else if (askingWeather(msg)) {
  io.emit('message', getWeather())
}
```

Why is this wrong?  Look at the CORRECT version and compare:

```
else if (askingWeather(msg)) {
  getWeather(function(weather) {
    io.emit('message', weather)
  })
}
```

Notice how `getWeather` will take one parameter which indicates what to do AFTER the proper response from the API is received.  The function will wait for as long as it needs before executing that simple line of code.  That callback is a very common pattern in javascript.

### WRAP-UP

If you are following step by step, you should be able to ask for the weather in your chat room.  Remember to ask nicely by ending with a question mark (?).  Otherwise now is a good time to catch up by looking at the full version of the code and comparing against your own.  

Between Regular Expressions, JSON and Callbacks, we did cover quite a bit of ground on our server-side javascript skills, so do not worry if you are still munching over some of the concepts.  Keep asking questions.  
