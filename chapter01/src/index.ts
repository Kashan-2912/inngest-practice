import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "chapter-01" });

const helloFunction = inngest.createFunction(
    { id: "hello-world" },

    // what event should trigger this function?
    { event: "test/hello" },

    // handler
    async ({ event, step }) => {
        console.log("Hello from Inngest");
        console.log("Event received:", event.name);
        console.log("Event data:", event.data);

        // await step.sleep("wait-a-moment", "1s");

        return { 
            message: `Hello, ${event.data.name}!` || "Hello, World!",
            recievedAt: new Date().toISOString()
        };
    }
)

console.log("FUNCTION CREATED: ", helloFunction.id());

// multi-step function
const multiStepFunction = inngest.createFunction(
    { id: "multi-step-demo" },
    { event: "demo/multi-step" },

    // handle
    async ({ event, step}) => {
        // step - 01: First task...
        const result1 = await step.run("step-1", async () => {
            console.log("Ececuting Step-01 ...")
            return { data: "Result from Step-01" };
        });

        console.log("STEP-01 Completed", result1);

        // step - 02: Sleep for 5s...
        await step.sleep("await-a-bit", "5s");
        console.log("STEP-02 Completed");

        // step - 03: Another task...
        const result2 = await step.run("step-2", async () => {
            console.log("Ececuting Step-02 ...")

            // every current step has access to previous step results
            return { data: "Result from Step-02", previous: result1 };
        });

        console.log("STEP-02 Completed", result2);

        return {
            message: "Multi-step workflow completed",
            results: [result1, result2]
        }
    }
)

console.log("MULTISTEP FUNCTION CREATED: ", multiStepFunction.id());

export const functions = [
    helloFunction
];