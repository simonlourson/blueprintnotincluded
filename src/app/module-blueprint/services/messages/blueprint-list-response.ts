// SHARED CODE
export interface BlueprintListResponse
{
  blueprints: BlueprintListItem[];
  oldest: Date;
  remaining: number;
}

export interface BlueprintListItem
{
  id: string;
  name: string;
  ownerName: string;
  ownerId: string;
  tags: string[];
  createdAt: Date;
  modifiedAt: Date;
  thumbnail: string;
  nbLikes: number;
  likedByMe: boolean;
}

export interface BlueprintLike {
  blueprintId: string;
  like: boolean;
}