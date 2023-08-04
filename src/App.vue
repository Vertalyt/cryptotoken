<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <div class="w-full my-4"></div>

      <AddTicker @add="addTicker" :isDuplicateCoin="isDuplicateCoin" :tooMaxCoin="tooMaxCoin" />

      <template v-if="tickerList.length">
        <hr class="w-full border-t border-gray-600 my-4" />

        <div>
          <button
            v-if="currentPage > 1"
            @click="currentPage = currentPage - 1"
            class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Назад
          </button>
          <button
            v-if="hasNextPage"
            @click="currentPage = currentPage + 1"
            class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Вперед
          </button>
        </div>

        <div>Фильтр: <input v-model="filterText" /></div>

        <hr class="w-full border-t border-gray-600 my-4" />

        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="t in filteredCryptoList"
            :key="t"
            @click="select(t)"
            :class="{
              'bg-red-100': t.notPriseCoin,
              'bg-white': !t.notPriseCoin,
              'border-4': coinDataGraph === t
            }"
            class="overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer border-radius"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">{{ t.name }} - USD</dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ normalizePrice(t.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
              @click.stop="isDeleted(t)"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Удалить
            </button>
          </div>
        </dl>

        <hr class="w-full border-t border-gray-600 my-4" />
      </template>

      <AppGraph
        v-if="coinDataGraph && tickerList.length"
        :graph="graph"
        :coinDataGraph="coinDataGraph"
        @rezetDataGraph="coinDataGraph = null"
        @maxElGraph="maxElGraph"
      />

      <AppLoading v-if="isLoading" />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { subscribeToTickers, unSsubscribeFromTicker } from './ui/fetchCryptoPrice'
import AddTicker from './components/AddTicker.vue'
import AppLoading from './components/AppLoading.vue'
import AppGraph from './components/AppGraph.vue'

export default {
  setup() {
    const coinDataGraph = ref(null)
    const tickerList = ref([])
    const graph = ref([])
    const isLoading = ref(false)
    const filterText = ref('')
    const currentPage = ref(1)
    const isDuplicateCoin = ref(false)
    const tooMaxCoin = ref(false)
    const maxelement = ref()

    const maxElGraph = ((el) => {
      maxelement.value = el
      changeMaxElementsGraph()
    } )

    onMounted(async () => {
      isLoading.value = true
      const windowData = Object.fromEntries(new URL(window.location).searchParams.entries())
      if (windowData.filterText) {
        filterText.value = windowData.filterText
      }
      if (windowData.page) {
        currentPage.value = windowData.page
      }

      const tickersData = localStorage.getItem('cryptonomicon')

      if (tickersData) {
        tickerList.value = JSON.parse(tickersData)
        tickerList.value.forEach((ticker) => {
          subscribeToTickers(ticker.name, (newPrice) =>
            updateTicker(ticker.name, newPrice.price, newPrice.notPriseCoin)
          )
        })
      }
      isLoading.value = false
    })

    const updateTicker = (tickerName, price, notPriseCoin) => {
      tickerList.value
        .filter((t) => t.name === tickerName)
        .forEach((t) => {
          t.price = price
          t.notPriseCoin = notPriseCoin
        })

      if (coinDataGraph.value) {
        changeMaxElementsGraph()
        tickerList.value.filter((t) => {
          if (t === coinDataGraph.value) {
            graph.value.push(t.price)
          }
        })
      }
      tickerList.value = [...tickerList.value]
    }


    const changeMaxElementsGraph = () => {
      if (graph.value.length > maxelement.value) {
        graph.value = graph.value.slice(-maxelement.value)
      }
    }

    const filterIncludes = computed(() => {
      return tickerList.value.filter((t) => t.name.includes(filterText.value))
    })

    const currentPageData = computed(() => {
      const start = (currentPage.value - 1) * 6
      const end = currentPage.value * 6
      return { start, end }
    })

    const filteredCryptoList = computed(() => {
      return filterIncludes.value.slice(currentPageData.value.start, currentPageData.value.end)
    })

    const hasNextPage = computed(() => {
      return currentPageData.value.end < filterIncludes.value.length
    })

    const queriedFilter = computed(() => {
      return {
        filterText: filterText.value,
        currentPage: currentPage.value
      }
    })

    function normalizePrice(prise) {
      if (typeof prise === 'number') {
        return prise > 1 ? prise.toFixed(2) : prise.toPrecision(2)
      } else {
        return prise
      }
    }

    const select = (ticker) => {
      coinDataGraph.value = ticker
      nextTick(() => changeMaxElementsGraph())
    }

    watch(coinDataGraph, () => {
      graph.value = []
    })

    watch(filteredCryptoList, () => {
      if (filteredCryptoList.value.length === 0 && currentPage.value > 1) {
        currentPage.value -= 1
      }
    })

    watch(queriedFilter, (val) => {
      let filter = ''
      if (val.filterText) {
        filter = `&filterText=${val.filterText}`
      }
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?page=${val.currentPage}${filter}`
      )
    })

    watch(filterText, () => {
      currentPage.value = 1
      if (coinDataGraph.value && !coinDataGraph.value.name.includes(filterText.value)) {
        graph.value = []
        coinDataGraph.value = null
      }
    })

    watch(tickerList, () => {
      localStorage.setItem('cryptonomicon', JSON.stringify(tickerList.value))
      tooMaxCoin.value = tickerList.value.length > 3
    })

    const addTicker = (ticker) => {
      const currentTicker = {
        name: ticker.toUpperCase(),
        price: '-',
        notPriseCoin: false
      }

      isDuplicateCoin.value = tickerList.value.some(
        (t) => t.name.toUpperCase() === currentTicker.name
      )

      if (!isDuplicateCoin.value) {
        tickerList.value = [...tickerList.value, currentTicker]
        subscribeToTickers(currentTicker.name, (newPrice) =>
          updateTicker(currentTicker.name, newPrice.price, newPrice.notPriseCoin)
        )
        localStorage.setItem('cryptonomicon', JSON.stringify(tickerList.value))
        filterText.value = ''
      }

      setTimeout(() => {
        isDuplicateCoin.value = false
        filterText.value = ''
      }, 1000)

      if (filteredCryptoList.value.length === 6 && filterIncludes.value.length % 6 !== 0) {
        currentPage.value += 1
      }
    }

    const isDeleted = (tickerToRemove) => {
      tickerList.value = tickerList.value.filter((ticker) => ticker !== tickerToRemove)
      localStorage.setItem('cryptonomicon', JSON.stringify(tickerList.value))

      if (coinDataGraph.value?.name === tickerToRemove.name) {
        coinDataGraph.value = null
      }
      unSsubscribeFromTicker(tickerToRemove.name)
    }

    return {
      tickerList,
      isDeleted,
      addTicker,
      coinDataGraph,
      graph,
      select,
      isLoading,
      isDuplicateCoin,
      filterText,
      filteredCryptoList,
      currentPage,
      hasNextPage,
      normalizePrice,
      tooMaxCoin,
      maxElGraph
    }
  },
  components: {
    AddTicker,
    AppLoading,
    AppGraph
  }
}
</script>

<style src="./assets//app.css" scoped></style>
