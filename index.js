#!/usr/bin/env node
var NickrBot = require('./bot');
var settings = {
  token: process.env.NICKR_SLACKBOT_TOKEN,
  name: 'nickr'
};
new NickrBot(settings).run();

