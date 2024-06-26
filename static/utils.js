function remove_quotation(str) {
  let new_str = str
  while (new_str.indexOf('\"') > -1) {
    new_str = new_str.replace("\"", '')
  }
  return new_str
}

// Function that downloads the svgs as .svg files
function downloadSVG(svg) {
  var svg = document.querySelector(svg);
  var base64doc = btoa(unescape(encodeURIComponent(svg.outerHTML)));
  var a = document.createElement('a');
  var e = new MouseEvent('click');
    //a.download = 'tree_download.svg';

    var distance_metric = document.getElementById("distance_metric").value;

    if ((tree1_filename == undefined) || (tree2_filename == undefined)) {
	alert("Please input two trees.")
    }
    
    else {

	var t1_name = tree1_filename;
	var t2_name = tree2_filename;

	t1_name = t1_name.replace(".txt", "");
	t2_name = t2_name.replace(".txt", "");
	
	if (tree1_filename.includes("*")) {
	    t1_name = t1_name.replace("*", "");
	     t1_name += "_modified";
	}
	if (tree2_filename.includes("*")) {
	    t2_name = t2_name.replace("*", "");
	    t2_name += "_modified";
	}


	 a.download = t1_name + "_VS_" + t2_name + "_"+ distance_metric + ".svg";

    
	a.href = 'data:image/svg+xml;base64,' + base64doc;
	a.dispatchEvent(e);
    }

   
}

// General toggle function
function toggle(id) {
    var x = document.getElementById(id);
    x.style.display = x.style.display == 'inline-block' ? 'none' : 'inline-block';
}

// General untoggle function 
function toggleVisible(id) {
  var x = document.getElementById(id);
  x.style.display = x.style.display == 'none' ? 'inline-block' : 'none';
}

/**
 * Returns an integer representing the max branching factor of the tree.
 *
 * @param {array} nodes: Nodes of a clonal tree
 */
function get_branching_factor(nodes) {
  var max_branching_factor = d3.max(nodes, function(d) { 
    if (d.children) {
      return d.children.length;
    }
    return 0;
  });
  return max_branching_factor;
}

function max_contribution(nodes){
  return d3.max(nodes, function(d) { return d.data.contribution;});
}

function min_contribution(nodes){
   
  var min_cont = d3.min(nodes, function(d) { return d.data.contribution;});
  // the case that all mutations contribute 0
  return min_cont;
}

/**
 * Returns a string containing the top n contributing mutations
 *
 * @param {integer} n: # of mutations you want listed
 */
function get_top_n_mutations(tree_dict, n) {
  var mutation_contribution_dict = {};
    for (const [mutation, value] of Object.entries(tree_dict)) {
	if (value["contribution"] != 0) {
	    mutation_contribution_dict[mutation] = value["contribution"];
	}
    }

    //if the trees are identical, return no top contributors
    if (Object.keys(mutation_contribution_dict).length == 0) {
	return "";
    }
    
  var items = Object.keys(mutation_contribution_dict).map(
  (key) => { return [key, mutation_contribution_dict[key]] });
    
    
  items.sort(
    (first, second) => { return second[1] - first[1] } // from greatest to least
  );
  var keys = items.map((e) => { return e[0] });


    var v;
   

    var output_str = "";
    
    var current_key = "";
    for (v = 0; v < keys.length; v++){

	if (v == keys.length - 1){ //so v+1 out of bounds
	    output_str = output_str.concat(keys[v]);
	}

	else if (mutation_contribution_dict[keys[v]] == mutation_contribution_dict[keys[v+1]]) {
	    output_str = output_str.concat(keys[v])
	    output_str = output_str.concat(", ");
	}
	else {
	    output_str = output_str.concat(keys[v])
	    output_str = output_str.concat(",<br>"); 
	}
	
  }



  
    


    
  console.log(output_str);
  return(output_str)
}

/**
 * Returns a float rounded to the 3 decimals
 *
 * @param {float} value: The number you want to round
 */
function round_to_thousands(value){
  return (Math.round((value) * 1000) / 1000)
}

