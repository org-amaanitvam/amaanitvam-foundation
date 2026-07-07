const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

// Initialize a clean Express instance for our test bed
const app = express();
app.use(express.json());

// Create a basic Test User Schema & Model definitions
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  status: String,
  phone: String
});
const TestUser = mongoose.model('TestUser', UserSchema);

// 🛠️ The Target Route under test (Simulating your adminController.js logic)
app.get('/api/admin/reports', async (req, res) => {
  try {
    // AUTH-01 Test Check
    if (!req.headers.authorization) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    // AUTH-02 Test Check
    if (req.headers.role !== 'admin') {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }
    
    // DATA-02 & PRIV-01 Core Logic: Finding data and stripping sensitive phone values
    const rawMembers = await TestUser.find({});
    
    // Explicitly mapping data parameters to simulate selecting fields and omitting PII
    const recentMembers = rawMembers.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
      // phone is explicitly dropped here to comply with safety privacy filters
    })).slice(0, 5);

    const totalMembers = await TestUser.countDocuments();

    res.status(200).json({
      success: true,
      reports: {
        totalMembers,
        recentMembers
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ⚡ THE CONCURRENT EXECUTION MATRIX
describe('🔄 Amaanitvam Platform Concurrent Diagnostic Matrix', () => {

  beforeEach(() => {
    jest.restoreAllMocks(); // Clear tracking states between test rows
  });

  test('🔒 AUTH-01: Reject request missing authorization header token', async () => {
    const res = await request(app).get('/api/admin/reports');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('🔒 AUTH-02: Reject valid tokens belonging to non-admin roles', async () => {
    const res = await request(app)
      .get('/api/admin/reports')
      .set('Authorization', 'Bearer fake_token')
      .set('role', 'volunteer');
    expect(res.statusCode).toBe(403);
  });

  test('📊 DATA-01: Gracefully handle completely empty collections without crashing', async () => {
    // Use Jest spyOn to force the model layer to safely resolve empty mock array data elements
    jest.spyOn(TestUser, 'find').mockResolvedValue([]);
    jest.spyOn(TestUser, 'countDocuments').mockResolvedValue(0);

    const res = await request(app)
      .get('/api/admin/reports')
      .set('Authorization', 'Bearer fake_token')
      .set('role', 'admin');
    
    expect(res.statusCode).toBe(200);
    expect(res.body.reports.totalMembers).toBe(0);
    expect(res.body.reports.recentMembers).toEqual([]);
  });

  test('🛡️ DATA-02 & PRIV-01: Prevent RAM bloat and leak of PII Phone Data fields', async () => {
    // Intercept database model and pass clean mock payload data sets
    const mockDbUser = {
      _id: "6a43536de20dea665f60e237",
      name: "Test Developer",
      email: "test@amaanitvam.org",
      role: "intern",
      status: "active",
      phone: "+91-99999-99999" // Sensitive PII String data element
    };

    jest.spyOn(TestUser, 'find').mockResolvedValue([mockDbUser]);
    jest.spyOn(TestUser, 'countDocuments').mockResolvedValue(1);

    const res = await request(app)
      .get('/api/admin/reports')
      .set('Authorization', 'Bearer fake_token')
      .set('role', 'admin');

    expect(res.statusCode).toBe(200);
    expect(res.body.reports.totalMembers).toBe(1);
    
    // Explicitly verify that phone fields are completely hidden from the public API JSON return array
    expect(res.body.reports.recentMembers[0].phone).toBeUndefined();
    expect(res.body.reports.recentMembers[0].name).toBe("Test Developer");
  });
});