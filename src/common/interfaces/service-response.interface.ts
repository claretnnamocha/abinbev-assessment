export interface ServiceResponse {
  statusCode: number;
  message: string[];
  data?: any;
  error?: any;
  metadata?: any;
}
