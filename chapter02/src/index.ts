import express from "express";
import { inngest } from "./inngest/client";
import { serve } from "inngest/express";

// import functions
import { helloWorld, multiStepDemo } from "./inngest/functions";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "4mb" }));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
})

// middleware for starting inngest server...
app.use("/api/inngest", serve({ 
    client: inngest, 
    functions: [
        helloWorld, multiStepDemo
    ]
}));

app.get("/health", (req, res) => {
    res.json(
    {
        status: "ok",
        message: "Express + Inngest server is running!",
        endpoint: {
            inngest: "/api/inngest",
            test: "/test",
            testmulti: "/test-multi"
        }
    }
    )
});

// ----------------------------- ENDPOINTS -----------------------------
app.post("/test", async(req, res) => {
    try {
        console.log("Sending test event");
        const { ids } = await inngest.send({
            name: "test/hello.world",
            data: {
                name: req.body.name || "World",
                timeStamp: new Date().toISOString(),
            }
        })

        console.log("Event sent with ID: ", ids[0]);

        res.json({
            message: "Event sent successfully",
            eventId: ids[0],
            tip: "Check the Inngest Dev UI at http://localhost:8288 to see the function execution details."
        })
    } catch (error) {
        console.error("Error sending event");
        res.status(500).json({
            details: error instanceof Error ? error.message : "Unknown error",
        })
    }
});

app.post("/test-multi", async(req, res) => {
    try {
        console.log("Sending Multi Part demo event");
        const { ids } = await inngest.send({
            name: "demo/multistep",
            data: {
                userId: req.body.userId || "user_12345",
                action: "demo"
            }
        });

        console.log("Event sent with ID: ", ids[0]);

        res.json({
            message: "Multi Step Event sent successfully",
            eventId: ids[0],
            tip: "Check the Inngest Dev UI at http://localhost:8288 to see the function execution details."
        })
    } catch (error) {
        console.error("Error sending event");
        res.status(500).json({
            details: error instanceof Error ? error.message : "Unknown error",
        })
    }
});

app.listen(PORT, () => {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 Express + Inngest Server started");
  console.log("=".repeat(60));
  console.log(`SERVER: http://localhost:${PORT}`);
  console.log(`INNGEST ENDPOINT: http://localhost:${PORT}/api/inngest`);
  console.log(`INNGEST DEV UI: http://localhost:8288`);
  console.log("=".repeat(60));
  console.log("\n");
});