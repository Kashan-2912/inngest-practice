import express from "express";
import { serve } from "inngest/express";
import { inngest } from "./inngest/client";

import {
  sendWelcomeEmail,
  setupUserPreferences,
  trackSignupAnalytics,
} from "./inngest/functions/user-signup";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "4mb" }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
});

app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [sendWelcomeEmail, setupUserPreferences, trackSignupAnalytics],
  })
);

interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  plan: "free" | "pro" | "enterprise";
  createdAt: string;
}

const users: User[] = [];

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "healthy",
    message: "User Signup System with Inngest",
    endpoints: {
      signup: "POST /api/signup",
      users: "GET /api/users",
      inngest: "/api/inngest",
    },
    stats: {
      totalUsers: users.length,
      usersByPlan: {
        free: users.filter((u) => u.plan === "free").length,
        pro: users.filter((u) => u.plan === "pro").length,
        enterprise: users.filter((u) => u.plan === "enterprise").length,
      },
    },
  });
});

// -------------------------------- ENDPOINTS --------------------------------
app.post("/api/signup", async (req, res) => {
  try {
    const { email, name, password, plan = "free" } = req.body;

    // validation
    if (!["free", "pro", "enterprise"].includes(plan)) {
      return res.status(400).json({
        error: "Invalid plan selected",
        validPlans: ["free", "pro", "enterprise"],
      });
    }

    // check if user exists
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return res.status(409).json({
        error: "User already exists",
        userId: existingUser.id,
      });
    }

    // create new user
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      email,
      name,
      password: "***",
      plan,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    const user: User = {
      id: crypto.randomUUID(),
      email,
      name,
      password,
      plan,
      createdAt: new Date().toISOString(),
    };

    users.push(user);

    console.log(`User created: ${newUser.id} ${newUser.email}`);

    const { ids } = await inngest.send({
      name: "user/signup.completed",
      data: {
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name,
        plan: newUser.plan,
        signupDate: newUser.createdAt,
      },
    });

    res.status(201).json({
      success: true,
      message: "User signed up successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        plan: newUser.plan,
        createdAt: newUser.createdAt,
      },
      eventId: ids[0],
      tip: "Check http://localhost:8288 to see Inngest Dev UI"
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
