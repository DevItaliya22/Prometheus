import client from "prom-client";

export const httpRequestDurationMicroseconds = new client.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'code'],
    // the buckets are used to define the range of the duration ,
    //  like if the duration is between 0.1ms to 5ms then it will be stored in the first bucket
    //  if the duration is between 5ms to 15ms then it will be stored in the second bucket and so on
    // but if u want to store the duration for exact time like 0.11s , 0.12s etc , then i have done it in middleware.ts ,
    //  but thats the worst way as it will store infinite logs as every res can tke diff time
    // and we have to remove the buckets from here if we want to store the logs for exact time
    buckets: [0.1, 5, 15, 50, 100, 300, 500, 1000, 3000, 5000] // Define your own buckets here
});