#!/usr/bin/env node

var NickrBot = require('./bot');

var settings = {
  token: process.env.NICKR_SLACKBOT_TOKEN,
  name: 'nickr'
};

var bot = new NickrBot(settings);
bot.on('start', function () {});
bot.run();
