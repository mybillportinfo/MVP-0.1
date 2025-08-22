import type { Express } from "express";

export function registerAdminRoutes(app: Express) {
  // Already added in main routes.ts - placeholder for additional admin endpoints
  
  // System status endpoint
  app.get("/admin/status", (req, res) => {
    const uptime = process.uptime();
    const memUsage = process.memoryUsage();
    
    res.json({
      status: "healthy",
      uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
      memory: {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
      },
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString()
    });
  });

  // Environment variables check (safe - no values exposed)
  app.get("/admin/env-check", (req, res) => {
    const requiredVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_PROJECT_ID', 
      'VITE_FIREBASE_APP_ID',
      'FIREBASE_SERVICE_ACCOUNT_KEY',
      'PLAID_CLIENT_ID',
      'PLAID_SECRET',
      'STRIPE_SECRET_KEY',
      'MAILERSEND_API_KEY',
      'FROM_EMAIL',
      'TEST_EMAIL'
    ];

    const envStatus = requiredVars.reduce((acc, varName) => {
      acc[varName] = {
        present: !!process.env[varName],
        length: process.env[varName]?.length || 0
      };
      return acc;
    }, {} as Record<string, { present: boolean; length: number }>);

    res.json({
      message: "Environment variables status check",
      variables: envStatus,
      timestamp: new Date().toISOString()
    });
  });
}