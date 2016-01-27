var http = require('http');
var slack = require('slack-client');
var token = 'YOUR_SLACK_TOKEN';
var auto_reconnect = true;
var auto_mark_as_read = true;

var polls = [];

var answers = [
    'You may rely on it',
    'As I see it, yes',
    'Yes, definitely',
    'Most likely',
    'Yes',
    'Signs point to yes',
    'Ask again later',
    'Better not tell you now',
    'Cannot predict now',
    'Concentrate and ask again',
    'Don\'t count on it',
    'My reply is no',
    'My sources say no',
    'Very doubtful'
];

var client = new slack(token, auto_reconnect, auto_mark_as_read);

client.on('open', function(){
    console.log('Connected to Slack. You are ' + client.self.name + ' on ' + client.team.name);
});

client.on('message', function(message){
    var channel = client.getChannelGroupOrDMByID(message.channel);

    if (message.type !== 'message' || message.text === undefined || message.user === undefined){
        return;
    }

    var originalText = message.text;
    var lowerText = message.text.toLowerCase();
    var sender = '<@' + message.user + '>';

    // Ask stuff to the bot
    if (isCommand(lowerText, '!ask')){
        var question = lowerText.replace('!ask', '').trim();
        
        var answer = answers[Math.floor(Math.random() * answers.length)];
        channel.send(sender + ': ' + answer);
    }

    // Polls
    else if (isCommand(lowerText, '!poll')){
        var parameter = lowerText.replace('!poll', '').trim();
        
        if (parameter.indexOf(' ') != -1)
            parameter = parameter.substr(0, parameter.indexOf(' '));
        
        var channel_id = channel.id;
        var user_id = message.user;

        if (isCommand(parameter, 'add')){
            // Check if there's already a poll for this channel
            if (polls[channel_id] != undefined && !polls.length){
                channel.send('There\'s already an active poll on this channel. Please try again later! :wink:');
                return;
            }

            var question = originalText.replace('!poll', '').trim().replace('add', '').trim();

            var poll = {
                question: question,
                answers: [],
                admin: user_id
            };

            polls[channel_id] = poll;
            channel.send(sender + ': Your poll "' + question + '" has been created :+1:');
            channel.send(sender + ': You can add a possible answer with `!poll answer Your answer`.');
            channel.send(sender + ': You can delete the poll with `!poll delete`.');
        }

        else if (isCommand(parameter, 'answer')){
            // Check if there's a poll to manage
            if (polls[channel_id] == undefined){
                channel.send('There\'s no active poll in this channel! Try `!poll add Your question` to start a new poll :wink:');
                return;
            }

            // Check if user is admin
            if (polls[channel_id].admin != user_id){
                channel.send('You can\'t edit a poll you didn\'t created :wink:');
                return;
            }

            var answer_text = originalText.replace('!poll', '').trim().replace('answer', '').trim();
            var answer = {
                text: answer_text,
                count: 0
            };

            polls[channel_id].answers.push(answer);

            channel.send(sender + ': Your answer "' + answer.text + '" has been added :+1:');
        }

        else if (isCommand(parameter, 'delete')){
            // Check if there's a poll to manage
            if (polls[channel_id] == undefined){
                channel.send('There\'s no active poll in this channel! Try `!poll add Your question` to start a new poll :wink:');
                return;
            }

            // Check if user is admin
            if (polls[channel_id].admin != user_id){
                channel.send('You can\'t edit a poll you didn\'t created :wink:');
                return;
            }

            polls[channel_id] = undefined;

            channel.send(sender + ': This poll has been deleted :+1:');
        }

        else {
            // Check if there's already a poll for this channel
            if (polls[channel_id] == undefined){
                channel.send('There\'s no active poll in this channel! Try `!poll add Your question` to start a new poll :wink:');
                return;
            }

            var current_poll = '*' + polls[channel_id].question + '*\r\n';
            for (var i = 0; i < polls[channel_id].answers.length; i++){
                current_poll += numberToEmoji(i+1) + ' ' + polls[channel_id].answers[i].text + ' — _' + polls[channel_id].answers[i].count + ' votes_\r\n';
            }
            channel.send(current_poll);
        }
    }

    // Votes
    else if (isCommand(lowerText, '!vote')){
        var parameter = lowerText.replace('!vote', '').trim();            
        var channel_id = channel.id;

        // Check if there's already a poll for this channel
        if (polls[channel_id] == undefined){
            channel.send('There\'s no active poll in this channel! Try `!poll add Your question` to start a new poll :wink:');
            return;
        }

        if (polls[channel_id].answers[parameter - 1] != undefined){
            polls[channel_id].answers[parameter - 1].count += 1; 
        }

        var current_poll = '*' + polls[channel_id].question + '*\r\n';
        for (var i = 0; i < polls[channel_id].answers.length; i++){
            current_poll += numberToEmoji(i+1) + ' ' + polls[channel_id].answers[i].text + ' — _' + polls[channel_id].answers[i].count + ' votes_\r\n';
        }
        channel.send(current_poll);
    }

    // Surprise
    else if (isCommand(lowerText, '!surprise')){
        channel.send(sender + ': ' + ':poop:');
    }

    // Random number from 1 to 10 (or more)
    else if (isCommand(lowerText, '!random')){
        var parameter = lowerText.replace('!random', '').trim();
        var maximum = parseInt(parameter);
        if (isNaN(maximum) || maximum === undefined || maximum === ''){
            maximum = 10;
        }
        var result = Math.floor((Math.random() * maximum) + 1);
        channel.send('I mix the numbers... And I chose the ' + result + '! Tadaaa! :tada:');
    }

    // Send a random cat gif
    else if (isCommand(lowerText, '!cat')){
        http.get('http://thecatapi.com/api/images/get?format=xml&type=gif', function(data){
            data.setEncoding('utf8');
            data.on('data', function(data){
                var url = data.substr(data.indexOf('<url>') + 5, data.indexOf('</url>') - (data.indexOf('<url>') + 5));
                channel.send(url);
            });
        });
    }

    // Get all a list of available commands
    else if (isCommand(lowerText, '!help')){
        var helpText = '';
        helpText += 'Liste des commandes disponibles :' + '\r\n';
        helpText += '`!ask` – Ask a question' + '\r\n';
        helpText += '`!poll add Your question` – Create a new poll' + '\r\n';
        helpText += '`!random` – Pick a random number between 1 and 10' + '\r\n';
        helpText += '`!random x` – Pick a random number between 1 and x' + '\r\n';
        helpText += '`!surprise` – Surprise! :tada:' + '\r\n';
        helpText += '`!cat` – Display a cat GIF' + '\r\n';
        channel.send(helpText);
    }
});

client.on('error', function(err){
    console.log(err);
});

client.login();

function isCommand(src, cmd){
    if (src.indexOf(cmd) !== -1)
        return true;
    return false;
}

function numberToEmoji(n){
    switch(n){
        case 1:
            return ':one:';
        case 2:
            return ':two:';
        case 3:
            return ':three:';
        case 4:
            return ':four:';
        case 5:
            return ':five:';
        case 6:
            return ':six:';
        case 7:
            return ':seven:';
        case 8:
            return ':eight:';
        case 9:
            return ':nine:';
        case 10:
            return ':keycap_ten:';
        default:
            return n;
    }
}

String.prototype.ucfirst = function(){
    return this.charAt(0).toUpperCase() + this.slice(1);
}

http.createServer(function(req, res){
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Your Slack bot is up and running\n');
}).listen(process.env.PORT || 8080);
