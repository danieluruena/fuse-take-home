export const retryWithBackoff = (options: { maxRetries: number, initialDelayMs: number, shouldRetry?: (error: Error) => boolean }) => {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args: any[]) {
            let attempt = 0;

            while (attempt < options.maxRetries) {
                try {
                    return await originalMethod.apply(this, args);
                } catch (error) {
                    if (attempt === options.maxRetries - 1 || !options.shouldRetry?.(error)) {
                        throw error;
                    }
                    const delay = options.initialDelayMs * Math.pow(2, attempt);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    attempt++;
                }
            }
        };

        return descriptor;
    };
};