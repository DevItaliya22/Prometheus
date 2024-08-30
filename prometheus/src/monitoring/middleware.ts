import { NextFunction, Request, Response } from "express";
import { requestCounter } from "./requestCount";
import { activeRequestsGauge } from "./activeRequest";
import { httpRequestDurationMicroseconds } from "./histogram";

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    activeRequestsGauge.inc(); // Increment the active requests gauge
    res.on('finish', function() {
        const endTime = Date.now();
        console.log(`Request took ${endTime - startTime}ms`);
    
        // Increment request counter
        requestCounter.inc({
            method: req.method, // GET, POST, PUT, DELETE, etc.
            route: req.route ? req.route.path : req.path, // /users, /users/:id, etc.
            status_code: res.statusCode // 200, 404, 500, etc. , we are using res.on('finish') to get the status code as we only get staus code after the response is sent
        });

        httpRequestDurationMicroseconds.observe({
            method: req.method,
            route: req.route ? req.route.path : req.path,
            code: res.statusCode
        }, endTime - startTime);

        //this is the other way to observe the histogram , here we can see that we are not passing any labels, we are
        //just passing the value of the duration and now it will store logs as how much exact time it took to complete the request
        // this is the worst way to observe the histogram as the req can take 0.11s or 0.12s or 0.13s and it will store all the logs
        // and basically it will store the logs for every request and it will be very difficult to analyze the data
        //  as there will be infinite logs at the end
        // httpRequestDurationMicroseconds.observe({
        //     value : endTime - startTime
        // })

        activeRequestsGauge.dec(); // Decrement the active requests gauge   
    });

    next();
}
