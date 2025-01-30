"""
Functions to determine ancestor-descendant pairs in a graph and calculate ancestor-descendant distance between two graphs
and the contributions to that distance on a node and mutation basis.
"""
import networkx as nx
from networkx.readwrite import json_graph
import distance_measures.utils as utils



def get_edges_between_nodes(g):

    all_pairs = get_anc_desc_pairs(g)

    all_mutations = utils.get_all_mutations(g)

    anc_desc_sets = {}

    for mutation in all_mutations:
        #all ancestors are tuples where mutation is pair[1]
        #all descendants is tuples where mutation is pair[0]
        #print(mutation)

        
        ancestors = set()
        descendants = set()
        
        for pair in all_pairs:
            if (pair[0] == mutation):
                descendants.add(pair[1])
            if (pair[1] == mutation):
                ancestors.add(pair[0])

        anc_desc_sets[mutation] = [ancestors, descendants]

        #print(anc_desc_sets)


    pathway_dict = {}

    #print("OVER HEREEEEEEEEEEEEE")

    #print(all_pairs)
    
    for pair in all_pairs:


        if (pair[0] == pair[1]):
            continue

        #print("looping through pair")
        #print(pair[0])
        set1 = anc_desc_sets[pair[0]][0]
        #print(anc_desc_sets[pair[0]][0])
        #print(pair[1])
        set2 = anc_desc_sets[pair[1]][0]
        #print( anc_desc_sets[pair[1]][0])

        set_difference = set1.union(set2) - set1.intersection(set2)

        set_difference.add(pair[0])

        #print("SET DIFFERENCE")
        #print(set_difference)
        #print(len(set_difference))

        if (set_difference == 2):
            #print("PC")
            pathway_dict[pair] = [pair]

        else:
            #print("pathway")

            edges = []
            muts_on_pathway = sorted(set_difference, key=lambda mut: len(anc_desc_sets[mut][0]))
            #print(muts_on_pathway)

            for i in range(len(muts_on_pathway) - 1):

                parent = muts_on_pathway[i]
                child = muts_on_pathway[i+1]


                #TRYING TO DO SAME NODE CHECK
                node_parent = utils.get_node_from_mutation(g,parent)
                node_child = utils.get_node_from_mutation(g,child)
                #print("NODE CHECK")
                #print(node_parent)
                #print(node_child)

                #it's fine for any mut in a node to be the representative for that edge
                #same_node_check = len(anc_desc_sets[parent][0].union(anc_desc_sets[child][0]) -  anc_desc_sets[parent][0].intersection(anc_desc_sets[child][0]))
                same_node_check = (node_parent == node_child)

                if (not same_node_check):
                    #print("same nodes")
                    #print(parent)
                    #print(child)

                    #edges.append((child, parent))

                    edges.append((parent, child))

            pathway_dict[pair] = edges

            #print("EDGES")
            #print(edges)


    print("PATHWAY DICTIONARY")
    print(pathway_dict)

    return pathway_dict
       

