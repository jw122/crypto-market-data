const express = require('express');
const WebSocket = require('ws');

var app = express();
app.use(express.static('public'));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    // res.render('home');
    res.sendFile(__dirname + '/index.html');
})

app.get('/hi', (req, res) => {
    res.status(200).json("hello")
})

const http = require('http').Server(app);
const io = require("socket.io")(http);
// listen on every connection
io.on('connection', (socket) => {
    console.log('New connection established!');

    io.sockets.emit('new_message', {message: "how are you?"})

    // when client disconnects
    socket.on('disconnect', function () {
        console.log('A user disconnected');
     });
})

http.listen(process.env.PORT || 8080, () => {
    console.log('Server started');
});

const API_KEY = process.env.API_KEY;

const FETCH_INTERVAL = 2000;
const SUBSCRIPTION_INTERVAL = 2000;

var conn = new WebSocket('wss://stream.cryptowat.ch/connect?apikey='+API_KEY);

// source: https://api.cryptowat.ch/markets
var exchangeIdMap = {'174': "cexio", '61122': "binance-us", '137857': "ftx-us", '5805': "liquid", '74': "bitstamp", '1258': "bittrex", '87': "kraken", '62576': "ftx", '667': "bitbay", '65': "coinbase-pro", '181': "gemini", '427': "bitflyer", '1': "bitfinex", '368': "bisq", '222': "okcoin"}

conn.on('message', function (msg) {
  const d = JSON.parse(msg.toString());

  // The server will always send an AUTHENTICATED signal when you establish a valid connection
  // At this point we can subscribe to resources
  if (d.authenticationResult && d.authenticationResult.status === 'AUTHENTICATED') {
    console.log("Streaming trades for " + FETCH_INTERVAL +  " miliseconds...")
    
    // Run the first time immediately
    const resources = ['instruments:9:book:snapshots']
    doStream(conn, resources);

    //poll every N seconds   
    setInterval(function() {
        doStream(conn, resources);
    }, FETCH_INTERVAL);
  }

  // get the markets
  if (d.marketUpdate && d.marketUpdate.orderBookUpdate) {
    const exchangeId = d.marketUpdate.market.marketId;
    const exchange = exchangeIdMap[exchangeId];

    var bids = d.marketUpdate.orderBookUpdate.bids;
    var asks = d.marketUpdate.orderBookUpdate.asks;

    console.log("got " + bids.length + " bids")
    console.log("got " + asks.length + " asks")
    io.sockets.emit('new_message', {message: {"exchange": exchange, "bids": bids.slice(0,10), "asks": asks.slice(0,10)}})
  }
});


// Helper methods for subscribing to resources
function doStream(conn, resources) {
  subscribe(conn, resources);
  setTimeout(function() {
      console.log("Unsubscribing...")
      unsubscribe(conn, resources)
    }, SUBSCRIPTION_INTERVAL)
}

function subscribe(conn, resources) {
  conn.send(JSON.stringify({
    subscribe: {
      subscriptions: resources.map((resource) => { return { streamSubscription: { resource: resource } } })
    }
  }));
}

function unsubscribe(conn, resources) {
  conn.send(JSON.stringify({
    unsubscribe: {
      subscriptions: resources.map((resource) => { return { streamSubscription: { resource: resource } } })
    }
  }))
}