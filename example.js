const ginger = require('./ginger')
const port = 4000

const app = ginger()

app.get('/', (req, res) => res.json({ message: 'Really??' }))

app.listen(port, () => console.log(`Ginger is running on port ${port}`))
