import React, { Component } from 'react';
import styles from './Viz.css';
import * as d3 from 'd3';

class Viz extends Component {
  state = {
    fillColours: d3.scaleOrdinal(d3.schemeCategory10),

    forceSimulation: null,
    forceXCombine: d3.forceX().strength(this.centerGravity),
    forceYCombine: d3.forceY().strength(this.centerGravity),
    forceGravity: null,
    forceCluster: null,

    clusterSelector: 'industry',
    radiusSelector: 'none',
    radiusScale: null,
    uniqueClusterValues: null,
    clusterCenters: null,

    circles: d3.selectAll('circle'),
    nodes: null
  };

  render() {
    // destructuring
    const { data, nodes } = this.props;
    const { clusterSelector } = this.state;
    console.log(nodes);

    return (
      <React.Fragment>
        <svg className="canvas" onClick={() => this.closeTooltip()}>
          <g className="circlesG">
            {data.map(d => {
              return (
                <circle
                  key={d.id}
                  r="10"
                  cx={Math.random() * 5}
                  cy={Math.random() * 5}
                  fill={this.state.fillColours(d[clusterSelector])}
                />
              );
            })}
          </g>
        </svg>
      </React.Fragment>
    );
  }
  radiusScale() {}
  componentDidMount() {
    const { data } = this.props;
    const { radiusSelector, clusterSelector, clusterCenters } = this.state;

    const newUniqueClusterValues = data
      .map(d => d[clusterSelector])
      // filter uniqueOnly
      .filter((value, index, self) => self.indexOf(value) === index);

    console.log(this.props);

    const newRadiusScale = d3
      .scaleSqrt() // sqrt because circle areas
      .domain(
        radiusSelector === 'none'
          ? [1, 1]
          : d3.extent(data, d => +d[radiusSelector])
      )
      .range(
        radiusSelector === 'none'
          ? Array(2).fill(this.defaultCircleRadius)
          : this.radiusRange
      );

    this.setState({
      radiusScale: newRadiusScale,
      uniqueClusterValues: newUniqueClusterValues
    });
    let newClusterCenters = [];
    const newNodes = data.map(d => {
      // scale radius to fit on the screen
      const scaledRadius = this.radiusScale(+d[radiusSelector]);

      // SELECT THE CLUSTER VARIABLE 2/2
      const forcedCluster =
        newUniqueClusterValues.indexOf(d[clusterSelector]) + 1;

      // define the nodes
      d = {
        id: d.id, // circle attributes
        r: scaledRadius,
        cluster: forcedCluster,
        clusterValue: d[clusterSelector], // skills
        skillsMath: d.skillsMath,
        skillsLogi: d.skillsLogi,
        skillsLang: d.skillsLang,
        skillsComp: d.skillsComp, // tooltip info
        all: d
      };
      // add to clusters array if it doesn't exist or the radius is larger than another radius in the cluster
      if (
        !newClusterCenters[forcedCluster] ||
        scaledRadius > newClusterCenters[forcedCluster].r
      ) {
        newClusterCenters[forcedCluster] = d;
      }
      return d;
    });

    this.setState({ nodes: newNodes, clusterCenters: newClusterCenters });

    const {
      forceXCombine,
      forceYCombine,
      forceCollide,
      forceGravity,
      forceCluster,
      nodes
    } = this.state;

    const newForceSimulation = d3
      .forceSimulation()
      .nodes(newNodes)
      // .velocityDecay(0.3)
      .force('x', this.forceXCombine)
      .force('y', this.forceYCombine)
      .force('collide', this.forceCollide)
      .force('gravity', this.forceGravity)
      .force('cluster', this.forceCluster)
      .on('tick', this.ticked);

    newForceSimulation.alpha(0.3).restart();
    this.setState({ forceSimulation: newForceSimulation });
  }
  closeTooltip = () => {
    console.log('closing tooltip');
  };
  ticked = () => {
    this.state.circles.attr('cx', d => d.x).attr('cy', d => d.y);
  };
  dragstarted = d => {
    if (!d3.event.active) {
      this.forceSimulation.alphaTarget(0.3).restart();
    }
    d.fx = d.x;
    d.fy = d.y;
  };
  dragged = d => {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  };
  dragended = d => {
    if (!d3.event.active) {
      this.forceSimulation.alphaTarget(0);
    }
    d.fx = null;
    d.fy = null;
  };
}

export default Viz;
