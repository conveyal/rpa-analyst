/*
  D3.js GrepgoGraphs
*/

d3.grepgoGraphTreeMap = function module() {
  "use strict";

  // Public variables width default settings
  var width = 300;

  // Private variables
  var height = width;  

  function grepgoGraphTreeMap(selection) {
        
  }
  
  // Getter/setter functions
  grepgoGraphTreeMap.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return grepgoGraphTreeMap;
  };      
  
  return grepgoGraphTreeMap;

};    