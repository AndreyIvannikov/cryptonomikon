<template>
  <button
    type="button"
    class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
  >
    <add-ticket-btn-icon />
    Добавить
  </button>
</template>
<script>
import addTicketBtnIcon from "./AddTicketBtnIcon"
export default {
  components: { addTicketBtnIcon },
  data() {
    return {}
  },
  methods: {
    addTicket() {
      this.$emit("addTicket")
    }
  }
}
</script>
