(function() {
  var self = this;
  self.bubble = self.bubble || {};
  this.bubble.utils = {};

  /**
   * Takes a data node with positive and negative attributes and calculates the
   * size of the node
   *
   * @param node data node with positive and negative attributes
   * @return size of the node ( to be used to draw a bubble)
   */
  function sizeOf(node) {
    return (node.positive || 0) + (node.negative || 0);
  }

  /**
   * Modifies the json data
   * @param data the loaded data from .json file
   * @return data with the structure
   * {
   *   value:  value,
   *   lng:  longitude_coordinates,
   *   lat:  latitude_coordinates,
   *   time: timestamp
   * }
   */
  this.bubble.utils.modify = function (data) {
    var children = [];
    var newData = {
      name: "Bubble Chart",
      children: children
    };
    _.each(data, function(v, k) {
      children.push({
        name: k,
        children: [{
          name: k,
          size: sizeOf(v),
          negative: v.negative,
          positive: v.positive
        }]
      });
    });
    return newData;
  };

  /**
   * Gets the width and height of the parent node of the element passed
   */
  this.bubble.utils.getWidthHeight = function(element) {
    var node = element.node().parentNode;
    return {
      width: node.offsetWidth,
      height: node.offsetHeight
    };
  };

}).call(window);
