import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
    { id: "hello-world" },
    { event: "test/hello.world" },

    // handler
    async({ event, step }) => {
        console.log("Function Triggered with event: ", event.name);
        console.log("Event Data: ", event.data);

        // Step 1: Greeting:
        const greeting = await step.run("create-greeting", async () => {
            const name = event.data.name || "World";
            const message = `Hello, ${name}! Welcome to Inngest with Express.js!`;

            console.log("CREATED GREETING MESSAGE");

            return message;
        })

        console.log("Waiting for 2 seconds ...")

        await step.sleep("short-delay", "2s");

        // Step 2: Log the greeting
        await step.run("log-completion", async () => {
            console.log("FUNCTION COMPLETED SUCCESSFULLY!");

            return {completed: true};
        })

        return {
            message: greeting,
            timeStamp: new Date().toISOString(),
            eventId: event.id,
        }
    }
)

export const multiStepDemo = inngest.createFunction(
    { id: "multi-step-demo" },
    { event: "demo/multistep" },

    // handler
    async({ event, step }) => {

        // step 1: Fetch Data
        const step1Result = await step.run("fetch-data", async () => {
            console.log("Fetching data...");
            await new Promise((resolve) => setTimeout(resolve, 1000));

            return {
                data: "Important Data",
                userId: event.data.userId
            }
        });

        console.log("STEP 1 COMPLETED: ", step1Result);

        // step 2: Process Data
        const step2Result = await step.run("process-data", async () => {
            console.log("Processing data...");

            return {
                processed: true,
                originalData: step1Result.data,
                processedAt: new Date().toISOString(),
            }
        });

        console.log("STEP 2 COMPLETED: ", step2Result);

        await step.sleep("await-before-final", "3s");

        // step 3: Save Result/Data
        const step3Result = await step.run("save-data", async () => {
            console.log("Saving data...");

            return {
                saved: true,
                location: "database",
            }
        });

        console.log("STEP 3 COMPLETED: ", step3Result);

        return {
            message: "Multi-step workflow completed successfully!",
            result: {
                step1: step1Result,
                step2: step2Result,
                step3: step3Result
            }
        }
    }
)