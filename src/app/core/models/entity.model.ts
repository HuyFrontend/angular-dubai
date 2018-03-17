export type EntityStatus = 'draft' | 'pending' | 'active' | 'live' | 'ready';

export interface IEntity {
    entityId: string;
    status: EntityStatus;
    publishedDate: any;
    title: string;
}