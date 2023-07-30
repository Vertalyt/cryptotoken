const tickersHandllers = new Map

const API_Key = '5fd4273f3b18e3417e6d43d33b84144a064c2bb075cf9d561a0ce2d28905ec24'

const loadTickers = async () =>  {

  if(tickersHandllers.size === 0) {
    return
  }


  try { 
    const response = await fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[...tickersHandllers
    .keys()]
    .join(',')}&tsyms=USD&API_Key=${API_Key}`)
        const data = await response.json();
        const updatePrise = Object.fromEntries(Object.entries(data).map(([key, value])=> [key, value.USD]))
        
        Object.entries(updatePrise).forEach( ([currency, newPrice]) => {
          const handlers = tickersHandllers.get(currency) ?? []
          handlers.forEach(fn => fn(newPrice))
        } )

  } catch (error) {
    console.log(error)
  }
}

export const subscribeToTickers = (ticker, cb) => {
  const subscribers = tickersHandllers.get(ticker) || []
  tickersHandllers.set(ticker, [...subscribers, cb]  )
}

export const unSsubscribeFromTicker = ticker => {

  tickersHandllers.delete()

}

window.tickers = tickersHandllers;

setInterval(loadTickers , 5000)

export async function fetchAllCryptoPrices() {
  const response = await fetch(`https://min-api.cryptocompare.com/data/all/cryptoList?summary=true`)
  if (response.ok) { 
      const data = await response.json();
      const coinsArray = Object.values(data.Data);
      return coinsArray
    } else {
      alert("Ошибка HTTP: " + response.status);
    }
}