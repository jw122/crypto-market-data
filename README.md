# Live Crypto Market Data

Real-time visibility to the liquidity across different exchanges for Bitcoin.

<img src="assets/demo.gif" alt="alt text" width="600px">

[1 minute video](https://youtu.be/5_E39Ck5PfI)

## Running locally

You will need a Cryptowatch [API key](https://cryptowat.ch/account/api-access), which should take just a few minutes to obtain (for free).
1. Clone this repository.
2. Run `npm install`
3. Run `nodemon server.js`
4. Open your browser at `http://localhost:8080/`

## How It's Made

This is a simple a node.js app that uses websockets to connect to the [Cryptowatch API](https://docs.cryptowat.ch/websocket-api/) to get a live feed of BTC/USD orders across various exchanges.

Note that the websocket connection polls every few seconds and streams a small batch of bids/asks at a time to the UI, as opposed to maintaining an uninterruped real-time feed. This is done to throttle the volume of instantaneous orders and prevent overwhelming the client with thousands data points.

Cryptowatch itself broadcasts the snapshots about [once per minute](https://docs.cryptowat.ch/websocket-api/data-subscriptions/order-books).

For data streaming between the browser client and app's server, [socket.io](https://socket.io/) was used so that the incoming data could be immediately rendered in the browser.


Other data sources considered:
- Shrimpy (https://developers.shrimpy.io/)
- CoinAPI (https://docs.coinapi.io/#hello)
- Nomics (https://nomics.com/assets/btc-bitcoin#chart)

## Limitations & Alternatives
For demonstration purposes, only a subset of bid/ask orders (out of hundreds or thousands polled every few seconds) are sent to the client. Ideally, the client should be able to render a more continuous stream of updates. On the client side, a more responsive framework or library could be used instead.

Perhaps a cleaner separation between the app's client and server is to replace the usage of socket.io for communication between the two with a cache or temporary datastore. The server would still maintain a websocket connection with Cryptowatch, but instead of emitting the messages to the client, it would write directly to a cache or table. The client, instead of listening for updates from the server, could periodically read from the cache and update the UI.

## Next Steps
Potential additional features include:
- Adding data from more sources and exchanges
- Take action based on the order book data
- Filter for bids/asks by amount and exchange
- Price alerts