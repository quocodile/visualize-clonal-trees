var tree1TextArea = document.querySelector("#tree1-text");
var tree2TextArea = document.querySelector("#tree2-text");
 
var inputTypeTree1 = document.getElementById("input-type-tree1");
var inputTypeTree2 = document.getElementById("input-type-tree2");
var submitTreesBtn = document.getElementById("submit-trees-btn");
var distanceMetric = document.getElementById("distance_metric");
var demoTreesBtn = document.getElementById("demo-trees-btn");
var distanceMeasureLabel = document.getElementById("distance-measure-label");
var coloring = ['#f0f172', '#80bda5', '#4180a9', '#00429d'];
var no_contribution_color = "black";
var contribution_color = "#DD6503";
var highlight_color = "red";
var mutation_table_color = "black";

window.onload = () => {
  submit_tree();
}

function visualize_singleview(jsonData, distance_measure, dom_data) {
  var tree1_data = jsonData.node_contribution_dict_1;
  var tree2_data = jsonData.node_contribution_dict_2;
  var data = [tree1_data, tree2_data]

  var svg1 = d3.select('#svg1');
  svg1.call(d3.zoom()
    .extent([[-700, -700], [700, 700]])
    .scaleExtent([1, 20])
    .on('zoom', zoomed)
  ); 

  function zoomed({transform}) {
    var svg1_nodes =  d3.select('#svg1 g.nodes')
    var svg1_links =  d3.select('#svg1 g.links')
    svg1_nodes
      .attr("transform", transform);  
    svg1_links
      .attr("transform", transform);
  };

  var svg2 = d3.select('#svg2');
  svg2.call(d3.zoom()
    .extent([[-700, -700], [700, 700]])
    .scaleExtent([1, 20])
    .on('zoom', zoomed2)
  ); 

  function zoomed2({transform}) {
    var svg1_nodes =  d3.select('#svg2 g.nodes')
    var svg1_links =  d3.select('#svg2 g.links')
    svg1_nodes
      .attr("transform", transform);  
    svg1_links
      .attr("transform", transform);
  };

  var svg_names = ['svg1', 'svg2'];
  for (var i = 0; i < 2; i++) {
    var root = d3.hierarchy(data[i]);
    var tree = d3.tree()
    if (root.height > 5) {
      tree.nodeSize([70, 25]);
    }
    else {
      tree.nodeSize([90, 80]);
    }
    tree.separation((a, b) => 1);
    tree(root);
    var d3_nodes = d3.select('#' + svg_names[i] +  ' g.nodes')
    var d3_links = d3.select('#' + svg_names[i] +  ' g.links') 

    // Setting shared attributes for the links 
    d3_links.selectAll('line.link')
      .data(root.links())
      .join('line')
      .classed('link', true)
      .attr('stroke', 'black')
      .style("transform", "translate(5, 20), scale(0.5)") 
      .attr('x1', d =>  { console.log("poop"); return d.source.x;})
      .attr('y1', d => { return d.source.y;})
      .attr('x2', d => { return d.target.x;})
      .attr('y2', d => { return d.target.y;});

    // Set shared attributes for the nodes 
    d3_nodes.selectAll("circle.node")
      .data(root.descendants())
      .join('circle')
      .classed('node', true)
      .style("transform", "translate(5, 20), scale(0.5)")
      .style("stroke-width", "1px")
      .attr('cx', (d) => {return d.x;})
      .attr('cy', function(d) {return d.y;})
      .attr('r', function(d) {
        if (distance_measure == "parent_child_distance") {
          return 6;
        }
        return 10;
      })
    
  }
}

// Coloring scheme for DIST, CASet, and ancestor descendant -> node based
function node_colored_tree(d3_nodes, d3_links, t_max, t_min, scale, t1_only_mutations, t2_only_mutations) {
    
  d3_nodes.selectAll('circle.node')
	.style("stroke",d => {
      if (t1_only_mutations.some(mut => d.data.id.split("_").includes(mut)) || t2_only_mutations.some(mut => d.data.id.split("_").includes(mut))) { //outline tree-distinct mutations in red
        return "red";
      }

	
      else if (d.data.contribution > 0) {
        return "black";
      }
      else {
        return "gray";
      }
    })
    .style("fill", function(d) {
      if (d.data.contribution === 0) {
        return "lightgray";
      }
      else {
        return scale(d.data.contribution);
      }
    })

    d3_links.selectAll('line.link').style("stroke", "black");
}

