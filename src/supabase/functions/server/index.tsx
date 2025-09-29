import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Initialize categories and skills data
const initializeData = async () => {
  const categories = [
    "Design", "Development", "Marketing", "Video", "Social Media", 
    "Game Art / 3D", "Game Design", "VR Development", "Brand Design", 
    "Content Design", "Art Design", "Media/DTP"
  ];
  
  const skills = [
    "Photoshop", "Illustrator", "InDesign", "After Effects", "Premiere Pro",
    "JavaScript", "React", "HTML/CSS", "Python", "Java", "C++", "Unity",
    "Blender", "Maya", "3ds Max", "Figma", "Sketch", "XD", "Cinema 4D",
    "Social Media Strategy", "Content Creation", "SEO", "Google Analytics",
    "Brand Strategy", "Typography", "UI/UX Design", "Web Design", "Print Design",
    "Video Editing", "Motion Graphics", "Animation", "Sound Design",
    "Game Programming", "Level Design", "Character Design", "Environment Art",
    "VR Development", "AR Development", "Unreal Engine"
  ];

  await kv.set("categories", categories);
  await kv.set("skills", skills);
  
  // Initialize admin system
  const adminUsers = await kv.get("admin_users");
  if (!adminUsers) {
    await kv.set("admin_users", []);
    await kv.set("admin_requests", []);
  }
  
  // Create initial admin user if no admin users exist
  const currentAdminUsers = await kv.get("admin_users") || [];
  console.log("Current admin users count:", currentAdminUsers.length);
  
  if (currentAdminUsers.length === 0) {
    try {
      console.log("Creating initial admin user...");
      
      // Always try to create the user (it will error if exists, which is fine)
      const { data, error } = await supabase.auth.admin.createUser({
        email: "admin@glu.nl",
        password: "admin123!",
        user_metadata: { name: "GLU Administrator" },
        email_confirm: true // Automatically confirm since no email server is configured
      });
      
      if (error && !error.message.includes("already")) {
        console.log("Error creating initial admin in Supabase Auth:", error);
      } else {
        console.log("Initial admin user handled in Supabase Auth");
      }
      
      // Add to admin users in KV store
      const initialAdmin = {
        email: "admin@glu.nl",
        name: "GLU Administrator",
        approved: true,
        approvedAt: new Date().toISOString(),
        approvedBy: "system"
      };
      
      await kv.set("admin_users", [initialAdmin]);
      console.log("Initial admin user added to admin_users KV store");
      
    } catch (error) {
      console.log("Error creating initial admin user:", error);
    }
  } else {
    console.log("Admin users already exist, skipping initial admin creation");
  }
};

initializeData();

// Helper function to verify admin access
const verifyAdmin = async (accessToken: string | null) => {
  if (!accessToken) return null;
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return null;
    
    const adminUsers = await kv.get("admin_users") || [];
    return adminUsers.find((admin: any) => admin.email === user.email && admin.approved);
  } catch (error) {
    console.log("Admin verification error:", error);
    return null;
  }
};

// Health check endpoint
app.get("/make-server-42382a8b/health", (c) => {
  return c.json({ status: "ok" });
});

// Debug endpoint to check admin users (no auth required)
app.get("/make-server-42382a8b/admin/debug", async (c) => {
  try {
    const adminUsers = await kv.get("admin_users") || [];
    console.log("Debug - Admin users:", adminUsers);
    
    // Also check Supabase auth for the admin user
    let authUser = null;
    try {
      const { data: { user }, error } = await supabase.auth.admin.getUserByEmail("admin@glu.nl");
      if (!error && user) {
        authUser = { id: user.id, email: user.email, created_at: user.created_at };
      }
    } catch (authError) {
      console.log("Error checking auth user:", authError);
    }
    
    return c.json({ 
      adminUsers,
      count: adminUsers.length,
      message: "Debug info retrieved",
      expectedAdmin: "admin@glu.nl",
      authUser: authUser
    });
  } catch (error) {
    console.log("Debug endpoint error:", error);
    return c.json({ error: "Debug failed" }, 500);
  }
});

