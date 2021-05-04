const API_KEY = `5cec9a7d47c81fc9f06c08cb0afda55bf936812dbd4b995eb54fe252f2c01a45`
const tickersHandlers = new Map() // {}
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
)
const AGGREGATE_INDEX = "5"

socket.addEventListener("message", (e) => {
  let {
    FROMSYMBOL: currency,
    PRICE: newPrice,
    TYPE: type,
    PARAMETER: parameter,
    MESSAGE: message
  } = JSON.parse(e.data)

  if (message === "INVALID_SUB") {
    tickersHandlers.get(parameter.split("~")[2]).forEach((fn) => fn("-", true))
  }
  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return
  }

  const handlers = tickersHandlers.get(currency) ?? []

  handlers.forEach((fn) => fn(newPrice))
})

function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message)
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage)
    return
  }

  socket.addEventListener("error", (e) => {
    console.log(e)
  })

  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage)
    },
    {
      once: true
    }
  )
}

export async function listOfCurrencies() {
  const response = await fetch(
    `https://min-api.cryptocompare.com/data/all/coinlist?summary=true&api_key=${API_KEY}`
  )
  const { Data } = await response.json()
  return Object.values(Data)
}

function subscribeToTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`]
  })
}

function unsubscribeFromTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`]
  })
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || []
  tickersHandlers.set(ticker, [...subscribers, cb])
  subscribeToTickerOnWs(ticker)
}

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker)
  unsubscribeFromTickerOnWs(ticker)
}
let worker = new SharedWorker("test.js")
// worker.postMessage('Message posted to worker');
worker.onconnect = function (e) {
  var port = e.ports[0]

  port.onmessage = function (e) {
    var workerResult = "Result: " + e.data[0] * e.data[1]
    port.postMessage(workerResult)
  }

  port.start()
}

worker.port.postMessage("start")
console.log(worker)
