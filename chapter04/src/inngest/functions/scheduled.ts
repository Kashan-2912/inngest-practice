import { inngest } from "../client";

export const dailySalesReport = inngest.createFunction(
    { id: "daily-sales-report", name: "Daily Sales Report" },

    // * * * * * (first -> min, second -> hr, third -> day of month, fourth -> month, fifth -> day of week)

    // sales report coming every day at 9AM
    { cron: "TZ=America/New_York 0 9 * * *" },

    // handler (since cron jobs have no data that comes up, so only step)
    async({ step }) => {
        console.log("Daily report sent!");
    }
)

export const abandonedCartRecovery = inngest.createFunction(
    { id: "abandoned-cart-report", name: "Abandoned Cart Report" },

    // run every 2 hr -> */2
    { cron: "0 */2 * * *" },

    // handler
    async({ step }) => {
        console.log("Report sent!");
    }
)