// Force create admin endpoint (for testing)
app.post("/make-server-42382a8b/admin/force-create", async (c) => {
  try {
    console.log("Force creating admin user...");
    
    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: "admin@glu.nl",
      password: "admin123!",
      user_metadata: { name: "GLU Administrator" },
      email_confirm: true
    });
    
    if (error && !error.message.includes("already")) {
      console.log("Error creating admin in Supabase Auth:", error);
    } else {
      console.log("Admin user created/exists in Supabase Auth");
    }
    
    // Add to admin users in KV store
    const adminUsers = await kv.get("admin_users") || [];
    const existingAdmin = adminUsers.find((a: any) => a.email === "admin@glu.nl");
    
    if (!existingAdmin) {
      const initialAdmin = {
        email: "admin@glu.nl",
        name: "GLU Administrator",
        approved: true,
        approvedAt: new Date().toISOString(),
        approvedBy: "system"
      };
      
      adminUsers.push(initialAdmin);
      await kv.set("admin_users", adminUsers);
      console.log("Admin user added to KV store");
    }
    
    return c.json({ 
      message: "Admin user force created",
      adminUsers: await kv.get("admin_users")
    });
  } catch (error) {
    console.log("Force create error:", error);
    return c.json({ error: "Force create failed" }, 500);
  }
});

// Admin login (no auth required)
app.post("/make-server-42382a8b/admin/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;
    console.log("=== ADMIN LOGIN DEBUG ===");
    console.log("Login attempt for email:", email);
    console.log("Password provided:", password ? "YES" : "NO");
    
    if (!email || !password) {
      console.log("Missing email or password");
      return c.json({ error: "Email and password are required" }, 400);
    }
    
    // First check if user exists in Supabase Auth
    try {
      const { data: existingUser, error: getUserError } = await supabase.auth.admin.getUserByEmail(email);
      console.log("User exists in Supabase Auth:", existingUser ? "YES" : "NO");
      if (getUserError) {
        console.log("getUserByEmail error:", getUserError);
      }
      if (existingUser) {
        console.log("User created at:", existingUser.created_at);
      }
    } catch (checkError) {
      console.log("Error checking if user exists:", checkError);
    }
    
    // Try to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });
    
    if (error) {
      console.log("Supabase auth error details:");
      console.log("- Error message:", error.message);
      console.log("- Error status:", error.status);
      console.log("- Full error:", error);
      return c.json({ 
        error: "Invalid credentials", 
        debug: {
          supabaseError: error.message,
          status: error.status
        }
      }, 401);
    }
    
    console.log("Supabase auth successful!");
    console.log("User ID:", data.user?.id);
    console.log("Session exists:", data.session ? "YES" : "NO");
    
    // Check if user is approved admin
    const adminUsers = await kv.get("admin_users") || [];
    console.log("Admin users in KV store count:", adminUsers.length);
    console.log("Admin users:", adminUsers);
    
    const admin = adminUsers.find((admin: any) => admin.email === email && admin.approved);
    console.log("Found matching admin:", admin ? "YES" : "NO");
    
    if (!admin) {
      console.log("Admin not found or not approved for email:", email);
      return c.json({ error: "Admin access not approved" }, 403);
    }
    
    console.log("=== ADMIN LOGIN SUCCESSFUL ===");
    return c.json({ 
      success: true,
      message: "Login successful", 
      access_token: data.session?.access_token,
      user: admin
    });
  } catch (error) {
    console.log("=== ADMIN LOGIN FAILED ===");
    console.log("Login error:", error);
    return c.json({ error: "Login failed", debug: error.message }, 500);
  }
});

// Get all projects with optional filtering
app.get("/make-server-42382a8b/projects", async (c) => {
  try {
    const category = c.req.query("category");
    const skill = c.req.query("skill");
    const urgency = c.req.query("urgency");
    const search = c.req.query("search");
    
    const allProjects = await kv.getByPrefix("project_") || [];
    let filteredProjects = allProjects;
    
    if (category) {
      filteredProjects = filteredProjects.filter((project: any) => 
        project.category === category
      );
    }
    
    if (skill) {
      filteredProjects = filteredProjects.filter((project: any) => 
        project.skills && project.skills.includes(skill)
      );
    }
    
    if (urgency) {
      filteredProjects = filteredProjects.filter((project: any) => 
        project.urgency === urgency
      );
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProjects = filteredProjects.filter((project: any) => 
        project.title.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        project.category.toLowerCase().includes(searchLower) ||
        (project.skills && project.skills.some((s: string) => s.toLowerCase().includes(searchLower)))
      );
    }
    
    // Sort by creation date (newest first)
    filteredProjects.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return c.json(filteredProjects);
  } catch (error) {
    console.log("Error fetching projects:", error);
    return c.json({ error: "Failed to fetch projects" }, 500);
  }
});

