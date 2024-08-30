import express from "express";
import client from "prom-client";
import { metricsMiddleware } from "./monitoring/middleware";

const app = express();

app.use(metricsMiddleware); // this middleware will increment the request counter , gauge , histograms

app.get("/metrics", async (req, res) => {
    const metrics = await client.register.metrics();
    res.set('Content-Type', client.register.contentType);
    res.end(metrics);
})

//this is a dummy route to simulate a delay in the response , means we can get active req as we can see gauge`s value is increasing
app.get("/user", async (req, res) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    res.send({
        name: "John Doe",
        age: 25,
    });
});

app.get("/",(req,res)=>{
    res.send("Hello World");
})

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});