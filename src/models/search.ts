export interface SearchRequest {
  query: string;
  types: string[];
  sort?: SortOptions;
}

export enum SortDirection {
  Ascending = "asc",
  Descending = "desc",
}

export enum SortTimestamp {
  CreatedDate = "created_date",
  LastModifiedDate = "last_modified_date",
  LastOpenedDate = "last_opened_date",
}

export interface SortOptions {
  direction: SortDirection;
  timestamp: SortTimestamp;
}
