function remove_quotation(str) {
  let new_str = str
  while (new_str.indexOf('\"') > -1) {
    new_str = new_str.replace("\"", '')
  }
  return new_str
}

/**
 * Returns a float rounded to the 3 decimals
 *
 * @param {float} value: The number you want to round
 */
function round_to_thousands(value){
  return (Math.round((value) * 1000) / 1000)
}

/**
 * Returns the appropriate stroke width for the edge
 *
 * @param {string} distance_measure: the distance measure being used to compare the clonal trees
 */
function change_edge_stroke_width(distance_measure) {
  return distance_measure == "parent_child_distance" ? "5px": "2px";
}

/**
 * Returns the x position for the label
 * 
 * @param {object} label: A tspan element 
 */
function setX_label(label) {
  var currentNode = label;
  var parentNode = label.parent;
  if (parentNode) {
    var currentNodeX = label.x;
    var parentNodeX = parentNode.x;
    if (label.data.children == null) {
      if (currentNodeX < parentNodeX) {
        return label.x - (label.data.label.length) * 4;
      }
      else if (currentNodeX > parentNodeX) {
        return label.x - 50;
      }
      else {
        return label.x - 5;
      }
    }
    else {
      if (currentNodeX < parentNodeX) {
        return label.x - Math.min(200, (label.data.label.length) * 5);
      }
      else if (currentNodeX > parentNodeX) {
        return label.x - Math.min(50, label.data.label.length * 2);
      }
      else {
        return label.x + 30;
      }
    }
  }
  else {
    return label.x + 30;
  }
}

/**
 * Returns the url of the API
 */
function get_API_base_URL() {
  var baseURL = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/api/';
  return baseURL;
}