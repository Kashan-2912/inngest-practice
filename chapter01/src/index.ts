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

export const functions = [
    helloFunction
];