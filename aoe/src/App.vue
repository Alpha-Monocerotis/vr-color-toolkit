<template>
  <div id="app">
    <Dashboard ref="dashboard" class="dash-board"/>
  </div>
</template>

<script>
import Dashboard from './components/Dashboard';
export default {
  name: 'App',
  components: {
    Dashboard
  },
  data() {
    return {
    }
  },
  mounted() {
    this.$refs['dashboard'].init();
  }

}
</script>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  display: flex;
  flex-direction: row;
}
.dash-board {
  position:absolute;
  left: 10px;
  top: 10px;
  width: 40vw;
  height: 90vh;
}
</style>
