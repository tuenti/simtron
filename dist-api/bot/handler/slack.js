"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.sanitize = void 0;

var _rtmApi = require("@slack/rtm-api");

var _webApi = require("@slack/web-api");

var _logger = _interopRequireDefault(require("../../util/logger"));

var _config = require("../../config");

var _slack = _interopRequireWildcard(require("../message-adapter/slack"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ALL_CHANNELS = 10000000;

const isMessage = event => event.type === 'message' && event.text;

const isMessageToChannel = message => typeof message.channel === 'string';

const isFromUser = (message, userId) => message.user === userId;

const sanitize = text => text.toLowerCase().replace(',', '').replace('.', '').replace(';', '');

exports.sanitize = sanitize;

const canAccessToChannel = channel => channel.is_member && (!process.env.DEVELOPMENT || channel.id === (0, _config.getDevelopmentSlackChannelId)());

const createSlackBot = botToken => {
  let botId;
  const retryConfig = {
    forever: true,
    maxTimeout: 60000
  };
  const slackBot = new _rtmApi.RTMClient(botToken, {
    retryConfig
  });
  const slackBotWebClient = new _webApi.WebClient(botToken, {
    retryConfig
  });

  const postMessageToRecipients = (message, channels, userId) => {
    channels.map(channelId => {
      switch (message.container) {
        case _slack.SlackMessageContainer.PLAIN:
          const plainMessage = {
            channel: channelId,
            user: message.isPrivate ? userId : undefined,
            text: message.text,
            as_user: true
          };
          message.isPrivate && userId ? slackBotWebClient.chat.postEphemeral({ ...plainMessage,
            user: userId
          }) : slackBotWebClient.chat.postMessage(plainMessage);
          break;

        case _slack.SlackMessageContainer.RICH:
          const richMessage = { ...message,
            channel: channelId,
            user: message.isPrivate ? userId : undefined,
            text: message.text,
            as_user: true
          };
          message.isPrivate && userId ? slackBotWebClient.chat.postEphemeral({ ...richMessage,
            user: userId
          }) : slackBotWebClient.chat.postMessage(richMessage);
          break;
      }
    });
  };

  const getChannels = async () => {
    const conversationsResult = await slackBotWebClient.conversations.list({
      types: 'public_channel,private_channel',
      exclude_archived: true,
      limit: ALL_CHANNELS
    });
    const conversations = conversationsResult;
    const channels = conversations.channels.filter(canAccessToChannel).map(channel => channel.id);

    if (process.env.DEVELOPMENT) {
      channels.push((0, _config.getDevelopmentSlackChannelId)());
    }

    return channels;
  };

  const sendMessage = async (message, userId) => {
    const channels = message.replyOn ? [message.replyOn] : await getChannels();
    postMessageToRecipients(message, channels, userId);
  };

  const isValidUser = userInfo => userInfo.ok && !userInfo.is_bot && !userInfo.deleted && !userInfo.is_restricted && !userInfo.is_ultra_restricted;

  const triggerMessageReceived = (listeners, bot, messageData) => {
    listeners.forEach(listener => {
      listener(bot, messageData);
    });
  };

  const bot = {
    listeners: [],

    addListener(listener) {
      this.listeners.push(listener);
    },

    clearListeners() {
      this.listeners = [];
    },

    sendMessage(message, incomingMessage = null) {
      const slackMessage = (0, _slack.default)(message, incomingMessage);

      if (slackMessage) {
        sendMessage(slackMessage, incomingMessage && incomingMessage.userId && slackMessage.isPrivate ? incomingMessage.userId : null);
      }
    },

    start() {
      return slackBot.start();
    }

  };
  slackBot.on('message', async message => {
    if (isMessage(message) && isMessageToChannel(message) && !isFromUser(message, botId)) {
      const userInfoResult = await slackBotWebClient.users.info({
        user: message.user
      });
      const userInfo = userInfoResult;

      if (isValidUser(userInfo)) {
        const userName = userInfo.user.name;
        const userId = userInfo.user.id;
        const isFromAdmin = (0, _config.getSlackBotAdminUserIds)().some(id => userId === id);
        const channel = message.channel;
        const messageText = message.text;
        const messageData = {
          botId,
          userName,
          userId,
          isFromAdmin,
          channel,
          messageText
        };

        _logger.default.debug(`Receiving message on slackBot, with botId: ${botId}, content: ${messageText}`);

        triggerMessageReceived(bot.listeners, bot, messageData);
      }
    }
  });
  slackBot.on('authenticated', rtmStartData => {
    botId = rtmStartData.self.id;

    _logger.default.debug(`Logged in as ${rtmStartData.self.name} (id: ${botId}) of team ${rtmStartData.team.name}`);
  });
  return bot;
};

var _default = createSlackBot;
exports.default = _default;