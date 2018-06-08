class Config {
  constructor () {
    this.version = 1

    this.enableSlack = true
    this.slackWebHookUri = 'https://hooks.slack.com/services/xxxxxx/xxxxxx/xxxxxx'
    this.slackChannel = ''
    this.slackUsername = 'dns-tester-bot'

    this.botName = 'dns-tester-bot'
    this.botIcon = 'https://compilenix.org/cdn/Compilenix.png'
  }
}

module.exports = new Config()
