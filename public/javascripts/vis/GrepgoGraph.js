/*
  D3.js GrepgoGraphs
*/

d3.grepgoGraph = function module() {
  "use strict";

  // Public variables width default settings
  var type = 'bar',
      width = 300;

  // Private variables

  function grepgoGraph(selection) {
    var graph;
    if (type == 'bar') {
      graph = d3.grepgoGraphBar();
    } else if (type == 'circle') {
      graph = d3.grepgoGraphCircle();
    } else if (type == 'table') {
      graph = d3.grepgoGraphTable();
    }
    
    graph = graph.width(width);
    
    selection
      .call(graph);    
  }
  
  // Getter/setter functions
  grepgoGraph.type = function(_) {
    if (!arguments.length) return type;
    type = _;
    return grepgoGraph;
  };
  
  grepgoGraph.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return grepgoGraph;
  };
  
  return grepgoGraph;

};    