def get_contributions(g_1, g_2):

    print("wut now")

    tree1_pathway_dict = get_edges_between_nodes(g_1)
    tree2_pathway_dict = get_edges_between_nodes(g_2)

    pair_differences = get_pair_differences(g_1,g_2)
    ad_distinct_set_1 = pair_differences[0]
    ad_distinct_set_2 = pair_differences[1]

    ad_distance = len(ad_distinct_set_1) + len(ad_distinct_set_2)

    node_contribution_dict_1, mutation_contribution_dict_1, node_mutations_dict_1 = utils.initialize_core_dictionaries(g_1)
    node_contribution_dict_2, mutation_contribution_dict_2, node_mutations_dict_2 = utils.initialize_core_dictionaries(g_2)


    #need to add the count for each edge to the value (so like dict[edge] = [{edges}, count]
    t1_edges_dictionary = {}
    t2_edges_dictionary = {}

    print("GET CONTRIBUTIONS FOR AD")

    #CURRENT STATUS
    #need to figure out how the contributions along the edges are portrayed (which dictionaries do those values come from)
    #make sure that this for loop is calculating the correct contributions
    #see how this does for distinct mutations
    #see how this handles nodes with multiple mutations

    print("CURRENTLY WORKING WITH THIS NEXT CHUNK")
    
    for pair in ad_distinct_set_1:

        print("here is the pair")
        print(pair)
        
        desc_mut = pair[1]
        anc_mut = pair[0]
        desc_node = utils.get_node_from_mutation(g_1,desc_mut)


        print("what could this be?")
        print(mutation_contribution_dict_1)


        if anc_mut in mutation_contribution_dict_1:
            print(anc_mut)
        
            mutation_contribution_dict_1[anc_mut]["contribution"] += 1

            #if desc_mut in mutation_contribution_dict_1:
            #    mutation_contribution_dict_1[desc_mut]["contribution"] += 1

            if pair in tree1_pathway_dict:

                for edge in tree1_pathway_dict[pair]:

                    print(edge)

                    key = utils.get_node_from_mutation(g_1,edge[0]) + utils.get_node_from_mutation(g_1,edge[1])
                
                    if key in t1_edges_dictionary:
                        print("hullo")
                        t1_edges_dictionary[key] += 1
                    else:
                        t1_edges_dictionary[key] = 1
                    
                    #mutation_contribution_dict_1[edge[1]]["contribution"] += 1 
                    #mutation_contribution_dict_1[edge[0]]["contribution"] += 1

            else:
                print("pair not in dictionary")
                print(pair)

        else:
            print("this is a distinct mut I think")

        #node_contribution_dict_1[desc_node]["contribution"] += 1

    print("t1 tree contributions")
    print(mutation_contribution_dict_1)

    print("check here")
    print(ad_distinct_set_2)

    for pair in ad_distinct_set_2:

        print(pair)
        
        desc_mut = pair[1]
        anc_mut = pair[0]
        desc_node = utils.get_node_from_mutation(g_2,desc_mut)


        if anc_mut in mutation_contribution_dict_2:

            mutation_contribution_dict_2[anc_mut]["contribution"] += 1

            #if desc_mut in mutation_contribution_dict_2:
            #    mutation_contribution_dict_2[desc_mut]["contribution"] += 1

            if pair in tree2_pathway_dict:

                for edge in tree2_pathway_dict[pair]:

                    key = utils.get_node_from_mutation(g_2,edge[0]) + utils.get_node_from_mutation(g_2,edge[1])
                
                    if key in t2_edges_dictionary:
                        t2_edges_dictionary[key] += 1
                    else:
                        t2_edges_dictionary[key] = 1
                
                    #mutation_contribution_dict_1[edge[1]]["contribution"] += 1 
                    #mutation_contribution_dict_1[edge[0]]["contribution"] += 1

            else:
                print("pair not in dictionary")
                print(pair)
                
        else:
            print("looks like distinct mut t2")

        #node_contribution_dict_1[desc_node]["contribution"] += 1

    print("t1 tree contributions")
    print(mutation_contribution_dict_1)

    '''
    for pair in ad_distinct_set_2:

        print(pair)
        
        desc_mut = pair[1]
        anc_mut = pair[0]
        desc_node = utils.get_node_from_mutation(g_2,desc_mut)

        mutation_contribution_dict_2[anc_mut]["contribution"] += 1


        print(tree2_pathway_dict[pair])
        for edge in tree2_pathway_dict[pair]:
            print("edge")
            print(edge)
                
            if edge in t2_edges_dictionary:
                t2_edges_dictionary[edge] += 1
            else:
                t2_edges_dictionary[edge] = 1

            print(t2_edges_dictionary)

        #for edge in tree2_pathway_dict[pair]:
            #mutation_contribution_dict_2[edge[1]]["contribution"] += 1 
            #mutation_contribution_dict_2[edge[0]]["contribution"] += 1 

        #node_contribution_dict_2[desc_node]["contribution"] += 1

    '''

    print("t2 tree contributions")
    print(mutation_contribution_dict_2)

    print("edge values t1")
    print(t1_edges_dictionary)
    print("edge values t2")
    print(t2_edges_dictionary)

    xtra1 = t1_edges_dictionary
    xtra2 = t2_edges_dictionary

    #xtra1 = {'BC': 1, 'CD': 2, 'DE': 1}
    #xtra2 = {'FA': 5, 'AB': 3, 'BC': 2, 'CE': 1, 'AD': 1}
        
    print("\n","ad_distance", ad_distance)
    return node_contribution_dict_1, node_contribution_dict_2, mutation_contribution_dict_1, mutation_contribution_dict_2, node_mutations_dict_1, node_mutations_dict_2, ad_distance, xtra1, xtra2

    

