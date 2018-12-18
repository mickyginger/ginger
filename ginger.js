const Middleware = require('./middleware')

class Ginger {
  constructor() {
    this.server = require('http').createServer()
    this.middleware = new Middleware()

    this.init()
  }

  use(fn) {
    this.middleware.add(fn)
    return this
  }

  listen(port, callback) {
    this.server.listen(port, callback)
  }

  init() {

    ['get', 'post', 'put', 'patch', 'delete'].forEach(verb => {
      this[verb] = function(url, callback) {
        this.use((req, res, next) => {
          if(req.url === url && req.method === verb.toUpperCase()) callback(req, res, next)
          else next()
        })
      }
    })

    this.server
      .on('request', (req, res) => {

        res.setHeader('X-Powered-By', 'Ginger')

        res.status = function(status) {
          res.statusCode = status
          return res
        }

        res.json = function(data) {
          const json = JSON.stringify(data)
          res.setHeader('Content-type', 'application/json')
          res.end(json)
        }

        res.send = function(data) {
          res.setHeader('Content-type', 'text/html')
          res.end(data)
        }

        // run the middleware
        this.middleware.run(req, res)

        return res.status(500).end(`Cannot ${req.method} ${req.url}`)
      })
  }
}

module.exports = () => new Ginger()
