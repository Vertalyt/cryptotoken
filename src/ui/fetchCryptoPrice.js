const API_Key = '5fd4273f3b18e3417e6d43d33b84144a064c2bb075cf9d561a0ce2d28905ec24'

const tickersHandllers = new Map()
let socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_Key}`)
const AGGREGATE_INDEX = '5'
const INVALID_SUB = '500'



socket.addEventListener('message', (e) => {
  const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice, PARAMETER: errorParametr } = JSON.parse(e.data);

  if (type === INVALID_SUB) {
    const splitResponse = errorParametr.split('~');
    const notPriseCoinName = splitResponse[2];
    const handlers = tickersHandllers.get(notPriseCoinName);
    if (handlers) {
      handlers.forEach((fn) => fn({ price: 'no price', notPriseCoin: true }));
    }
  }
  if (newPrice === undefined) {
    return;
  }
  if (type === AGGREGATE_INDEX) {
  const handlers = tickersHandllers.get(currency) ?? [];
  handlers.forEach((fn) => fn({ price: newPrice, notPriseCoin: false }));
  }
});

function sendToWebSocket(message) {
  const stringifieMssage = JSON.stringify(message)

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifieMssage)
    return
  }
  socket.addEventListener(
    'open',
    () => {
      socket.send(stringifieMssage)
    },
    { once: true }
  )
}

function subscribeToTickersOnWs(ticker) {
  sendToWebSocket({ action: 'SubAdd', subs: [`5~CCCAGG~${ticker}~USD`] })
}

function unSubscribeToTickersOnWs(ticker) {
  sendToWebSocket({ action: 'SubRemove', subs: [`5~CCCAGG~${ticker}~USD`] })
}



export const subscribeToTickers = (ticker, cb) => {
  const subscribers = tickersHandllers.get(ticker) || []
  tickersHandllers.set(ticker, [...subscribers, cb])
  subscribeToTickersOnWs(ticker)
}

export const unSsubscribeFromTicker = (ticker) => {
  tickersHandllers.delete(ticker)
  unSubscribeToTickersOnWs(ticker)
}

window.tickers = tickersHandllers

export async function fetchAllCryptoPrices() {
  const response = await fetch(`https://min-api.cryptocompare.com/data/all/cryptoList?summary=true`)
  if (response.ok) {
    const data = await response.json()
    const coinsArray = Object.values(data.Data)
    return coinsArray
  } else {
    alert('Ошибка HTTP: ' + response.status)
  }
}
