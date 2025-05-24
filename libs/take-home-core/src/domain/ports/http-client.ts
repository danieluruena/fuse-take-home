export interface HttpClient {
    get<T>(url: string, options?: { headers?: Record<string, string>, params?: Record<string, string> }): Promise<T>;
    post<T>(url: string, data: any, options?: { headers?: Record<string, string> }): Promise<T>;
    configure(): Promise<void>;
}