function change_label_fill(data, label) {
  if (label.localName == "span") {
    return mutation_table_color;
  }
  else {
    return no_contribution_color;
    var tree = label.ownerSVGElement.id;
    var contribution = label.parentNode.__data__.data["contribution"];
    if (tree == 'svg1') {
      var mutation = label.__data__[0];
      var contribution = data[3][mutation]["contribution"];
      if (contribution > 0) {
        return contribution_color;
      }
      else {
        return no_contribution_color;
      }
    }
    else {
      var mutation = label.__data__[0];
      var contribution = data[4][mutation]["contribution"];
      if (contribution > 0) {
        return contribution_color;
      }
      else {
        return no_contribution_color;
      }
    }
  }
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

function formatNumber(number) {
  if (number > 100000 || number < 0.00001) {
    return number.toExponential(3);
  }
  return Math.round(number * 100000) / 100000;
}

/**
 * Sets value of color legend depending on distance evaluation
 *
 * @param {string} multi_tree_prefix:  color legend to edit 
 * @param {float} t_max: the value of the highest contribution in the tree 
 */
function fill_tree_scale_color_legend(multi_tree_prefix = "", t_max, t_min, scale) {
  
  var label1_lst = Array.from(document.getElementsByClassName(`${multi_tree_prefix}_colorLabel1`));
  var label2_lst  = Array.from(document.getElementsByClassName(`${multi_tree_prefix}_colorLabel2`));
  var label3_lst = Array.from(document.getElementsByClassName(`${multi_tree_prefix}_colorLabel3`));
  var label4_lst = Array.from(document.getElementsByClassName(`${multi_tree_prefix}_colorLabel4`));
  
  
  console.log(label1_lst);
  if (t_min) {
    var label1_value = Math.round(t_min * 100) / 100;
    var label2_value = Math.round(((t_max + t_min)/ 3) * 100) / 100;
    var label3_value = Math.round(((t_max + t_min) * 2 / 3) * 100) / 100;
    var label4_value = Math.round(t_max * 100) / 100;
    label1_value = formatNumber(label1_value);
    label2_value = formatNumber(label2_value);
    label3_value = formatNumber(label3_value);
    label4_value = formatNumber(label4_value);
    label1_lst.forEach(label1 => {
      console.log("Label1", label1)
      label1.innerHTML = label1_value;
      console.log("Label1", label1)
    })
    label2_lst.forEach(label2 => {
      label2.innerHTML = label2_value; 
    })
    label3_lst.forEach(label3 => {
      label3.innerHTML = label3_value; 
    })
    label4_lst.forEach(label4 => {
      label4.innerHTML = label4_value; 
    })
    document.querySelectorAll(".legend").forEach(element => {
      console.log("Legend", element);
      element.style.backgroundImage = `linear-gradient(to right, ${scale(t_min)}, ${scale(Number(label2_value))}, ${scale(Number(label3_value))}, ${scale(t_max)})`;
    })
  }
  else {
    var labels = document.querySelectorAll('.label');
    labels.forEach(label => {
      label.innerHTML = Math.round(t_max * 1000000) / 1000000; 
    })
  
  }
}

/**
 * Sets values of the Summary Statistics table 
 *
 * @param {string} tree_name: the tree whose data is being populated
 * @param {integer} max_branching_factor: maximum branching factor of tree_name
 * @param {integer} height: height of tree_name 
 * @param {integer} num_nodes: number of nodes in tree_name 
 * @param {integer} num_mutations: number of mutations in tree_name 
 * @param {string} top_5_mutations: top 5 contributing mutations in tree_name 
 */
function fill_in_table(tree_name = "t1", max_branching_factor, height, num_nodes, num_mutations, top_5_mutations) {
  var height_entry = document.getElementById(`${tree_name}-height`); 
  var max_branching_factor_entry = document.getElementById(`${tree_name}-branching-factor`);
  height_entry.innerHTML = height;
  max_branching_factor_entry.innerHTML = max_branching_factor;
  document.getElementById(`${tree_name}-number-nodes`).innerHTML = num_nodes;
  document.getElementById(`${tree_name}-number-mutations`).innerHTML = num_mutations;

   

    /*updating the contributor title with the appropriate measure*/

    var distance_metric_selector = document.getElementById("distance_metric");
    var distance_metric = distance_metric_selector.value;

    if (distance_metric == "parent_child_distance") {
	document.getElementById('t1-measure-label').innerHTML = "Parent-Child ";
	document.getElementById('t2-measure-label').innerHTML = "Parent-Child ";
    }
    else if (distance_metric == "ancestor_descendant_distance") {
	document.getElementById('t1-measure-label').innerHTML = "Ancestor-Descendant ";
	document.getElementById('t2-measure-label').innerHTML = "Ancestor-Descendant ";
    }
    else if (distance_metric == "caset_distance") {
	document.getElementById('t1-measure-label').innerHTML = "CASet ";
	document.getElementById('t2-measure-label').innerHTML = "CASet ";
    }
    else if (distance_metric == "disc_distance") {
	document.getElementById('t1-measure-label').innerHTML = "DISC ";
	document.getElementById('t2-measure-label').innerHTML = "DISC ";
    }
    else if (distance_metric == "incomparable_pair_recall") {
	document.getElementById('t1-measure-label').innerHTML = "Incomparable-Pair ";
	document.getElementById('t2-measure-label').innerHTML = "Incomparable-Pair ";
    }
    else {
	document.getElementById('t1-measure-label').innerHTML = "Something new!";
	document.getElementById('t2-measure-label').innerHTML = "Something new!";
    }

}


function set_visualization_event_listeners(distance_measure) {
  d3.selectAll(".hover-label").remove();
  var div  = d3.select("body").append("div").classed("hover-label", true);
  switch (distance_measure) {
    case "caset_distance": 
    case "disc_distance": 
    case "ancestor_descendant_distance":
      d3.selectAll("circle.node")
        .on("mouseover", (d, i) => {
          div.html(round_to_thousands(i.data.contribution));
          div.style("opacity", 1); 
          div.style("left", (event.pageX + 10 ) + "px")
             .style("top", (event.pageY + 10) + "px");
        }) // Here is the hover thing
        .on("mouseout", () => {
          div.style("opacity", 0); 
        });
      d3.selectAll("line.link")
        .on("mouseover", null)
        .on("mouseout", null);
      break;
    case "parent_child_distance": 
      d3.selectAll("line.link")
        .on("mouseover", (d, i) => {
          div.html(i.target.data.contribution);
          div.style("opacity", 1); 
          div.style("left", (event.pageX + 10 ) + "px")
             .style("top", (event.pageY + 10) + "px");
        }) // Here is the hover thing
        .on("mouseout", (d, i) => {
          div.style("opacity", 0); 
        });
      d3.selectAll("circle.node")
        .on("mouseover", null)
        .on("mouseout", null);
      break;
    default:
      console.log("Error. Invalid distance measure.");
      break;
  }
}
