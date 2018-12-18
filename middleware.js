class Middleware {

  constructor() {
    this.index = 0
  }

  add(func) {
    this[this.index] = func
    this.index++
  }

  run(req, res) {
    const call = index => {
      if(index < this.index) this[index].call(null, req, res, () => call(index+1))
    }
    call(0)
  }
}

module.exports = Middleware
