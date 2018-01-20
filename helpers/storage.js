'use strict'

const tokens = require('../tokens')
const lib = require('lib')({token: tokens.STDLIB_TOKEN})
const utils = lib.utils({
  service: 'text-game'
})

const storage = {
  /**
   * Retrieves the game hosted by the host with hostPhoneNumber from
   * persistent storage.
   *
   * @param {string} hostPhoneNumber Phone number of host of game to retrieve
   * @return {promise} a promise that resolves with game information
   */
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

  /**
   * Sets the game information for the game hosted by the host with
   * hostPhoneNumber to the specified object.
   *
   * @param {string} hostPhoneNumber Phone number of host of game to set
   * @param {object} gameInfo Object containing game information to set
   */
  setGame: function (hostPhoneNumber, gameInfo) {
    lib.utils.storage.set(hostPhoneNumber, gameInfo, (err, value) => {
      if (err) utils.log.error('Could not get game', err)
    })
  }
}

module.exports = storage
