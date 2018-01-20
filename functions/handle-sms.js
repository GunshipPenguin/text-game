'use strict'

const tokens = require('../tokens')
const smsUtils = require('../helpers/sms-utils')
const storage = require('../helpers/storage')
const lib = require('lib')({token: tokens.STDLIB_TOKEN})
const utils = lib.utils({
  service: 'text-game'
})

async function sendSms (recipient, body) {
  await lib.messagebird.tel.sms({
    originator: process.env.SERVER_PHONE_NUMBER,
    recipient: recipient,
    body: smsUtils.encodeMessage(body)
  })
}

function handleOpenLobby (sender) {
  storage.getGame(sender).then(game => {
    if (game !== null) {
      utils.warn('Warning: tried to open lobby for game that already exists')
      return
    }

    // Add a new game to persistence
    storage.setGame(sender, {
      hostPhoneNumber: sender,
      players: [],
      lobby: false
    })

    // Inform player of open lobby
    sendSms(sender, { event_type: 'open_lobby' }).catch(err => {
      utils.error('Warning: could not send open_lobby event to player', err)
    })
  })
}

function handleRegister (sender, hostPhoneNumber) {
  storage.getGame(hostPhoneNumber).then(game => {
    if (game === null) {
      utils.warn("Warning: tried to register for a game that doesn't exist")
      return
    } else if (game.lobby === false) {
      utils.warn("Warning: tried to register for a game that doesn't exist")
      return
    }

    // Add this player to persistent storage
    game.players.push(sender)
    storage.setGame(hostPhoneNumber, game)

    // Send out a new registration event to all players (including the one that
    // just registered)
    let event = {
      event_type: 'new_registration',
      players_in_lobby: game.players
    }

    event.players_in_lobby.forEach(number => {
      sendSms(number, event).catch(err => {
        utils.error('Warning: could not send new_registration event to player',
            err)
      })
    })
  })
}

function handleStartGame (sender) {
  storage.getGame(sender).then(game => {
    if (game === null) {
      utils.warn("Warning: tried to start a game that doesn't exist")
      return
    } else if (game.lobby === false) {
      utils.warn('Warning: tried to start a game that has already started')
      return
    } else if (sender !== game.hostPhoneNumber) {
      utils.warn('Warning: player tried to start a game when not host')
      return
    }

    game.lobby = false
    storage.setGame(sender, game)

    // Build a game_starting event and send to all players
    let event = {
      timeStamp: Date.now(),
      event_type: 'game_starting',
      player_numbers: game.player_numbers,
      capture_points: {}, // TODO: Implement this
      enemy_spawns: {}, // TODO: Implement this
      game_end: Date.now() + parseInt(process.env.GAME_LENGTH, 10)
    }

    event.player_numbers.forEach(number => {
      sendSms(number, event).catch(err => {
        utils.error('Warning: could not send game_starting event to player',
            err)
      })
    })
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

  if (messageJson.event_type === 'open_lobby') {
    handleOpenLobby()
  } else if (messageJson.event_type === 'register') {
    handleRegister()
  } else if (messageJson.event_type === 'start_game') {
    handleStartGame()
  }
}
