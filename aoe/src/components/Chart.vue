<template>
  <div style="width: 800px; height:800px">
    <svg ref="canvas"></svg>
  </div>

</template>

<script>
import * as d3 from 'd3';

function handleDrag() {
  const {x, y} = d3.event;
  window.$bus.emit('changeDataPoints', [this.id, x, y]);
}

export default {
  name: "Chart.vue",
  data() {
    return {
      svg: null,
      dataPoints: [],
    }
  },
  mounted() {
    window.$bus = this.$bus;
    this.$bus.on('changeDataPoints', this.handleDrag);
  },
  beforeDestroy() {
    this.$bus.off('changeDataPoints', this.handleDrag);
  },
  methods: {
    init() {
      window.ws = new WebSocket("ws://localhost:8000");
      // eslint-disable-next-line no-unused-vars
      window.ws.onopen = function (e) {
        console.log('Connection to server opened');
      }
      const _this = this;
      window.ws.onmessage = function (message) {
        console.log(JSON.parse(message.data));
        let presetDataPointsColor = JSON.parse(message.data)['Color']['Point'];
        let presetDataPointsA = JSON.parse(message.data)['Opacity']['Point'];
        _this.presetDataPoints = [];
        console.log(presetDataPointsA, presetDataPointsColor);
        for(let i=0;i<presetDataPointsColor.length;i++) {
          _this.presetDataPoints.push({
            index: Number(presetDataPointsA[i]['Index']),
            R: Number(presetDataPointsColor[i]['R']),
            G: Number(presetDataPointsColor[i]['G']),
            B: Number(presetDataPointsColor[i]['B']),
            A: Number(presetDataPointsA[i]['A'])
          })
        }
        console.log(_this.presetDataPoints);
        _this.presetDataPoints.forEach(point => {
          _this.dataPoints.push([point['index'] + 1000, point['A'] + 100]);
        });
        _this.reDraw();
      }
      if (this.svg !== null) {
        d3.selectAll('[key=chart]').remove();
      }
      this.svg = this.$refs['canvas'];
      console.log(this.svg);
      d3.select(this.svg)
          .attr("width", '100vw')
          .attr("height", '80vh')
          .attr("key", "chart")
          .on('click', this.addNode);
    },
    rgb2hex(r, g, b) {
      return "#" + r.toString(16) + g.toString(16) + b.toString(16);
    },
    reDraw() {
      console.log(this.dataPoints);
      d3.selectAll('[key=charNode]').remove();
      d3.selectAll('[key=nodeLine]').remove();
      d3.select(this.svg).append('polyline')
      .attr("points", this.dataPoints)
      .attr('x', this.dataPoints[0][0])
      .attr('y', this.dataPoints[0][1])
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr("stroke-width", 5)
      .attr("key", 'nodeLine');
      for(let i=0;i<this.dataPoints.length;i++) {
        // eslint-disable-next-line no-unused-vars
        d3.select(this.svg).append('rect')
            .attr("x", this.dataPoints[i][0] - 10)
            .attr("y", this.dataPoints[i][1] - 10)
            // .attr("fill", this.rgb2hex(this.presetDataPoints[i]['R'], this.presetDataPoints[i]['G'], this.presetDataPoints[i]['B']))
            .attr("fill", "#fe3ef0")
            .attr("opacity", 1)
            .attr("width", 20)
            .attr("height", 20)
            .attr("key", "charNode")
            .attr("id", i)
            .call(
                d3.drag()
                    .on('start', () => {})
                    .on('end', () => {})
                    .on('drag', handleDrag)
            );
      }
    },
    addNode() {
      console.log(d3.event);
      const {x, y} = d3.event;
      this.dataPoints.push([x, y]);
      this.dataPoints.sort();
      window.ws.send(JSON.stringify(this.dataPoints));
      this.reDraw();
    },
    handleDrag(data) {

      this.dataPoints[data[0]] = [data[1], data[2]];
      this.dataPoints.sort();
      this.reDraw();

      window.ws.send(JSON.stringify(this.dataPoints));
      this.reDraw();
    },
  }
}
</script>

<style scoped>

</style>