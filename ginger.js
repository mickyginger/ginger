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

  qs(query) {
    return [...new URLSearchParams(query).entries()]
      .reduce((sum, [key,val]) => Object.assign({[key]:val}, sum), {})
  }

  init() {

    ['get', 'post', 'put', 'patch', 'delete'].forEach(verb => {
      this[verb] = function(path, callback) {
        this.use((req, res, next) => {
          if(req.path === path && req.method === verb.toUpperCase()) callback(req, res, next)
          else next()
        })
      }
    })

    this.server
      .on('request', (req, res) => {
        const [path, query] = req.url.split('?')
        req.query = this.qs(query)
        req.path = path

        req.body = []

        req.on('data', chunk => {
          req.body.push(chunk)
        })
          .on('end', () => {

            req.body = JSON.parse(Buffer.concat(req.body).toString())

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

            this.middleware.run(req, res)

            return res.status(500).end(`Cannot ${req.method} ${req.url}`)
          })
      })
  }
}

module.exports = () => new Ginger()
