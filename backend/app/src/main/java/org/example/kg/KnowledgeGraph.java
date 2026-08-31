package org.example.kg;

import java.util.*;

public class KnowledgeGraph {
    private final Map<String, KnowledgeNode> nodes = new HashMap<>();
    private final List<KnowledgeRelation> relations = new ArrayList<>();

    public void addNode(KnowledgeNode node) {
        nodes.put(node.getId(), node);
    }

    public void addRelation(String source, String target, String relationType) {
        relations.add(new KnowledgeRelation(source, target, relationType));
    }

    public Map<String, KnowledgeNode> getNodes() {
        return Collections.unmodifiableMap(nodes);
    }

    public List<KnowledgeRelation> getRelations() {
        return Collections.unmodifiableList(relations);
    }

    public List<KnowledgeRelation> getRelationsForNode(String nodeId) {
        List<KnowledgeRelation> result = new ArrayList<>();
        for (KnowledgeRelation rel : relations) {
            if (rel.getSource().equals(nodeId) || rel.getTarget().equals(nodeId)) {
                result.add(rel);
            }
        }
        return result;
    }

    public void clear() {
        nodes.clear();
        relations.clear();
    }
}
