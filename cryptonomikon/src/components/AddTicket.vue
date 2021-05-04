<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Тикер</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 p-2.5 focus:border-gray-500 sm:text-sm rounded-md"
            v-model="ticket"
            placeholder="Например DOGE"
          />
        </div>
        <div
          v-if="сyrrencySearch.length"
          class="flex bg-white shadow-md p-1 rounded-md flex-wrap"
        >
          <span
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
            v-for="CR in сyrrencySearch"
            :key="CR"
            @click.stop="addTicketCyrrencySearch(CR.Symbol)"
          >
            {{ CR.Symbol }}
          </span>
        </div>
        <div class="text-sm text-red-600" v-if="isDublicateTickers">
          Такой тикер уже добавлен
        </div>
      </div>
    </div>
    <add-ticket-btn
      @click="addTicket"
      :disabled="isDublicateTickers"
      :class="{ 'opacity-20': isDublicateTickers }"
    />
  </section>
</template>

<script>
import addTicketBtn from "./AddTicketBtn"
export default {
  emits: ["addTicket"],
  props: {
    fullListCurrencies: {
      type: Array,
      requred: false
    },
    tickets: {
      type: Array,
      requred: false
    }
  },
  components: {
    addTicketBtn
  },
  data() {
    return {
      ticket: ""
    }
  },
  methods: {
    addTicket() {
      this.$emit("addTicket", this.ticket)
      this.ticket = ""
    },
    addTicketCyrrencySearch(symbol) {
      this.ticket = symbol
      this.addTicket()
    }
  },
  computed: {
    сyrrencySearch() {
      let count = 0
      return this.fullListCurrencies.filter(({ FullName, Symbol }) => {
        if (count >= 4) return
        if (this.ticket === "") return false

        if (FullName.includes(this.ticket) || Symbol.includes(this.ticket)) {
          count = count + 1
        }
        return FullName.includes(this.ticket) || Symbol.includes(this.ticket)
      })
    },
    isDublicateTickers() {
      return this.tickets.findIndex((t) => t.name === this.ticket) != -1
    }
  }
}
</script>

<style lang="scss" scoped></style>
