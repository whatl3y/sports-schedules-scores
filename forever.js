const forever = require('forever-monitor')

const times = 10
const child = new (forever.Monitor)('dist/bin/server.js', {
  max: times,
  silent: false,
  args: []
})

child.on('exit', () => console.log(`index.js has exited after ${times} restarts`))
child.start()
