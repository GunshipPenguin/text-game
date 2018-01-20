'use strict'

const tokens = require('../tokens')
const lib = require('lib')({token: tokens.STDLIB_TOKEN})

const storage = {
  /**
   * Retrieves the game hosted by the host with hostPhoneNumber from
   * persistent storage.
   *
   * @param {string} hostPhoneNumber Phone number of host of game to retrieve
   * @return {object} Object containing game information
   */
  getGame: async function (hostPhoneNumber) {
    return await lib.utils.storage.get(hostPhoneNumber)
  },

  /**
   * Sets the game information for the game hosted by the host with
   * hostPhoneNumber to the specified object.
   *
   * @param {string} hostPhoneNumber Phone number of host of game to set
   * @param {object} gameInfo Object containing game information to set
   */
  setGame: async function (hostPhoneNumber, gameInfo) {
    return await lib.utils.storage.set(hostPhoneNumber, gameInfo)
  }
}

module.exports = storage
