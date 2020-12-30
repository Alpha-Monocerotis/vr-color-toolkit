<template>
  <div>
    <svg ref="canvas"></svg>
  </div>

</template>

<script>
import * as d3 from 'd3';

function handleDrag() {
  const {x, y} = d3.event;
  window.$bus.emit('changeDataPoints', [this.id, x, y]);
}

function handleDeleteNode() {
    window.$bus.emit('deleteNode', this.id);
}

export default {
  name: "Chart",
  data() {
    return {
      svg: null,
      dataPoints: [],
    }
  },
  mounted() {
    window.$bus = this.$bus;
    this.$bus.on('changeDataPoints', this.handleDrag);
    this.$bus.on('nodeColorChanged', this.handleNodeColorChanged);
  },
  beforeDestroy() {
    this.$bus.off('changeDataPoints', this.handleDrag);
    this.$bus.off('nodeColorChanged', this.handleNodeColorChanged);
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
        let presetDataPointsColor = JSON.parse(message.data)['Color']['Point'];
        let presetDataPointsA = JSON.parse(message.data)['Opacity']['Point'];
        _this.presetDataPoints = [];
        console.log(presetDataPointsA, presetDataPointsColor);
        for(let i=0;i<presetDataPointsColor.length;i++) {
          _this.presetDataPoints.push({
            Index: Number(presetDataPointsA[i]['Index']),
            R: Number(presetDataPointsColor[i]['R']),
            G: Number(presetDataPointsColor[i]['G']),
            B: Number(presetDataPointsColor[i]['B']),
            A: Number(presetDataPointsA[i]['A'])
          })
        }
        console.log(_this.presetDataPoints);
        _this.defineScales();
        // _this.presetDataPoints.forEach(point => {
        //   _this.dataPoints.push([point['index'], point['A']]);
        // });
        _this.reDraw();
        
      }
      if (this.svg !== null) {
        d3.selectAll('[key=chart]').remove();
      }
      this.svg = this.$refs['canvas'];
      d3.select(this.svg)
          .attr("width", '40vw')
          .attr("height", '40vh')
          .attr("key", "chart")
          .on('click', this.addNode);
    },
    defineScales() {
        let minIndex = Math.min.apply(null, this.presetDataPoints.map((point) => {
            return point.Index;
        }));
        let maxIndex = Math.max.apply(null, this.presetDataPoints.map((point) => {
            return point.Index;
        }));
        console.log(minIndex, maxIndex);
        this.xScale = d3.scaleLinear()
            .domain([minIndex, maxIndex])
            .range([50, parseInt(window.innerWidth * 0.4)]);
        this.yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([50, parseInt(window.innerHeight * 0.4)]);
        this.invXScale = d3.scaleLinear()
            .domain([50, parseInt(window.innerWidth * 0.4)])
            .range([minIndex, maxIndex]);
        this.invYScale = d3.scaleLinear()
            .domain([50, parseInt(window.innerHeight * 0.4)])
            .range([0, 100]);
    },
    rgb2hex(r, g, b) {
      return "#" + r.toString(16) + g.toString(16) + b.toString(16);
    },
    reDraw() {
      d3.selectAll('[key=charNode]').remove();
      d3.selectAll('[key=nodeLine]').remove();
      d3.select(this.svg).append('polyline')
      .attr("points", this.presetDataPoints.map(
          (point) => {
              return [this.xScale(point.Index), this.yScale(point.A)]
          }
      ))
      .attr('x', this.xScale(this.presetDataPoints[0].Index))
      .attr('y', this.yScale(this.presetDataPoints[0].A))
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr("stroke-width", 5)
      .attr("key", 'nodeLine');
      for(let i=0;i<this.presetDataPoints.length;i++) {
        // eslint-disable-next-line no-unused-vars
        d3.select(this.svg).append('rect')
            .attr("x", this.xScale(this.presetDataPoints[i].Index) - 10)
            .attr("y", this.yScale(this.presetDataPoints[i].A) - 10)
            // .attr("fill", this.rgb2hex(this.presetDataPoints[i]['R'], this.presetDataPoints[i]['G'], this.presetDataPoints[i]['B']))
            .attr("fill", "#fe3ef0")
            .attr("opacity", 1)
            .attr("width", 20)
            .attr("height", 20)
            .attr("key", "charNode")
            .attr("id", i)
            .on('contextmenu', handleDeleteNode) 
            .call(
                d3.drag()
                    .on('start', () => {})
                    .on('end', () => {})
                    .on('drag', handleDrag)
            );
      }
    },
    addNode() {
      const {x, y} = d3.event;
      this.presetDataPoints.push([
          this.invXScale(x),
          this.invYScale(y)
      ]);
      this.presetDataPoints.sort((p1, p2) => {
          return p1.Index - p2.Index;
      });
      window.ws.send(JSON.stringify(this.presetDataPoints));
      this.reDraw();
    },
    handleDrag(data) {

      this.presetDataPoints.sort((p1, p2) => {
          return p1.Index - p2.Index;
      });

      window.ws.send(JSON.stringify(this.presetDataPoints));
      this.reDraw();
    },
    handleNodeColorChanged(val, id) {
        let {r, g, b} = val;
        
    }
  }
}
</script>

<style scoped>

</style>