def get_pair_differences(g_1,g_2):

    
    """
    Required:
        - Two trees
    Returns:
        - Two lists: one containing the ancestor-descendant pairs in g_1, but not g_2 
            and one containing the ancestor-descendant pairs in g_2, but not g_1
    Note:
        Used in get_contributions()
    """

    print("DOES THIS HAPPEN HERE AND NOW")
    
    ad_pair_set_1 = get_anc_desc_pairs(g_1)
    ad_pair_set_2 = get_anc_desc_pairs(g_2)

    print(ad_pair_set_1)
    print(ad_pair_set_2)

    print("testing testing")

    ad_pair_set_1_ip = set()
    ad_pair_set_2_ip = set()

    print("scopin")

    t1_muts = set()
    t2_muts = set()

    for pair in ad_pair_set_1:
        t1_muts.add(pair[0])
        t1_muts.add(pair[1])
        
        ad_pair_set_1_ip.add((pair[1], pair[0]))
    for pair in ad_pair_set_2:
        t2_muts.add(pair[0])
        t2_muts.add(pair[1])
        
        ad_pair_set_2_ip.add((pair[1], pair[0]))


    print("mutations in eahc tree")
    print(t1_muts)
    print(t2_muts)
    distinct_t1_muts = t1_muts - t2_muts
    print(distinct_t1_muts)
    distinct_t2_muts = t2_muts - t1_muts
    print(distinct_t2_muts)


    # make checklist
    t1_checklist = {}
    t1_included = set()
    for mut in t1_muts:
        t1_checklist[mut] = t1_muts - {mut} - t1_included
        t1_included.add(mut)

    t2_checklist = {}
    t2_included = set()
    for mut in t2_muts:
        t2_checklist[mut] = t2_muts - {mut} - t2_included
        t2_included.add(mut)

    print("CHECKLISTS")
    print(t1_checklist)
    print(t2_checklist)


    print("now finding DL pairs for each tree")
    for pair in ad_pair_set_1 | ad_pair_set_1_ip: # that is a terrible variable name

        if pair[1] in t1_checklist[pair[0]]:
            t1_checklist[pair[0]].remove(pair[1])

    print("t1 DL pairs")
    print(t1_checklist)

    t1_DL_pairs = {key: value for key, value in t1_checklist.items() if value != set()}
    t1_DL = [frozenset([key, value]) for key, values in t1_DL_pairs.items() for value in values]


    for pair in ad_pair_set_2 | ad_pair_set_2_ip: # that is still a terrible variable name

        if pair[1] in t2_checklist[pair[0]]:
            t2_checklist[pair[0]].remove(pair[1])

    print("t2 DL pairs")
    print(t2_checklist)

    t2_DL_pairs = {key: value for key, value in t2_checklist.items() if value != set()}
    t2_DL = [frozenset([key, value]) for key, values in t2_DL_pairs.items() for value in values]



    # OK, so now we have the DL pairs for each tree
    # this will be where the representation choices come in
    # we basically want to identify if there is an AD pair on the other tree with one of these DL pairs

    print("t1 DL")
    print(t1_DL)
    print("t2 DL")
    print(t2_DL)

    t1_DL_unique = set(t1_DL) - set(t2_DL)
    print(t1_DL_unique)
    t2_DL_unique = set(t2_DL) - set(t1_DL)
    print(t2_DL_unique)


    # So now we have the DL pairs unique to each tree
    # convert back from frozensets
    ADs_for_t1 = {tuple(fs) for fs in t2_DL_unique}
    ADs_for_t2 = {tuple(fs) for fs in t1_DL_unique}
    # but right now these might be in the wrong order for how the edge appears!

    ADs_in_t1 = set()
    for AD in ADs_for_t1:
        if AD in ad_pair_set_1:
            ADs_in_t1.add(AD)
        elif (AD[1], AD[0]) in ad_pair_set_1:
            ADs_in_t1.add((AD[1], AD[0]))
        else:
            ADs_in_t1.add(AD)
             

    print("ADs in t1!!!")
    print(ADs_in_t1)

    
    ADs_in_t2 = set()
    '''
    for AD in ADs_for_t2:
        if AD not in ad_pair_set_2:
            if (AD[1], AD[0]) in ad_pair_set_2:
                ADs_in_t2.add((AD[1], AD[0]))
        else:
            ADs_in_t2.add(AD)
    '''
    for AD in ADs_for_t2:
        if AD in ad_pair_set_2:
            ADs_in_t2.add(AD)
        elif (AD[1], AD[0]) in ad_pair_set_2:
            ADs_in_t2.add((AD[1], AD[0]))
        else:
            ADs_in_t2.add(AD)

    print("ADs in t2!!!")
    print(ADs_in_t2)

    return ADs_in_t1, ADs_in_t2

    

   
       

    

    

    

    

    #USED TO BE THIS, COME BACK HERE
    '''
    print(ad_pair_set_1_ip)
    print(ad_pair_set_2_ip)
        
    diff1 = ad_pair_set_1 - ad_pair_set_2
    new_diff1 = diff1 - ad_pair_set_2_ip

    diff2 = ad_pair_set_2 - ad_pair_set_1
    new_diff2 = diff2 - ad_pair_set_1_ip

    ad_distinct_set_1 = set()
    ad_distinct_set_2 = set()

    print("guava")

    print(diff1)
    print(diff2)

    print(new_diff1)
    print(new_diff2)
    '''


    ##############



    # not sure what this was
    '''
    for pair in diff1:
        if (pair[1], pair[0]) in diff1_ip:
            ad_distinct_set_1.add(pair)

    print(ad_distinct_set_1)

    for pair in diff2:
        if (pair[1], pair[0]) in diff2_ip:
            ad_distinct_set_2.add(pair)

    print(ad_distinct_set_2)
    '''
            
        

    
    #ad_distinct_set_1 = ad_pair_set_1 - ad_pair_set_2
    #ad_distinct_set_2 = ad_pair_set_2 - ad_pair_set_1

    #COME BACK TO THE RETURN STATEMENT
    #print("WHAT THE RETURN SHOULD LOOK LIKE")
    #print(new_diff1)
    #print(new_diff2)
    #return new_diff1, new_diff2
    
    #return ad_distinct_set_1, ad_distinct_set_2

def get_anc_desc_pairs(g):
    """
    Required:
        - A tree
    Returns:
        - A list of the ancestor-descendant pairs (ancestor, descendant) in the tree
    Note:
        Used in get_contributions() .
    """
    
    node_anc_dict = {}
    root = utils.get_root(g)
    node_anc_dict[root] = {root}
    # adds key-value pairs to dictionary
    mutation_anc_dict = utils.fill_mutation_dict(g,root,node_anc_dict)
    # uses node_anc_dict to find ancestor-descendant pairs
    anc_desc_pairs = set()
    for desc in mutation_anc_dict:
        anc_list = mutation_anc_dict[desc]
        for anc in anc_list:
            anc_desc_pairs.add((anc, desc))
                    
            
            
    return anc_desc_pairs


