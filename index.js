'use-strict'
const dns = require('dns')

const fs = require('fs-extra')
const moment = require('moment')
const https = require('https')
const punycode = require('./node_modules/punycode')

if (!fs.existsSync('./config.js')) {
  fs.copySync('./config.example.js', './config.js')
}

let config = require('./config.js')
const packageJson = require('./package.json')
/** @type {{message: string, ts: number, color: string}[]} */
let messagesToSend = []

function uniqueArray (/** @type {any[]} */ arr) {
  return Array.from(new Set(arr))
}

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
async function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function sendReport () {
  let payloads = []
  let attachments = []
  for (let index = 0; index < messagesToSend.length; index++) {
    const { message, ts, color } = messagesToSend[index]
    const attachment = {
      footer: config.botName || undefined,
      footer_icon: config.botIcon || undefined,
      color: color
    }
    if (attachment.footer === undefined) delete attachment.footer
    if (attachment.footer_icon === undefined) delete attachment.footer_icon

    attachment.fallback = `${message}`
    attachment.text = attachment.fallback
    attachment.ts = ts
    attachments.push(attachment)

    if (attachments.length > 18 || index === messagesToSend.length - 1) {
      let payload = {
        channel: config.slackChannel || undefined,
        username: config.slackUsername || undefined,
        attachments: attachments
      }
      attachments = []

      if (payload.channel === undefined) delete payload.channel
      if (payload.username === undefined) delete payload.username
      payloads.push(payload)
    }
  }

  async function sendWebook (payload) {
    return new Promise(async (resolve, reject) => {
      try {
        const data = JSON.stringify(payload, /* replacer */ null, /* space */ 0)
        const url = new Url(task.webhook || config.slackWebHookUri)
        const request = https.request({
          timeout: 3000,
          protocol: 'https:',
          method: 'POST',
          host: url.host,
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length,
            'User-Agent': `${packageJson.name}/${packageJson.version} (${packageJson.repository.url}) admin contact: ${config.adminContact}`,
            'Accept': 'application/json, text/json;q=0.9, */*;q=0',
            'Accept-Language': 'en',
            'Accept-Encoding': 'gzip, deflate, identity;q=0.2, *;q=0',
            'From': config.adminContact // See: https://tools.ietf.org/html/rfc7231#section-5.5.1
          },
          hostname: url.hostname,
          path: `${url.pathname}${url.search}`,
          // @ts-ignore
          rejectUnauthorized: config.rejectUnauthorizedSsl
        }, async res => {
          resolve(res)
        })

        request.end(data)
      } catch (error) {
        if (error) console.error(error)
        reject(error)
      }
    })
  }

  for (let index = 0; index < payloads.length; index++) {
    const payload = payloads[index]
    await sendWebook(payload)
    await sleep(1000) // comply to api rate limiting
  }
}

/**
 * @param {string} message
 * @param {string} method
 * @param {string} hostname
 */
function addMessage (message, method, hostname, level = 'error') {
  let color = '#d50200' // error
  switch (level) {
    case 'warn':
      color = '#de9e31'
      break
  }

  messagesToSend.push({
    message: `${method} ${hostname} -> ${message}\n`,
    ts: Date.now() / 1000,
    color: color
  })
}

async function run () {
}

(async () => {
  await run()
  await sendReport()
  console.log('done')
})()
