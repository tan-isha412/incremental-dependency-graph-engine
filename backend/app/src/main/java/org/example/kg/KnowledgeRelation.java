package org.example.kg;

public class KnowledgeRelation {
    private final String source;
    private final String target;
    private final String relationType; // IMPORTS, EXTENDS, IMPLEMENTS, CALLS, USES, BELONGS_TO

    public KnowledgeRelation(String source, String target, String relationType) {
        this.source = source;
        this.target = target;
        this.relationType = relationType;
    }

    public String getSource() {
        return source;
    }

    public String getTarget() {
        return target;
    }

    public String getRelationType() {
        return relationType;
    }

    @Override
    public String toString() {
        return source + " --[" + relationType + "]--> " + target;
    }
}
