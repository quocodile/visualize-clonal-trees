"""
Just contains general function to handle retrieving contribution data depending on distance measure selected
"""
import networkx as nx
from networkx.readwrite import json_graph
import distance_measures.utils as utils
import distance_measures.ancestor_descendant as AD
import distance_measures.disc as DISC
import distance_measures.caset as CASet
import distance_measures.parent_child as PC
import os


import distance_measures.incomparable_pair as IP

def dist_main(distance_measure, filename_1, filename_2):
    """
    Required:
        - The distance_measure selected as a string and wo filesnames, each corresponding to a file containing a DOT tree
    Returns:
        - Node-to-contribution, mutation-to-contribution, and node-to-mutation dictionaries
            for both trees under the selected distance measure
    Note:
        This is for use with api.py.
    """

    if os.path.getsize(filename_2) == 0:
      dot1 = nx.nx_pydot.read_dot(filename_1)
      g_1 = nx.DiGraph(dot1)
      node_contribution_dict_1, mutation_contribution_dict_1, node_mutations_dict_1 = utils.initialize_core_dictionaries(g_1)
      node_contribution_tree_1 = json_graph.tree_data(g_1, root=utils.get_root(g_1))
      return (node_contribution_tree_1, None, mutation_contribution_dict_1, None, node_mutations_dict_1, None, 1, [], [], [], [], None, None, None, None)

    dot1 = nx.nx_pydot.read_dot(filename_1)
    dot2 = nx.nx_pydot.read_dot(filename_2)
    g_1 = nx.DiGraph(dot1)
    g_2 = nx.DiGraph(dot2)

    t1_bipartite_edges = [] 
    t2_bipartite_edges = [] 

    t1_mutations = list(utils.get_all_mutations(g_1))
    t2_mutations = list(utils.get_all_mutations(g_2))


    #t1_edges_dict = False
    #t2_edges_dict = False

    up_relationships = {}
    #key is mutation, value is set of parents
    down_relationships = {}
    #key is mutation, value is set of children
    
    
    if distance_measure == "parent_child":
        # constructing the necessary input data for the tripartite graph
        t1_pc_pairs = PC.get_parent_child_pairs(g_1)
        t2_pc_pairs = PC.get_parent_child_pairs(g_2)
        for edge in t1_pc_pairs: 
          t1_bipartite_edges.append({"parent": edge[0], "child": edge[1]})

          #associating each mutation with all of their parents and children

          if (edge not in t2_pc_pairs):
          
              if (edge[1] in up_relationships):
                  up_relationships[edge[1]].add(edge[0])
              else:
                  up_relationships[edge[1]] = {edge[0]}
              if (edge[0] in down_relationships):
                  down_relationships[edge[0]].add(edge[1])
              else:
                  down_relationships[edge[0]] = {edge[1]}
              if (edge[1] not in down_relationships):
                  down_relationships[edge[1]] = set()
              if (edge[0] not in up_relationships):
                  up_relationships[edge[0]] = set()

          
        for edge in t2_pc_pairs: 
          t2_bipartite_edges.append({"parent": edge[0], "child": edge[1]})


          #storing all parents and children of each mutation

          if (edge not in t1_pc_pairs):
          
              if (edge[1] in up_relationships):
                  up_relationships[edge[1]].add(edge[0])
              else:
                  up_relationships[edge[1]] = {edge[0]}
              if (edge[0] in down_relationships):
                  down_relationships[edge[0]].add(edge[1])
              else:
                  down_relationships[edge[0]] = {edge[1]}
              if (edge[1] not in down_relationships):
                  down_relationships[edge[1]] = set()
              if (edge[0] not in up_relationships):
                  up_relationships[edge[0]] = set()



        print(up_relationships)
        print(down_relationships)

          
        # getting the data to color the edges for the main visualization
        calculated_values = PC.get_contributions(g_1,g_2)
    elif distance_measure == "ancestor_descendant":
        print("spice")
        # constructing the necessary input data for the tripartite graph
        t1_ad_pairs = AD.get_anc_desc_pairs(g_1)
        t2_ad_pairs = AD.get_anc_desc_pairs(g_2)
        for edge in t1_ad_pairs: 
          t1_bipartite_edges.append({"ancestor": edge[0], "descendant": edge[1]})


          #storing all ancestors and descendants of each mutation

          if (edge not in t2_ad_pairs):
          
              if (edge[1] in up_relationships):
                  up_relationships[edge[1]].add(edge[0])
              else:
                  up_relationships[edge[1]] = {edge[0]}
              if (edge[0] in down_relationships):
                  down_relationships[edge[0]].add(edge[1])
              else:
                  down_relationships[edge[0]] = {edge[1]}
              if (edge[1] not in down_relationships):
                  down_relationships[edge[1]] = set()
              if (edge[0] not in up_relationships):
                  up_relationships[edge[0]] = set()
              
          
        for edge in t2_ad_pairs: 
          t2_bipartite_edges.append({"ancestor": edge[0], "descendant": edge[1]})

          
          #keeping track of all ancestors and descendants of each mutation

          if (edge not in t1_ad_pairs):
          
              if (edge[1] in up_relationships):
                  up_relationships[edge[1]].add(edge[0])
              else:
                  up_relationships[edge[1]] = {edge[0]}
              if (edge[0] in down_relationships):
                  down_relationships[edge[0]].add(edge[1])
              else:
                  down_relationships[edge[0]] = {edge[1]}
              if (edge[1] not in down_relationships):
                  down_relationships[edge[1]] = set()
              if (edge[0] not in up_relationships):
                  up_relationships[edge[0]] = set()
          
        # getting the data to color the edges for the main visualization
        calculated_values = AD.get_contributions(g_1,g_2)


    elif distance_measure == "incomparable_pair":
        # constructing the necessary input data for the tripartite graph
        
        #t1_ad_pairs = IP.get_anc_desc_pairs(g_1)
        #t2_ad_pairs = IP.get_anc_desc_pairs(g_2)

        this_tuple = IP.get_pair_differences(g_1,g_2)
        t1_ad_pairs = this_tuple[0]
        t2_ad_pairs = this_tuple[1]
        
        for edge in t1_ad_pairs: 
          t1_bipartite_edges.append({"ancestor": edge[0], "descendant": edge[1]})


          #storing all ancestors and descendants of each mutation

          if (edge not in t2_ad_pairs):
          
              if (edge[1] in up_relationships):
                  up_relationships[edge[1]].add(edge[0])
              else:
                  up_relationships[edge[1]] = {edge[0]}
              if (edge[0] in down_relationships):
                  down_relationships[edge[0]].add(edge[1])
              else:
                  down_relationships[edge[0]] = {edge[1]}
              if (edge[1] not in down_relationships):
                  down_relationships[edge[1]] = set()
              if (edge[0] not in up_relationships):
                  up_relationships[edge[0]] = set()
              
          
        for edge in t2_ad_pairs: 
          t2_bipartite_edges.append({"ancestor": edge[0], "descendant": edge[1]})

          
          #keeping track of all ancestors and descendants of each mutation

          if (edge not in t1_ad_pairs):
          
              if (edge[1] in up_relationships):
                  up_relationships[edge[1]].add(edge[0])
              else:
                  up_relationships[edge[1]] = {edge[0]}
              if (edge[0] in down_relationships):
                  down_relationships[edge[0]].add(edge[1])
              else:
                  down_relationships[edge[0]] = {edge[1]}
              if (edge[1] not in down_relationships):
                  down_relationships[edge[1]] = set()
              if (edge[0] not in up_relationships):
                  up_relationships[edge[0]] = set()
          
        # getting the data to color the edges for the main visualization
        calculated_values = IP.get_contributions(g_1,g_2)


        
    elif distance_measure == "caset":
        calculated_values = CASet.get_contributions(g_1,g_2)
    elif distance_measure == "disc":
        calculated_values = DISC.get_contributions(g_1,g_2)
    else:
        print("Not a valid distance measure")
        exit(1)
    print(t1_bipartite_edges)

    print(distance_measure)

    #because js is annoying about mutable objects
    for key in up_relationships:
        up_relationships[key] = tuple(up_relationships[key])
    print("pineapple")
    print(down_relationships)
    for key in down_relationships:
        down_relationships[key] = tuple(down_relationships[key])

 
    node_contribution_dict_1, node_contribution_dict_2, mutation_contribution_dict_1, mutation_contribution_dict_2, node_mutations_dict_1, node_mutations_dict_2, distance, t1_edges_dict, t2_edges_dict = calculated_values

    '''
        print("LOOK HERE")
        print(calculated_values)
        print(len(calculated_values))

        print("again")
        print(t1_edges_dict)
        print(t2_edges_dict)
        
    else:
        node_contribution_dict_1, node_contribution_dict_2, mutation_contribution_dict_1, mutation_contribution_dict_2, node_mutations_dict_1, node_mutations_dict_2, distance = calculated_values
    '''
       
    #Addes node contributions to tree structure
    nx.set_node_attributes(g_1,node_contribution_dict_1)
    nx.set_node_attributes(g_2,node_contribution_dict_2)
    #Gets trees
    node_contribution_tree_1 = json_graph.tree_data(g_1, root=utils.get_root(g_1))
    node_contribution_tree_2 = json_graph.tree_data(g_2, root=utils.get_root(g_2))

    print("get here?")
    print(t1_edges_dict)
    print(t2_edges_dict)
    
    return (node_contribution_tree_1, node_contribution_tree_2, mutation_contribution_dict_1, mutation_contribution_dict_2, node_mutations_dict_1, node_mutations_dict_2, distance, t1_mutations, t2_mutations, t1_bipartite_edges, t2_bipartite_edges, t1_edges_dict, t2_edges_dict, up_relationships, down_relationships)





#ok, so I can add an extra variable to the json
#just need to be able to pass along the edge dictionaries from ad to json
#then can color edgewise!
#almost there.

