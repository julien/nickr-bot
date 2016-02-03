'use strict';

var Bot = require('slackbots');
var request = require('request');
var util = require('util');

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
  var msg = 'Ok, give me a moment ' + user.name + ' ,I\'ll ask my API for: ' + name;
  this.postMessageToUser(user.name, msg, {icon_emoji: ':smile:'});

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
  if (util.isObject(data) && util.isArray(data.nicknames)) {
    var l = data.nicknames.length;
    var n = data.nicknames[(Math.random() * l)|0];
    this.postMessageToUser(user.name, n.value);
  } else {
    this.postMessageToUser(user.name, 'Sorry ' + user.name + ' ,I couldn\'t find: ' + name, {icon_emoji: ':cry:'});
  }
};

module.exports = NickrBot;
