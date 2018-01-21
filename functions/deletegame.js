'use strict'

const lib = require('lib')({token: process.env.STDLIB_TOKEN})
const constants = require('../constants')
const utils = lib.utils({
  service: 'text-game'
})

/**
* Deletes a game from persistent storage
*
* @param {string} host The phone number of the host
*/
module.exports = (host, context, callback) => {
  utils.log(`Deleting game of ${host}`)
  .then(() => lib.utils.storage.set(host, 0))
  .then(() => callback(null, constants.OK_CODE))
  .catch(err => {
    utils.log.error(`Could not delete game of ${host}`)
    callback(err)
  })
}
