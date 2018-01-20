'use strict'

const tokens = require('../tokens')
const smsUtils = require('../helpers/sms-utils')
const storage = require('../helpers/storage')
const lib = require('lib')({token: tokens.STDLIB_TOKEN})
const utils = lib.utils({
  service: 'text-game'
})

function handleOpenLobby (sender) {
  storage.getGame(sender).then(game => {
    if (game !== null) {
      utils.warn('Warning, tried to open lobby for game that already exists')
    } else {
      storage.setGame(sender, {
        hostPhoneNumber: sender,
        players: [],
        lobby: false
      })
    }
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

    game.players.push(sender)
    storage.setGame(hostPhoneNumber, game)
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
