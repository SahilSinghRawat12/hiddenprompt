import express from "express";

const app = express();

app.use(express.json());

app.get("/" , (_, res) => {
    console.log("Backend is running");
});

export default app;