// Create new project
app.post("/make-server-42382a8b/projects", async (c) => {
  try {
    const projectData = await c.req.json();
    const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const project = {
      id: projectId,
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(projectId, project);
    return c.json(project);
  } catch (error) {
    console.log("Error creating project:", error);
    return c.json({ error: "Failed to create project" }, 500);
  }
});

// Update project (admin only)
app.put("/make-server-42382a8b/projects/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const admin = await verifyAdmin(accessToken);
    
    if (!admin) {
      return c.json({ error: "Unauthorized - Admin access required" }, 401);
    }
    
    const projectId = c.req.param("id");
    const updates = await c.req.json();
    
    const existingProject = await kv.get(projectId);
    if (!existingProject) {
      return c.json({ error: "Project not found" }, 404);
    }
    
    const updatedProject = {
      ...existingProject,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(projectId, updatedProject);
    return c.json(updatedProject);
  } catch (error) {
    console.log("Error updating project:", error);
    return c.json({ error: "Failed to update project" }, 500);
  }
});

// Delete project (admin only)
app.delete("/make-server-42382a8b/projects/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const admin = await verifyAdmin(accessToken);
    
    if (!admin) {
      return c.json({ error: "Unauthorized - Admin access required" }, 401);
    }
    
    const projectId = c.req.param("id");
    await kv.del(projectId);
    
    return c.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.log("Error deleting project:", error);
    return c.json({ error: "Failed to delete project" }, 500);
  }
});

// Request admin access
app.post("/make-server-42382a8b/admin/request", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true // Automatically confirm since no email server is configured
    });
    
    if (error) {
      console.log("User creation error:", error);
      return c.json({ error: "Failed to create user account" }, 500);
    }
    
    // Add to admin requests
    const adminRequests = await kv.get("admin_requests") || [];
    const requestId = `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const request = {
      id: requestId,
      email,
      name,
      createdAt: new Date().toISOString(),
      approved: false
    };
    
    adminRequests.push(request);
    await kv.set("admin_requests", adminRequests);
    
    return c.json({ message: "Admin access requested successfully" });
  } catch (error) {
    console.log("Admin request error:", error);
    return c.json({ error: "Failed to request admin access" }, 500);
  }
});

// Get admin requests (admin only)
app.get("/make-server-42382a8b/admin/requests", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const admin = await verifyAdmin(accessToken);
    
    if (!admin) {
      return c.json({ error: "Unauthorized - Admin access required" }, 401);
    }
    
    const adminRequests = await kv.get("admin_requests") || [];
    const pendingRequests = adminRequests.filter((req: any) => !req.approved);
    
    return c.json(pendingRequests);
  } catch (error) {
    console.log("Error fetching admin requests:", error);
    return c.json({ error: "Failed to fetch admin requests" }, 500);
  }
});

// Approve admin request (admin only)
app.put("/make-server-42382a8b/admin/requests/:id/approve", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const admin = await verifyAdmin(accessToken);
    
    if (!admin) {
      return c.json({ error: "Unauthorized - Admin access required" }, 401);
    }
    
    const requestId = c.req.param("id");
    const adminRequests = await kv.get("admin_requests") || [];
    const requestIndex = adminRequests.findIndex((req: any) => req.id === requestId);
    
    if (requestIndex === -1) {
      return c.json({ error: "Request not found" }, 404);
    }
    
    const request = adminRequests[requestIndex];
    request.approved = true;
    request.approvedAt = new Date().toISOString();
    request.approvedBy = admin.email;
    
    // Add to admin users
    const adminUsers = await kv.get("admin_users") || [];
    adminUsers.push({
      email: request.email,
      name: request.name,
      approved: true,
      approvedAt: request.approvedAt,
      approvedBy: admin.email
    });
    
    await kv.set("admin_requests", adminRequests);
    await kv.set("admin_users", adminUsers);
    
    return c.json({ message: "Admin request approved successfully" });
  } catch (error) {
    console.log("Error approving admin request:", error);
    return c.json({ error: "Failed to approve admin request" }, 500);
  }
});

// Get categories
app.get("/make-server-42382a8b/categories", async (c) => {
  try {
    const categories = await kv.get("categories") || [];
    return c.json(categories);
  } catch (error) {
    console.log("Error fetching categories:", error);
    return c.json({ error: "Failed to fetch categories" }, 500);
  }
});

// Get skills
app.get("/make-server-42382a8b/skills", async (c) => {
  try {
    const skills = await kv.get("skills") || [];
    return c.json(skills);
  } catch (error) {
    console.log("Error fetching skills:", error);
    return c.json({ error: "Failed to fetch skills" }, 500);
  }
});

Deno.serve(app.fetch);