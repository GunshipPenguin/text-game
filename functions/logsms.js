'use strict'

const tokens = require('../tokens')
const smsUtils = require('../helpers/sms-utils')
const lib = require('lib')({token: process.env.STDLIB_TOKEN})
const utils = lib.utils({
  service: 'text-game'
})

/**
* Logs incoming SMS Messages for testing purposes
*
* @param {string} sender The phone number that sent the text to be handled
* @param {string} receiver The StdLib phone number that received the SMS
* @param {string} message The contents of the SMS
* @param {string} createdDatetime Datetime when the SMS was sent
*/
module.exports = (sender, receiver, message, createdDatetime, context, callback) => {
  // Decompress + decode message
  let messageJson = smsUtils.decodeMessage(message)

  utils.log(`Got text from ${sender}`, {raw: message, decoded: messageJson}).then(callback)
  .catch(callback)
}