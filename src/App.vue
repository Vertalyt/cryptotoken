<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
 
    <div class="container">
      <div class="w-full my-4"></div>

      <AddTicker @add="addTicker" :isDuplicateCoin="isDuplicateCoin" :tooMaxCoin="tooMaxCoin"/>

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

      <section v-if="coinDataGraph && tickerList.length" class="relative">
        <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
          {{ coinDataGraph.name }} - USD
        </h3>
        <div class="flex items-end border-gray-600 border-b border-l h-64" ref="refGraph">
          <div
            v-for="(bar, idx) in normalizedGraph"
            ref="refGraphWidth"
            :key="idx"
            :style="{ height: `${bar}%`, width: `${refGraphWidthCullomn}px` }"
            class="bg-purple-800 border"
          ></div>
        </div>
        <button @click="coinDataGraph = null" type="button" class="absolute top-0 right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:svgjs="http://svgjs.com/svgjs"
            version="1.1"
            width="30"
            height="30"
            x="0"
            y="0"
            viewBox="0 0 511.76 511.76"
            style="enable-background: new 0 0 512 512"
            xml:space="preserve"
          >
            <g>
              <path
                d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                fill="#718096"
                data-original="#000000"
              ></path>
            </g>
          </svg>
        </button>
      </section>

      <AppLoading v-if="isLoading" />
    </div>
  </div>


</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch, computed, nextTick } from 'vue'
import { subscribeToTickers, unSsubscribeFromTicker } from './ui/fetchCryptoPrice'
import AddTicker from './components/AddTicker.vue'
import AppLoading from './components/AppLoading.vue'

export default {
  setup() {
    const coinDataGraph = ref(null)
    const tickerList = ref([])
    const graph = ref([])
    const isLoading = ref(false)
    const intervalId = ref()
    const filterText = ref('')
    const currentPage = ref(1)
    const refGraph = ref(null)
    const maxGraphElement = ref(1)
    const refGraphWidthCullomn = 40
    const isDuplicateCoin = ref(false)
    const tooMaxCoin = ref(false)

    onMounted(async () => {
      isLoading.value = true
      window.addEventListener('resize', () => {
        calculateMaxGrapgElevent()
        changeMaxElementsGraph()
      })

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
        const nameTiker = tickerList.value.find((t) => t === coinDataGraph.value)
        graph.value.push(nameTiker.price)
        changeMaxElementsGraph()
      }
      tickerList.value = [...tickerList.value]
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

    const normalizedGraph = computed(() => {
      const max = Math.max(...graph.value)
      const min = Math.min(...graph.value)
      const difference = max - min
      if (max === min) {
        return graph.value.map(() => 5)
      }
      return graph.value.map((price) => 5 + ((price - min) * 95) / difference)
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

    function changeMaxElementsGraph() {
      if (graph.value.length > maxGraphElement.value) {
        graph.value = graph.value.slice(-maxGraphElement.value)
      }
    }

    function calculateMaxGrapgElevent() {
      if (!refGraph.value) {
        return
      }
      maxGraphElement.value = Math.floor(refGraph.value.offsetWidth / refGraphWidthCullomn)
    }

    function normalizePrice(prise) {
      if (typeof prise === 'number') {
        return prise > 1 ? prise.toFixed(2) : prise.toPrecision(2)
      } else {
        return prise
      }
    }

    const select = (ticker) => {
      coinDataGraph.value = ticker

      nextTick(() => {
        calculateMaxGrapgElevent()
      })
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

      isDuplicateCoin.value = tickerList.value.some((t) => t.name.toUpperCase() === currentTicker.name)

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
      //  filtercryptoList()

      if (coinDataGraph.value?.name === tickerToRemove.name) {
        coinDataGraph.value = null
      }
      unSsubscribeFromTicker(tickerToRemove.name)
    }

    onBeforeUnmount(() => {
      clearInterval(intervalId.value)
      window.removeEventListener('resize', calculateMaxGrapgElevent)
    })

    return {
      tickerList,
      isDeleted,
      addTicker,
      coinDataGraph,
      graph,
      normalizedGraph,
      select,
      isLoading,
      isDuplicateCoin,
      filterText,
      filteredCryptoList,
      currentPage,
      hasNextPage,
      normalizePrice,
      refGraph,
      refGraphWidthCullomn,
      tooMaxCoin
    }
  },
  components: {
    AddTicker,
    AppLoading
  }
}
</script>

<style src="./assets//app.css" scoped></style>
