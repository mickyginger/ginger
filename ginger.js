class Ginger {
  constructor() {
    this.server = require('http').createServer()
    this.middlewares = []

    this.init()
  }

  use(fn) {
    this.middlewares.push(fn)
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

        // run the middlewares
        const runMiddlewares = index => {
          const count = this.middlewares.length
          if(index < count) return this.middlewares[index].call(null, req, res, () => runMiddlewares(index+1))
        }

        runMiddlewares(0)

        return res.status(500).end(`Cannot ${req.method} ${req.url}`)
      })
  }
}

module.exports = () => new Ginger()
