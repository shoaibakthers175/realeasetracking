import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { connectDB, disconnectDB } from '../src/config/db';
import { User, University, Feature, Release, BugTicket, SanityReport, Lead } from '../src/models';

const app = createApp();

let authToken = '';
let testUniId = '';
let testFeatureId = '';

beforeAll(async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany({}),
    University.deleteMany({}),
    Feature.deleteMany({}),
    Release.deleteMany({}),
  ]);

  // Create test user
  const user = await User.create({
    name: 'Shoaib Ahmed',
    email: 'shoaib@test.com',
    password: 'Password123!',
    role: 'ADMIN',
  });

  // Login
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'shoaib@test.com', password: 'Password123!' });

  authToken = loginRes.body.data.token;
});

afterAll(async () => {
  await disconnectDB();
});

describe('ReleaseTrack Backend API Test Suite', () => {
  it('POST /api/auth/login - should authenticate valid user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'shoaib@test.com', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('shoaib@test.com');
  });

  it('GET /api/auth/me - should return authenticated user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('shoaib@test.com');
  });

  it('POST /api/universities - should create a university (IITKGP)', async () => {
    const res = await request(app)
      .post('/api/universities')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Indian Institute of Technology Kharagpur',
        code: 'IITKGP',
        type: 'STANDALONE',
        productionUrl: 'https://erp.iitkgp.ac.in',
        primaryEnvironment: 'PRODUCTION',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.code).toBe('IITKGP');
    testUniId = res.body.data._id;
  });

  it('POST /api/features - should create a master feature (New Lead Form)', async () => {
    const res = await request(app)
      .post('/api/features')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'New Lead Form',
        code: 'NEW_LEAD_FORM',
        category: 'LEAD_MANAGEMENT',
        description: 'Multi-step lead form',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.code).toBe('NEW_LEAD_FORM');
    testFeatureId = res.body.data._id;
  });

  it('CRITICAL E2E WORKFLOW: Create Release with Bug, Sanity and Lead', async () => {
    const res = await request(app)
      .post('/api/releases')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        university: testUniId,
        feature: testFeatureId,
        title: 'New Lead Form GA',
        releaseType: 'FEATURE',
        environment: 'PRODUCTION',
        releaseDate: new Date().toISOString(),
        releaseTime: '03:45 PM',
        status: 'LIVE',
        deployedBy: 'Shoaib Ahmed',
        bugTickets: [{ ticketId: 'UPG-2345', title: 'Safari form bug', priority: 'HIGH', status: 'RESOLVED' }],
        sanityReport: {
          title: 'IITKGP Sanity Report',
          sanityStatus: 'PASSED',
          totalTestCases: 18,
          passed: 18,
          failed: 0,
        },
        leads: [{ leadId: 'LID-90876', program: 'B.Tech', source: 'Website' }],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('LIVE');
    expect(res.body.data.bugTickets.length).toBe(1);
    expect(res.body.data.sanityReports.length).toBe(1);
    expect(res.body.data.leads.length).toBe(1);

    const releaseId = res.body.data._id;

    // Verify matrix reflects feature is LIVE for IITKGP
    const matrixRes = await request(app)
      .get('/api/features/matrix?environment=PRODUCTION')
      .set('Authorization', `Bearer ${authToken}`);

    expect(matrixRes.status).toBe(200);
    const leadFormFeature = matrixRes.body.data.features.find((f: any) => f.featureCode === 'NEW_LEAD_FORM');
    expect(leadFormFeature).toBeDefined();
    expect(leadFormFeature.universities['IITKGP']).toBe(true);

    // Verify Dashboard returns correct KPIs
    const dashRes = await request(app)
      .get('/api/dashboard?range=this_month')
      .set('Authorization', `Bearer ${authToken}`);

    expect(dashRes.status).toBe(200);
    expect(dashRes.body.data.kpi.totalUniversities.value).toBe(1);
    expect(dashRes.body.data.kpi.liveReleases.value).toBe(1);
    expect(dashRes.body.data.kpi.featuresLive.value).toBe(1);
    expect(dashRes.body.data.kpi.sanityTests.value).toBe(1);
    expect(dashRes.body.data.kpi.testLeads.value).toBe(1);

    // Verify Dynamic Status Rollback: When release is rolled back, feature becomes NOT LIVE
    const rollbackRes = await request(app)
      .patch(`/api/releases/${releaseId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'ROLLED_BACK', rollbackReason: 'Critical issue found' });

    expect(rollbackRes.status).toBe(200);

    const updatedMatrix = await request(app)
      .get('/api/features/matrix?environment=PRODUCTION')
      .set('Authorization', `Bearer ${authToken}`);

    const rolledBackFeature = updatedMatrix.body.data.features.find((f: any) => f.featureCode === 'NEW_LEAD_FORM');
    expect(rolledBackFeature.universities['IITKGP']).toBe(false);
  });

  it('DELETE /api/universities/:id - should deactivate when releases exist without cascade', async () => {
    const res = await request(app)
      .delete(`/api/universities/${testUniId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.deactivated).toBe(true);

    const checkUni = await University.findById(testUniId);
    expect(checkUni?.status).toBe('INACTIVE');
  });

  it('DELETE /api/universities/:id?cascade=true - should permanently delete university and linked data', async () => {
    const res = await request(app)
      .delete(`/api/universities/${testUniId}?cascade=true`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(true);

    const checkUni = await University.findById(testUniId);
    expect(checkUni).toBeNull();

    const checkReleases = await Release.find({ university: testUniId });
    expect(checkReleases.length).toBe(0);
  });
});
