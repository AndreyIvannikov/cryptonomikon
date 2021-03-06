<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <animation-loading v-if="loading" />
    <div class="container">
      <add-ticket
        @addTicket="addTicket"
        :tickets="tickets"
        :fullListCurrencies="fullListCurrencies"
      />
      <template v-if="tickets.length > 0">
        страницы {{ page }}
        <div class="flex">
          <input
            class="shadow appearance-none border rounded w-40 py-2 px-3 mr-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            type="text"
            placeholder="Поиск"
            v-model="filter"
          />

          <button
            class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-3 mr-5 border border-blue-500 hover:border-transparent rounded"
            @click="page = page - 1"
            v-if="page != 1"
          >
            Назад
          </button>
          <button
            class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-3 border border-blue-500 hover:border-transparent rounded"
            @click="page = page + 1"
            v-if="!hasNextPage"
          >
            Вперед
          </button>
        </div>
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            class="bg-white overflow-hidden shadow rounded-lg border-2 border-solid cursor-pointer"
            v-for="t in filterTickersPagination"
            :key="t.name"
            @click="currentTicket = t"
            :class="{ 'border-indigo-900': currentTicket === t }"
          >
            <div
              class="px-4 py-5 sm:p-6 text-center"
              :class="{
                'bg-red-100': t.invalid
              }"
            >
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ t.name }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ t.price }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
              @click.stop="deleteHandler(t)"
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

      <graph-ticket
        :normalizetGraph="normalizetGraph"
        :currentTicket="currentTicket"
        @width="calculateMaxGraphElements"
        @closeGraph="closeGraph"
        ref="graph"
      />
    </div>
  </div>
</template>

<script>
import {
  subscribeToTicker,
  unsubscribeFromTicker,
  listOfCurrencies
} from "./api"
import addTicket from "./components/AddTicket"
import animationLoading from "./components/AnimationLoading"
import graphTicket from "./components/GraphTicket"
export default {
  components: { addTicket, animationLoading, graphTicket },
  data() {
    return {
      tickets: [],
      graph: [],
      maxGraphElements: 1,
      oneGraphElement: 38,
      currentTicket: null,
      fullListCurrencies: [],
      repeadTicket: false,
      loading: false,
      page: 1,
      filter: ""
    }
  },
  async beforeMount() {
    this.loading = true
    this.fullListCurrencies = await listOfCurrencies()
    this.loading = false
  },
  created() {
    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    )
    if (windowData.filter) {
      this.filter = windowData.filter
    }
    if (windowData.page) {
      this.page = Number(windowData.page)
    }
    const data = localStorage.getItem("tickets")
    if (data) {
      this.tickets = JSON.parse(data)
      this.tickets.forEach((ticker) => {
        subscribeToTicker(ticker.name, (newPrice, invalid) => {
          this.updateTicker(ticker.name, newPrice, invalid)
        })
      })
    }
    setInterval(this.updateTickers, 5000)
  },

  computed: {
    pagesCountfunction() {
      return Math.round(this.tickets.length / 5)
    },

    maxIndex() {
      return 5 * this.page
    },

    minIndex() {
      return 5 * (this.page - 1)
    },

    filterTickers() {
      return this.tickets.filter((t) => t.name.includes(this.filter))
    },

    filterTickersPagination() {
      return this.filterTickers.slice(this.minIndex, this.maxIndex)
    },

    hasNextPage() {
      return this.maxIndex > this.tickets.length
    },

    normalizetGraph() {
      const maxValue = Math.max(...this.graph)
      const minValue = Math.min(...this.graph)
      if (maxValue === minValue) {
        return this.graph.map(() => 50)
      }
      return this.graph.map((price) => {
        return 5 + ((price - minValue) * 95) / (maxValue - minValue)
      })
    },

    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page
      }
    }
  },
  methods: {
    updateTicker(tickerName, price, invalid) {
      if (this.tickets.length === 0) {
        return
      }
      this.tickets
        .filter((t) => t.name === tickerName)
        .forEach((ticket) => {
          ticket.invalid = invalid
          return (ticket.price = price ?? "-")
        })
      if (this.currentTicket?.name === tickerName) {
        this.graph.push(price)
        if (this.graph.length > this.maxGraphElements) {
          this.graph.shift()
        }
      }
    },

    calculateMaxGraphElements(width) {
      console.log(width)
      this.maxGraphElements = width / this.oneGraphElement
    },

    addTicket(ticket) {
      const currentTicket = {
        price: "-",
        name: ticket
      }
      if (this.isDublicateTickers) {
        return
      }
      this.tickets = [...this.tickets, currentTicket]
      subscribeToTicker(currentTicket.name, (newPrice, invalid) =>
        this.updateTicker(currentTicket.name, newPrice, invalid)
      )
    },

    deleteHandler(tickerToRemove) {
      this.tickets = this.tickets.filter((t) => t !== tickerToRemove)
      unsubscribeFromTicker(tickerToRemove.name)
    },

    closeGraph() {
      this.currentTicket = null
    }
  },
  watch: {
    filter() {
      this.page = 1
    },
    pageStateOptions(value) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter${value.filter}&page=${value.page}`
      )
    },

    currentTicket() {
      this.graph = []
      // console.log(this.$refs.graph.widthContainer())
      this.$refs.graph.widthContainer()
    },

    tickets() {
      localStorage.setItem("tickets", JSON.stringify(this.tickets))
    }
  }
}
</script>
<style></style>
