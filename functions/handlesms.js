'use strict'

const smsUtils = require('../helpers/sms-utils')
const lib = require('lib')({token: 'IyOStmVa0I-f5r1DNhJB2i5Cykyem2f6wzaBxzBdJM-59DLTGVe2oXA-jMEAr638'})
const utils = lib.utils({
  service: 'text-game'
})

const OK_CODE = 'ok'

function sendSms (recipient, body) {
  return lib.messagebird.tel.sms({
    originator: process.env.SERVER_PHONE_NUMBER,
    recipient: recipient,
    body: smsUtils.encodeMessage(body)
  })
}

function handleOpenLobby (sender) {
  return lib.utils.storage.get(sender).then(game => {
    if (game !== null) {
      throw new Error('Warning: tried to open lobby for game that already exists')
    }

    // Add a new game to persistence
    return lib.utils.storage.set(sender, {
      player_numbers: [sender],
      lobby: true
    })
  }).then(() => {
    // Inform player of open lobby
    return sendSms(sender, { event_type: 'game_lobby_started' }).catch(err => {
      utils.error('Warning: could not send open_lobby event to player', err)
    })
  })
}

function handleRegister (sender, hostPhoneNumber) {
  return lib.utils.storage.get(hostPhoneNumber).then(game => {
    if (game === null) {
      throw new Error("Warning: tried to register for a game that doesn't exist")
    } else if (game.lobby === false) {
      throw new Error('Warning: tried to register for a game that is already underway')
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
      throw new Error("Warning: tried to start a game that doesn't exist")
    } else if (game.lobby === false) {
      throw new Error('Warning: tried to start a game that has already started')
    }

    game.lobby = false
    return lib.utils.storage.set(sender, game)
  }).then(game => {
    // Build a game_starting event and send to all players
    let event = {
      timeStamp: Date.now(),
      event_type: 'game_starting',
      player_numbers: game.player_numbers,
      capture_points: {}, // TODO: Implement this
      enemy_spawns: {}, // TODO: Implement this
      game_end: Date.now() + 900 // TODO: Un-hardcode this
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

  const gameToSet = {
    player_numbers: ['17782350067', '12048170614'],
    lobby: true
  }

  lib.utils.storage.set('12048170614', gameToSet).then(() => {
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

    actionPromise.then(() => callback(null, OK_CODE)).catch(err => {
      return utils.log.error('Error while handling message', err)
      .then(() => callback(err))
      .catch(callback)
    })
  }).catch(callback)
}
