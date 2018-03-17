export interface IEntity {
    entityId: string;
    type: string;
    status: string;
}

export interface IResult {
    data: any | any[]
}

export interface IEntityResult extends IEntity, IResult {}

export class IContentRequest {
    editingSession: string;
    editingOrder: number;
}

export class EntityRequest implements IContentRequest, IEntityResult {
    constructor(session?: string, order?: number, type?: string) {
        this.entityId = '';
        this.type = type;

        this.editingSession = session;
        this.editingOrder = order;
    }

    entityId: string;
    status: string;
    editingSession: string;
    editingOrder: number;
    type: string;

    data: any;
}

export class RelationshipRequest implements IContentRequest {
    constructor(session: string, order: number, type: string, fromId: string, toId: string) {
        this.editingSession = session;
        this.editingOrder = order;
        this.type = type;

        this.fromId = fromId;
        this.toId = toId;
    }
    editingSession: string;
    editingOrder: number;
    type: string;

    fromId: string;
    toId: string;
    properties: any;
}

export class UpdateRelationshipRequest implements IContentRequest {
    constructor(session: string, order: number) {
        this.editingSession  = session;
        this.editingOrder = order;
    }
    editingSession: string;
    editingOrder: number;

    deletedRelationships: string[];
    addedRelationships: any[]
}