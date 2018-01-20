'use strict'

const zlib = require('zlib')
const tokens = require('../tokens')
const lib = require('lib')({token: tokens.STDLIB_TOKEN})
const utils = lib.utils({
  service: 'text-game'
})

const smsUtils = {
  /**
   * Given a message as base64 encoded zlib data, return its corresponding
   * JSON.
   *
   * @param {string} message Message to decode
   */
  decodeMessage: function (message) {
    try {
      let decompressed = zlib.inflateSync(Buffer.from(message, 'base64'))
      console.log(decompressed.toString())
      let parsedObject = JSON.parse(decompressed.toString())

      return parsedObject
    } catch (e) {
      utils.log.error('Could not parse SMS', e)
    }
  }
}

module.exports = smsUtils
