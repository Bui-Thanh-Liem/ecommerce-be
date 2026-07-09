export interface CloudinaryDestroyResponse {
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  result: 'ok' | 'not_found' | string;
}

export interface CloudinaryDeleteResourcesResponse {
  deleted: Record<string, 'deleted' | 'not_found'>;
  partial: boolean;
}
