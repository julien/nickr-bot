'use strict';

var Bot = require('slackbots');
var google = require('googleapis');
var customsearch = google.customsearch('v1');
var request = require('request');
var util = require('util');

var cseId = process.env.GOOGLE_CUSTOM_SEARCH_ID;
var cseApiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;

function NickrBot(settings) {
  Bot.call(this, settings);
  this.settings = this.settings;
  this.user = null;
}

util.inherits(NickrBot, Bot);

NickrBot.prototype.run = function () {
  this.on('start', this._onStart);
  this.on('message', this._onMessage);
};

NickrBot.prototype._onStart = function () {
  this.user = this._getUser();
};

NickrBot.prototype._onMessage = function (message) {
  // console.log(message);
  if (this._isChatMessage(message) && !this._isFromNickrBot(message)) {
    var user = this._getUserByID(message.user);
    if (user) this._search(message.text, user);
  }
};

NickrBot.prototype._getUser = function () {
  var l = this.users.length;
  while (l--) {
    if (this.users[l].name === this.name) {
      return this.users[l];
    }
  }
};

NickrBot.prototype._getUserByID = function (id) {
  var l = this.users.length;
  while (l--) {
    if (this.users[l].id === id) {
      return this.users[l];
    }
  }
};

NickrBot.prototype._isChatMessage = function (message) {
  return message.type === 'message' && !!message.text;
};

NickrBot.prototype._isChannelConversation = function (message) {
  return typeof message.channel === 'string' && message.channel[0] === 'C';
};

NickrBot.prototype._isFromNickrBot = function (message) {
  return message.user === this.user.id;
};

NickrBot.prototype._isMention = function (message) {
  var t = message.text.toLowerCase();
  return t.match(/nickr/igm) || t.indexOf(this.name) > -1;
};

NickrBot.prototype._search = function (name, user) {
  var self = this;
  var msg = 'Ok, give me a moment, I\'ll ask my API for ' + name;
  this.postMessageToUser(user.name, msg, {icon_emoji: ':beers:'});

  return request.get('https://nickr.herokuapp.com/users/' + name)
    .on('response', function (res) {
      var buf = new Buffer('');
      res.on('data', function (chunk) {
        buf = Buffer.concat([buf, chunk]);
      });
      res.on('end', function () {
        var data = JSON.parse(buf);
        self._showRandomName(user, data, name);
      });
    });
};

NickrBot.prototype._showRandomName = function (user, data, name) {
  var self = this;

  if (util.isObject(data) && util.isArray(data.nicknames)) {
    var l = data.nicknames.length;
    var randname = data.nicknames[(Math.random() * l)|0];

    customsearch.cse.list({cx: cseId, q: randname, auth: cseApiKey, searchType: 'image'}, function (err, resp) {
      if (err) {
        console.error('error', error);
        self.postMessageToUser(user.name, randname);
      } else if (util.isArray(resp.items)) {
        var l = resp.items.length-1;
        var img = resp.items[(Math.random()*l|0)].link;
        self.postMessageToUser(user.name, randname, {
          attachments:[{
            fallback: randname,
            image_url: img
          }],
          as_user: true
        });
      }
    });

  } else {
    this.postMessageToUser(user.name, 'Sorry, I couldn\'t find ' + name, {icon_emoji: ':cry:'});
  }
};

module.exports = NickrBot;
