<template>
  <section>
    <div class="flex">
          <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700">Тикер</label>
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="inputTicket"
            pattern="^[a-zA-Z0-9]+$"
            @input="inputUp"
            @keyup.enter="addTicker"
            :disabled="tooMaxCoin"
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
          />
          <span v-if="!isValidInput && inputTicket">Пожалуйста, используйте только английские буквы и цифры.</span>
        </div>

        <div v-if="matchedCoins.length" class="flex bg-white shadow-md p-1 rounded-md flex-wrap">
          <span
            v-for="t in matchedCoins"
            :key="t.symbol"
            @click="addInput(t.symbol)"
            @keyup.enter="addInput(t.symbol)"
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            {{ t.symbol }}   
          </span>
        </div>
        <div v-if="tooMaxCoin" class="text-sm">Достигнуто максимальное количество коинов на добавление</div>
        <div v-if="isDuplicateCoin" class="text-sm text-red-600">Такой тикер уже добавлен</div>
        <div v-if="erroeEmty" class="text-sm text-red-600">Введите название тикера.</div>
        <add-button class="my-4" @click="addTicker" :tooMaxCoin="tooMaxCoin" />
  </div>
  </div>
  </section>

</template>

<script setup>
import AddButton from './AddButton.vue'
import { ref, onMounted, computed} from 'vue'

import { fetchAllCryptoPrices } from '../ui/fetchCryptoPrice'
const emit = defineEmits({
  add: value => typeof value === "string"
})
// eslint-disable-next-line no-unused-vars
const props = defineProps(['isDuplicateCoin', 'tooMaxCoin'])
const inputTicket = ref('')
const cryptoList = ref([])
const matchedCoins = ref([])
const erroeEmty = ref('')

onMounted(async () => {
  cryptoList.value = await fetchAllCryptoPrices()
})

const inputUp = () => {
  if (inputTicket.value.length > 1) {
    if (cryptoList.value) {
      const inputValue = inputTicket.value.toUpperCase()
      let rezult = cryptoList.value.filter((c) => {
        const symbol = c.symbol.toUpperCase()
        const fullName = c.partner_symbol.toUpperCase()
        return symbol.includes(inputValue) || fullName.includes(inputValue)
      })
      rezult.sort((a, b) => a.symbol.length - b.symbol.length)
      matchedCoins.value = rezult.slice(0, 4)
    }
  }
}

function addInput(t) {
      inputTicket.value = t
      addTicker()
    }
   const isValidInput = computed(() => {
      // Проверка валидности значения через регулярное выражение
      const regex = /^[a-zA-Z0-9]+$/;
      return regex.test(inputTicket.value);
   })


const addTicker = () => {
  if (inputTicket.value.length > 1 ) {
    emit('add', inputTicket.value)
  } else {
    erroeEmty.value = true
  }
  setTimeout(() => {
          inputTicket.value = ''
          matchedCoins.value = ''
          erroeEmty.value = false
        }, 1000)
}

// eslint-disable-next-line no-unused-vars
const components = {
  AddButton
}
</script>

