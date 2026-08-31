package org.example.kg;

public class KnowledgeNode {
    private final String id;
    private final String type; // CLASS, INTERFACE, METHOD, PACKAGE
    private final String packageName;

    public KnowledgeNode(String id, String type, String packageName) {
        this.id = id;
        this.type = type != null ? type : "CLASS";
        this.packageName = packageName != null ? packageName : "default";
    }

    public String getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public String getPackageName() {
        return packageName;
    }

    @Override
    public String toString() {
        return "KnowledgeNode{" +
                "id='" + id + '\'' +
                ", type='" + type + '\'' +
                ", packageName='" + packageName + '\'' +
                '}';
    }
}
