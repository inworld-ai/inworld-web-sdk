/* eslint-disable */
// @ts-nocheck
/*
* This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
*/

type Absent<T, K extends keyof T> = { [k in Exclude<keyof T, K>]?: undefined };
type OneOf<T> =
  | { [k in keyof T]?: undefined }
  | (
    keyof T extends infer K ?
      (K extends string & keyof T ? { [k in K]: T[K] } & Absent<T, K>
        : never)
    : never);

export enum ItemsInEntitiesOperationType {
  UNSPECIFIED = "UNSPECIFIED",
  ADD = "ADD",
  REMOVE = "REMOVE",
  REPLACE = "REPLACE",
}

export type EntityItem = {
  id?: string
  displayName?: string
  description?: string
  properties?: {[key: string]: string}
}


type BaseItemsOperationEvent = {
}

export type ItemsOperationEvent = BaseItemsOperationEvent
  & OneOf<{ createOrUpdateItems: CreateOrUpdateItemsOperation; removeItems: RemoveItemsOperation; itemsInEntities: ItemsInEntitiesOperation }>

export type CreateOrUpdateItemsOperation = {
  items?: EntityItem[]
  addToEntities?: string[]
}

export type RemoveItemsOperation = {
  itemIds?: string[]
}

export type ItemsInEntitiesOperation = {
  type?: ItemsInEntitiesOperationType
  itemIds?: string[]
  entityNames?: string[]
}