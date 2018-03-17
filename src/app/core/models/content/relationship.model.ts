export class ContentRelationship {
    constructor(relationshipId: string, entityId: string, displayName: string) {
        this.relationshipId = relationshipId;
        this.entityId = entityId;
        this.displayName = displayName;
    }
    relationshipId: string;
    entityId: string;
    displayName: string;
}