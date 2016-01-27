# A simple Slack bot using NodeJS

Here's a simple Slack bot using NodeJS and the [slack-client](https://github.com/slackhq/node-slack-client) node package. The repository is packaged to work on local & distant environments (on your server or Heroku for example).

## Features

The bot is capable of handling some commands by default :

* `!ask`: Magic 8 Ball (see [Wikipedia](https://en.wikipedia.org/wiki/Magic_8-Ball))
* `!poll add My question`: Add a poll on the current channel with "My question" as the question
* `!random`: Pick a random number between 1 and 10
* `!random x`: Pick a random number between 1 and x
* `!surprise`: Well, it's not a suprise if I tell you, right?
* `!cat`: Display a cat GIF from [thecatapi.com](http://thecatapi.com/)

You can easily add a command by forking the project and edit the `slack-bot.js` file.

## Configuration

You need to have a Slack token to connect the bot to your Slack. You can create one there : 
* [https://yourteamname.slack.com/apps/manage/custom-integrations](https://yourteamname.slack.com/apps/manage/custom-integrations)

You'll be able to customize the username, avatar, and profile informations of your bot. More importantly you'll be able to see your API token. It looks like that : `xoxb-xxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxx`.

Open `slack-bot.js`. Look at the top of the file for `var token = 'YOUR_SLACK_TOKEN'` and replace *YOUR_SLACK_TOKEN* by your token (you need the keep the single quote around the key).

You can also define other constants : 

* `var auto_reconnect = true;`: Set to false to disable auto-reconnect on Slack errors
* `var auto_mark_as_read = true;`: Set to false to disable auto-mark-as-read message after it is processed

## Usage

Clone the repository, edit the configuration variables and run :

```
node slack-bot.js
```

It should output : 

```
Connected to Slack. You are YOUR_BOT_NAME on YOUR_TEAM_SLACK_NAME
```

If you point your browser to [http://localhost:8080](http://localhost:8080), it should output `Your Slack bot is up and running`.

**You can use [forever](https://github.com/foreverjs/forever) to run and manage the Slack bot.**

