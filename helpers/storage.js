'use strict'

const tokens = require('../tokens')
const lib = require('lib')({token: tokens.STDLIB_TOKEN})
const utils = lib.utils({
  service: 'text-game'
})

const storage = {
  getGame: function (hostPhoneNumber) {
    return new Promise((resolve, reject) => {
      lib.utils.storage.get(hostPhoneNumber, (err, value) => {
        if (err) {
          utils.log.error('Could not get game', err)
          reject(err)
          return
        }

        resolve(value)
      })
    })
  },

  setGame: function (hostPhoneNumber, gameInfo) {
    lib.utils.storage.set(hostPhoneNumber, gameInfo, (err, value) => {
      if (err) {
        utils.log.error('Could not get game', err)
      }
    })
  }
}

module.exports = storage
