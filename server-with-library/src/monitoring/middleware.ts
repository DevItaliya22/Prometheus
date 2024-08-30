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

        activeRequestsGauge.dec(); // Decrement the active requests gauge   
    });

    next();
}
