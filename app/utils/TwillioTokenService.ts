import { User } from '../models/User';
import twilio from 'twilio'
import { ChannelInstance } from 'twilio/lib/rest/chat/v2/service/channel';
import Logger from './Logger';
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const AccessToken = twilio.jwt.AccessToken;
const ChatGrant = AccessToken.ChatGrant;

function TokenGenerator(identity) {
  const chatGrant = new ChatGrant({
    serviceSid: process.env.TWILIO_CHAT_SERVICE_SID,
  });

  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID || '',
    process.env.TWILIO_API_KEY || '',
    process.env.TWILIO_API_SECRET || ''
  );

  token.addGrant(chatGrant);
  token.identity = identity;

  return token;
}

function deleteChannel(sid: string) {
  client.chat.services(process.env.TWILIO_CHAT_SERVICE_SID)
      .channels
      .list()
      .then(channels => {
          channels.forEach(c => {
            // c.remove()
          })
      });

}

async function hasChannel(sid: string) {
  const channels: any[] = await client.chat.services(process.env.TWILIO_CHAT_SERVICE_SID)
    .channels
    .list()

  return channels.some(c => c.sid === sid)
}

const SUPPORT_CHANNEL_UNIQUE_NAME_PREFIX = 'support'
const getSupportUniqueChannelName = (username) => `${SUPPORT_CHANNEL_UNIQUE_NAME_PREFIX}_${username}`

async function createChannel(users: User[]) {
  if (!process.env.TWILIO_CHAT_SERVICE_SID) return

  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN),
    channelsService = await client.chat.services(process.env.TWILIO_CHAT_SERVICE_SID).channels,
    channels = await channelsService.list();

  const createChannelPromisses: any[] = []

  const channelNames = channels.map(c => c.uniqueName)

  users.forEach(user => {
    const uniqueName = getSupportUniqueChannelName(user.username)
    const hasChannel = channelNames.includes(uniqueName)
    
    if (!hasChannel && user.username) {
      createChannelPromisses.push(channelsService.create({
        uniqueName: uniqueName,
        friendlyName: user.username
      }))
    }
  })

  const result = await Promise.allSettled(createChannelPromisses)
}

async function addMessage(user: User, text: string) {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN),
    channelsService = await client.chat.services(process.env.TWILIO_CHAT_SERVICE_SID || '').channels,
    channels = await channelsService.list();

    const uniqueName = getSupportUniqueChannelName(user.username)
    const hasChannel = channels.map(c => c.uniqueName).includes(uniqueName)
    let userChannel: ChannelInstance | undefined

    if (!hasChannel && user.username) {
      userChannel = await channelsService.create({
        uniqueName: uniqueName,
        friendlyName: user.username
      })
    } else {
      userChannel = channels.find(c => c.uniqueName === uniqueName)
    }

    if (userChannel && user.username) {
      userChannel
        .messages()
        .create({
          body: text,
          from: user.username,
        })
        .then(f => {})
        .catch(f => Logger.error(f))
    }
}

async function init() {
  const users = await User.find({
    where: {
      verified: 1
    }
  })

  try {
    await createChannel(users)
  } catch (error) {
  }
  
  client.chat.services(process.env.TWILIO_CHAT_SERVICE_SID)
  .update({
      postWebhookUrl: process.env.TWILIO_POST_WEBHOOK_URL,
      webhookFilters: ['onMessageSent'],
      webhookMethod: 'POST'
   })
  .then(service => {
  })
  .catch(e => {
  })
} 

const TwillioTokenService = {
  hasChannel,
  generate: TokenGenerator,
  createChannel,
  init,
  addMessage,
}

export {
    TwillioTokenService
}