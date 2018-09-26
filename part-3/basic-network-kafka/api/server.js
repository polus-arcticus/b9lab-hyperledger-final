import http from 'http'
import express from 'express'
import bodyParser from 'body-parser'

const Server = http.Server;
const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.engine('html', require('ejs').renderFile);

const artistRouter = require('./routers/artist-router');
const brokerRouter = require('./routers/broker-router');
const insuranceRouter = require('./routers/insurance-router');
const ownerRouter = require('./routers/owner-router');
const provenanceRouter = require('./routers/provenance-router');
const researchRouter = require('./routers/research-router');

app.use('/api', artistRouter());
app.use('/api', brokerRouter());
app.use('/api', insuranceRouter());
app.use('/api', ownerRouter());
app.use('/api', provenanceRouter());
app.use('/api', researchRouter());

app.set('view engine', 'html')
const httpServer = new Server(app);

app.get('/', (req, res) => {
  res.render('test');
})

httpServer.listen(3000, () => {
  console.log('listening on 3000')
})

