<template>
  <div id="app">
    <Chart ref="chart" style="width: 80vw; height: 80vh;"/>
    <Photoshop class="color-picker" v-model="colors" v-if="showColorPicker"/>
  </div>
</template>

<script>
import Chart from './components/Chart.vue'
import { Photoshop } from 'vue-color'
export default {
  name: 'App',
  components: {
    Chart,
    Photoshop
  },
  data() {
    return {
      showColorPicker: true,
      colors: {
        hex: '#194d33',
        hsl: { h: 150, s: 0.5, l: 0.2, a: 1 },
        hsv: { h: 150, s: 0.66, v: 0.30, a: 1 },
        rgba: { r: 25, g: 77, b: 51, a: 1 },
        a: 1
      }
    }
  },
  mounted() {
    this.$refs['chart'].init();
  }

}
</script>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex;
  flex-direction: row;
}

color-picker {
  position: absolute;
}
</style>
