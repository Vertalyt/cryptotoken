
export async function fetchCryptoPrice(ctyptoName) {
    const response = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${ctyptoName}&tsyms=USD&API_Key=5fd4273f3b18e3417e6d43d33b84144a064c2bb075cf9d561a0ce2d28905ec24`)
    if (response.ok) { 
      const data = await response.json()
      console.log(data);
        return await response.json();
      } else {
        alert("Ошибка HTTP: " + response.status);
      }
}


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