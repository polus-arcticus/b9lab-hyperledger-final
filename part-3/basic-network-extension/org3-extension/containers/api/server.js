import http from 'http'
import express from 'express'
import bodyParser from 'body-parser'

const Server = http.Server;
const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.engine('html', require('ejs').renderFile);

const ownerRouter = require('./routers/owner-router');


app.use('/api', ownerRouter());



app.set('view engine', 'html')
const httpServer = new Server(app);

app.get('/', (req, res) => {
  res.render('test');
})

httpServer.listen(4000, () => {
  console.log('listening on 4000')
})

