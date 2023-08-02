'''
  Credit to Jeff Ondich for basic flask app
    "A tiny Flask web application, including API, to be used
    as a template for setting up your web app assignment."
'''
import json
import sys
import argparse
import flask
import os
import distance_measures.parent_child as pc_dot
import distance_measures.ancestor_descendant as ad_dot
import distance_measures.caset as cs_dot
import distance_measures.disc as disc_dot
import distance_measures.distance_measure_contribution as dist_meas_cont
import input_conversion.Newick_2_dot as Newick_2_dot

sys.path.append('py_scripts')
sys.path.append('distance_measures')
sys.path.append('input_conversion')
app = flask.Flask(__name__, static_folder='static', template_folder='templates')
# app.register_blueprint(api.api, url_prefix='/api')

# This route delivers the user your site's home page.
@app.route('/')
def home():
    return flask.render_template('visPage_draft2.html')

@app.route('/general_info')
def general_info():
    '''
    This should render the template for information page
        for our input formats and distance measures
    '''
    return flask.render_template('general_info.html')

# This route supports relative links among your web pages, assuming those pages
# are stored in the templates/ directory or one of its descendant directories,
# without requiring you to have specific routes for each page.
@app.route('/<path:path>')
def shared_header_catchall(path):
    return flask.render_template(path)

def write_dot_tree_2_file(dot_tree_str, filename):
  ''' Writes the dot tree string into a file whose name is filename'''
  with open(filename, "w") as f:
    f.write(dot_tree_str)

def calculation_contributions_and_node_mutation_relations(distance_measure, tree1_data, tree2_data):
  """
  Required:
    - The distance_measure selected as a string 
  Returns:
    - JSON object that contains the two trees with their node contributions,
      mutation-to-contribution dictionaries for the two trees,
      and the distance between the trees under the given distance measure
  Note:
    Makes flask requests to get the trees and input format
    Writes trees to t1.txt and t2.txt
    Converts Newick trees to DOT trees
  """

  #tree1_data = Newick_2_dot.convert_newick_2_dot(tree1_data)
  #tree2_data = Newick_2_dot.convert_newick_2_dot(tree2_data)

  tree_1_write_location = "t1.txt"
  tree_2_write_location = "t2.txt"
  write_dot_tree_2_file(tree1_data, tree_1_write_location)
  write_dot_tree_2_file(tree2_data, tree_2_write_location)

  node_contribution_dict_1, node_contribution_dict_2, mutation_contribution_dict_1, mutation_contribution_dict_2, node_mutations_dict_1, node_mutations_dict_2, distance, t1_mutations, t2_mutations, t1_bipartite_edges, t2_bipartite_edges = dist_meas_cont.dist_main(distance_measure, tree_1_write_location, tree_2_write_location)
  #Currently, node_mutations_dict_1 and node_mutations_dict_2 are being calculated but not passed to frontend. There might be a future use for such dictionaries though (line below would pass them along).
  #jsonObject = {"node_contribution_dict_1": node_contribution_dict_1, "node_contribution_dict_2": node_contribution_dict_2, "mutation_contribution_dict_1": mutation_contribution_dict_1, "mutation_contribution_dict_2": mutation_contribution_dict_2, "node_mutations_dict_1":node_mutations_dict_1, "node_mutations_dict_2":node_mutations_dict_2, "distance": distance}
  jsonObject = {"node_contribution_dict_1": node_contribution_dict_1, "node_contribution_dict_2": node_contribution_dict_2, "mutation_contribution_dict_1": mutation_contribution_dict_1, "mutation_contribution_dict_2": mutation_contribution_dict_2, "distance": distance, "t1_mutations": t1_mutations, "t2_mutations": t2_mutations, "t1_tripartite_edges": t1_bipartite_edges, "t2_tripartite_edges": t2_bipartite_edges}
  return(json.dumps(jsonObject))

def formatHandling(distance_measure):
    
    tree1_data = flask.request.args.get('tree1')
    tree2_data = flask.request.args.get('tree2')

    try: #assume DOT format
        return calculation_contributions_and_node_mutation_relations(distance_measure, tree1_data, tree2_data)
  
    except: #try newick format (and convert to DOT)
        try: #assume both trees are newick format
            return calculation_contributions_and_node_mutation_relations(distance_measure, Newick_2_dot.convert_newick_2_dot(tree1_data), Newick_2_dot.convert_newick_2_dot(tree2_data))
    
        except: #try one tree as DOT and one tree as newick
            try: #assume only tree 1 is newick
                return calculation_contributions_and_node_mutation_relations(distance_measure,  Newick_2_dot.convert_newick_2_dot(tree1_data), tree2_data)
      
            except: #last possible combination, otherwise problematic input
                try: #assume only tree 2 is newick
                    return calculation_contributions_and_node_mutation_relations(distance_measure, tree1_data,  Newick_2_dot.convert_newick_2_dot(tree2_data))

                except:
                    raise Exception("problem in the input! :(") from None


@app.route('/api/parent_child_distance')
def run_parent_child_distance():
  """
  Required:
    - N/A 
  Returns:
    - JSON object that contains the two trees with their node contributions,
      mutation-to-contribution dictionaries for the two trees,
      and the distance between the trees under the parent-child distance measure

  Note:
    This url that invokes this route should have
    two GET parameters, one that includes the
    string representing tree1 and the
    string representing tree2 
  """
  
  return formatHandling("parent_child")
  
@app.route('/api/ancestor_descendant_distance')
def run_ancestor_descendant_distance():
  """
  Required:
    - N/A 
  Returns:
    - JSON object that contains the two trees with their node contributions,
      mutation-to-contribution dictionaries for the two trees,
      and the distance between the trees under the ancestor-descendant distance measure

  Note:
    This url that invokes this route should have
    two GET parameters, one that includes the
    string representing tree1 and the
    string representing tree2 
  """
  return formatHandling("ancestor_descendant")

@app.route('/api/caset_distance')
def run_caset_distance():
  """
  Required:
    - N/A 
  Returns:
    - JSON object that contains the two trees with their node contributions,
      mutation-to-contribution dictionaries for the two trees,
      and the distance between the trees under the CASet distance measure

  Note:
    This url that invokes this route should have
    two GET parameters, one that includes the
    string representing tree1 and the
    string representing tree2 
  """
  return formatHandling("caset")

@app.route('/api/disc_distance')
def run_disc_distance():
  """
  Required:
    - N/A 
  Returns:
    - JSON object that contains the two trees with their node contributions,
      mutation-to-contribution dictionaries for the two trees,
      and the distance between the trees under the DISC distance measure

  Note:
    This url that invokes this route should have
    two GET parameters, one that includes the
    string representing tree1 and the
    string representing tree2 
  """
  return formatHandling("disc")

if __name__ == '__main__':
    parser = argparse.ArgumentParser('A tiny Flask application, including API')
    parser.add_argument('host', help='the host on which this application is running')
    parser.add_argument('port', type=int, help='the port on which this application is listening')
    arguments = parser.parse_args()
    app.run(host=arguments.host, port=arguments.port, debug=True)
