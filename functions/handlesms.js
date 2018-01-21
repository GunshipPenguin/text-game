'use strict'

const smsUtils = require('../helpers/sms-utils')
const lib = require('lib')({token: process.env.STDLIB_TOKEN})
const constants = require('../constants')
const utils = lib.utils({
  service: 'text-game'
})

function sendSms (recipient, body) {
  return lib.messagebird.tel.sms({
    originator: process.env.SERVER_PHONE_NUMBER,
    recipient: recipient,
    body: smsUtils.encodeMessage(body)
  }).then(() => utils.log(`Sending ${JSON.stringify(body)} to ${recipient}`))
}

function handleOpenLobby (sender) {
  return lib.utils.storage.get(sender).then(game => {
    if (game !== 0 && game !== null) { // Hack to get around the fact that we can't store null in persitence
      throw new Error(`Warning: ${sender} tried to open lobby for game that already exists`)
    }

    // Add a new game to persistence
    return lib.utils.storage.set(sender, {
      player_numbers: [sender],
      lobby: true
    })
  }).then(() => sendSms(sender, { event_type: 'game_lobby_started' }))
}

function handleRegister (sender, hostPhoneNumber) {
  return lib.utils.storage.get(hostPhoneNumber).then(game => {
    if (game === 0 && game === null) { // Hack to get around the fact that we can't store null in persitence
      throw new Error(`Warning: ${sender} tried to register for a game that doesn't exist`)
    } else if (game.lobby === false) {
      throw new Error(`Warning: ${sender} tried to register for a game that is already underway`)
    } else if (game.player_numbers.includes(sender)) {
      throw new Error(`Warning: ${sender} tried to register for a game that they are already in`)
    }

    // Add this player to persistent storage
    game.player_numbers.push(sender)
    return lib.utils.storage.set(hostPhoneNumber, game)
  }).then(game => {
    // Send out a new registration event to all players (including the one that
    // just registered)
    let event = {
      event_type: 'new_registration',
      players_in_lobby: game.player_numbers
    }

    let sendPromises = event.players_in_lobby.map(number => sendSms(number, event))
    return Promise.all(sendPromises)
  })
}

function handleStartGame (sender) {
  return lib.utils.storage.get(sender).then(game => {
    if (game === null) {
      throw new Error(`Warning: ${sender} tried to start a game that doesn't exist`)
    } else if (game.lobby === false) {
      throw new Error(`Warning: ${sender} tried to start a game that has already started`)
    }

    game.lobby = false
    return lib.utils.storage.set(sender, game)
  }).then(game => {
    // Build a game_starting event and send to all players
    let event = {
      timestamp: Date.now(),
      event_type: 'game_starting',
      player_numbers: game.player_numbers,
      treasure_spawns: [{latitude: 43.663083, longitude: -79.396691, timestamp: Date.now() + 20}]
    }

    let sendPromises = event.player_numbers.map(number => sendSms(number, event))
    return Promise.all(sendPromises)
  })
}

/**
* Handler for SMS messages.
*
* @param {string} sender The phone number that sent the text to be handled
* @param {string} receiver The StdLib phone number that received the SMS
* @param {string} message The contents of the SMS
* @param {string} createdDatetime Datetime when the SMS was sent
*/
module.exports = (sender, receiver, message, createdDatetime, context, callback) => {
  // Decompress + decode message
  let messageJson = smsUtils.decodeMessage(message)

  utils.log(`handlesms got text ${JSON.stringify(messageJson)} from ${sender}`).then(() => {
    let actionPromise
    if (messageJson.event_type === 'open_lobby') {
      actionPromise = handleOpenLobby(sender)
    } else if (messageJson.event_type === 'register') {
      actionPromise = handleRegister(sender, messageJson.host_number)
    } else if (messageJson.event_type === 'start_game') {
      actionPromise = handleStartGame(sender)
    } else {
      utils.log.error('Invalid event type specified: ' + messageJson.event_type)
      .then(() => callback(new Error('Invalid event type')))
      .catch(callback)
    }

    actionPromise.then(() => callback(null, constants.OK_CODE)).catch(err => {
      return utils.log.error('Error while processing event', err)
      .then(() => callback(err))
      .catch(callback)
    })
  })
}
