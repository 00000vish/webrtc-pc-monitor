process.env.NODE_ENV = 'production';

const http = require('http');
const ws = require('ws');
const helmet = require("helmet");
const express = require('express');
const socketHandler = require('./socket-handler');
const cors = require('cors');

const app = express();
const port = 5000

const server = http.createServer(app);
const socket = new ws.Server({ server });
const socketPort = 4000;

const handler = new socketHandler();

app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.originAgentCluster());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());

app.use(express.json());

const mongoose = require('mongoose');
const mongoConnectionString = ' ============== YOUR CONNECTION STRING GOES HERE =============='
const machineSchema = require('./models/machine');

mongoose.connect(mongoConnectionString);
mongoose.connection.on('connected', () => console.log('Connected to Database'));
mongoose.connection.on('error', (err) => console.log('Mongoose default connection error: ' + err));

var corsOptions = {
  origin: function (origin, callback) {
    callback(null, true);
  }
}

app.use(cors(corsOptions));

app.post('/sendOffer', async (req, res) => {
  if (req.body.MachineId != undefined && req.body.MachineId != '') {
    var machines = await machineSchema.where('id').equals(req.body.MachineId).lean();
    if (machines.length == 0) {
      var offer = new machineSchema({ id: req.body.MachineId, ip: getIp(req) });
      offer.save();
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(418);
  }
})

app.post('/connect', (req, res) => {
  var online = handler.requestConnection(req.body.id, req.body.offer, req.body.type);
  if(online){
    res.sendStatus(200);
  }else{
    res.sendStatus(404);
  }
})

app.post('/getOffer', async (req, res) => {
  var offers = await machineSchema.where('id').equals(req.body.id).lean();
  res.send(offers);
})

app.get('/getOffers', async (req, res) => {
  var offers = await machineSchema.where({}).lean();
  res.send(offers);
})

app.post('/getAnswer', async (req, res) => {
  var answer = handler.checkRequestAnswered(req.body.id);
  if(answer === null){
    res.sendStatus(404);
  }else{
    res.send({"machineAnswer" : answer});
  }
})

function getIp(req) {
  var ip = req.headers['x-forwarded-for'];
  if (ip === undefined || ip === null) {
    ip = "unknown";
  }
  return ip;
}

socket.on('connection', function connection(ws) {
  handler.add(ws);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

server.listen(socketPort, () => {
  console.log(`Server listening on port ${socketPort}`)
})