// Coloring scheme for parent child -> edge based
function edge_colored_tree(d3_nodes, d3_links, t_max, t_min, scale, t1_only_mutations, t2_only_mutations) {
    d3_nodes.selectAll('circle.node').style("stroke", d => {
	if (t1_only_mutations.some(mut => d.data.id.split("_").includes(mut)) || t2_only_mutations.some(mut => d.data.id.split("_").includes(mut))) { //outline tree-distinct mutations in red
	    return "red";
	}
	else {
	    return "black";
	}
    }).style("fill", "#e6e6e3")

  d3_links.selectAll('line.link')
      .style("stroke", function(d) {
        if (d.target.data.contribution == 0) {
          return "lightgray";
        }
        else {
          return scale(d.target.data.contribution);
        }
      })
      .style("transform", "translate(5, 20), scale(0.5)")
}

function submit_tree() {
  console.log("Submitted tree.")
  /*
    Send trees to api in order to get
    data for input into d3 visualizations
  */
  var tree1Input = tree1TextArea.value;
  var tree2Input = tree2TextArea.value;


  var baseURL = get_API_base_URL();
  var url = baseURL + distanceMetric.value + "?";
  var url_components = [url, "tree1=", tree1Input, "&tree2=", tree2Input, "&treeType1=", "dot", "&treeType2=", "dot"]
  url = url_components.join("");

  fetch(url)
  .then(response => response.json())
  .then(json_data => {
     visualize("single", null, null, json_data, distanceMetric.value, null);
  });
}

function visualize(viewtype, svg1, svg2, json_data, distance_measure, scale) {

  var tree1_data = json_data.node_contribution_dict_1;
  var tree2_data = json_data.node_contribution_dict_2;
  var data = [tree1_data, tree2_data]
  var distance = json_data.distance;

  var t1_nodes = d3.hierarchy(tree1_data).descendants();
  var t1_mutations = getAllMutations(t1_nodes);
  var t1_label = document.getElementById("tree1-mutations");

  var t2_nodes = d3.hierarchy(tree2_data).descendants();
  var t2_mutations = getAllMutations(t2_nodes);
  var t2_label = document.getElementById("tree2-mutations");
  
  var shared_label = document.getElementById("shared-mutations");

  var shared_mutations = intersect(t1_mutations, t2_mutations);
  var t1_only_mutations = difference(t1_mutations, shared_mutations);
  var t2_only_mutations = difference(t2_mutations, shared_mutations);

  var dom_data = {
    t1_nodes,
    t1_mutations,
    t1_label,
    
    t2_nodes,
    t2_mutations, 
    t2_label,

    shared_label,
    shared_mutations,
    t1_only_mutations,
    t2_only_mutations
  }

  visualize_singleview(json_data, distance_measure, dom_data);
}

function getAllMutations(nodes) {
  var all_mutations = [];
  nodes.forEach(node => {
    var label = node.data.label;
    var mutations = label.split(",");
    mutations.forEach(mutation => {
      all_mutations.push(remove_quotation(mutation.trim()));
    });
  });  
  return all_mutations;
}

function singleView(dom_data) {

  multiview_elements = document.querySelectorAll(".multiview"); 
  multiview_elements.forEach(element => {
    element.style.display = "none";
  });

  dom_data.top_five.style.display = "";
  dom_data.div.style.display = "flex";
  dom_data.legend.style.display = "block";

  var dropdown_visible = (dom_data.distance_dropdown.style.display === "inline-block");
  dom_data.distance_dropdown.style.display = dropdown_visible? "none": "inline-block";
  dom_data.distance_btns.style.display = "none";
  dom_data.multiview_btn.style.background = "#2C7A7A";
  dom_data.multiview_btn.style.color = "#F5F5F5";
  dom_data.singleview_btn.style.background = dropdown_visible? 
                                               "#2C7A7A": 
                                               dom_data.singleview_btn.style.background;
  dom_data.singleview_btn.style.color = dropdown_visible? 
                                               "#F5F5F5": 
                                               dom_data.singleview_btn.style.color;
}

