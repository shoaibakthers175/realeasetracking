import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import {
  User,
  University,
  Feature,
  Release,
  BugTicket,
  SanityReport,
  Lead,
  AuditLog,
  Notification,
} from '../models';

export const seedDatabase = async () => {
  console.log('[Seed] Starting database seed...');

  // Clean collections
  await Promise.all([
    User.deleteMany({}),
    University.deleteMany({}),
    Feature.deleteMany({}),
    Release.deleteMany({}),
    BugTicket.deleteMany({}),
    SanityReport.deleteMany({}),
    Lead.deleteMany({}),
    AuditLog.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  // 1. Create Users
  const users = await User.create([
    {
      name: 'Shoaib Ahmed',
      email: 'shoaib@releasetrack.com',
      password: 'Password123!',
      role: 'QA_ENGINEER',
      department: 'QA Automation & Releases',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    {
      name: 'Priya Sharma',
      email: 'priya@releasetrack.com',
      password: 'Password123!',
      role: 'QA_LEAD',
      department: 'Quality Assurance',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
    {
      name: 'DevOps Admin',
      email: 'admin@releasetrack.com',
      password: 'Password123!',
      role: 'ADMIN',
      department: 'Engineering Operations',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    {
      name: 'Alex Mercer',
      email: 'alex@releasetrack.com',
      password: 'Password123!',
      role: 'VIEWER',
      department: 'Product Management',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  ]);

  const defaultUser = users[0];
  console.log(`[Seed] Seeded ${users.length} users`);

  // 2. Create 19 Universities
  const universityData = [
    { name: 'Dr. D.Y. Patil Vidyapeeth', code: 'DYP', type: 'STANDALONE', primaryEnvironment: 'PRODUCTION', productionUrl: 'https://v2.dypatiledu.com/sign-in', location: 'Pune, MH', notes: '' },
    { name: 'Atlas SkillTech University', code: 'ATLAS', type: 'MULTI_TENANT', primaryEnvironment: 'PRODUCTION', productionUrl: 'https://v2.atlasonline.edu.in/sign-in', location: 'Mumbai, MH', notes: 'Microsites' },
    { name: 'Online Atlas', code: 'ONLINEATLAS', type: 'MULTI_TENANT', primaryEnvironment: 'PRODUCTION', productionUrl: 'https://www.onlineatlas.in/sign-in', location: 'Mumbai, MH', notes: 'Microsites' },
    { name: 'Central University of Tamil Nadu', code: 'CUTN', type: 'STANDALONE', primaryEnvironment: 'PRODUCTION', productionUrl: 'https://www.cutnonline.in/sign-in', location: 'Thiruvarur, TN', notes: 'Different Pipelines' },
    { name: 'Indian Institute of Management Bangalore', code: 'IIMB', type: 'STANDALONE', primaryEnvironment: 'PRODUCTION', productionUrl: 'https://online.iimbx.edu.in/sign-in', location: 'Bangalore, KA', notes: 'Different Pipelines' },
    { name: 'Vels Institute of Science, Technology & Advanced Studies', code: 'VISTAS', type: 'STANDALONE', primaryEnvironment: 'PRODUCTION', productionUrl: 'https://www.vistasonlineedu.in/sign-in', location: 'Chennai, TN', notes: '' },
    { name: 'Chandigarh University', code: 'CU', type: 'STANDALONE', primaryEnvironment: 'PRODUCTION', productionUrl: 'https://www.cuonlineedu.in/admin', location: 'Mohali, PB', notes: '' },
    { name: 'Kurukshetra University', code: 'KUK', type: 'STANDALONE', primaryEnvironment: 'PRODUCTION', productionUrl: '', location: 'Kurukshetra, HR', notes: '' },
    { name: 'Bharathidasan University', code: 'BDU', type: 'STANDALONE', primaryEnvironment: 'PRODUCTION', productionUrl: '', location: 'Tiruchirappalli, TN', notes: '' },
    { name: 'YourDegree', code: 'YD', type: 'STANDALONE', primaryEnvironment: 'PRODUCTION', productionUrl: 'https://cms-infinity.yourdegree.com', location: 'Delhi, DL', notes: '' },
    { name: 'Alliance University', code: 'ALLIANCE', type: 'MULTI_TENANT', primaryEnvironment: 'PRODUCTION', productionUrl: 'https://www.onlinealliance.in/sign-in', location: 'Bangalore, KA', notes: 'Microsites' },
    { name: 'IIT Kharagpur - v2', code: 'IITKGP-V2', type: 'STANDALONE', primaryEnvironment: 'PRODUCTION', productionUrl: 'https://v2.online.iitkgp.ac.in/', location: 'Kharagpur, WB', notes: '' },
    { name: 'IIT Kharagpur - v1 (v1 KGP)', code: 'V1-KGP', type: 'STANDALONE', primaryEnvironment: 'PRODUCTION', productionUrl: 'https://online.iitkgp.ac.in/', location: 'Kharagpur, WB', notes: 'Different Pipelines' },
    { name: 'O.P. Jindal Global University', code: 'OPJ', type: 'STANDALONE', primaryEnvironment: 'PRODUCTION', productionUrl: '', location: 'Sonipat, HR', notes: 'Different Pipelines' },
    { name: 'Periyar Maniammai Institute of Science & Technology', code: 'PSBDEU', type: 'STANDALONE', primaryEnvironment: 'PRODUCTION', productionUrl: '', location: 'Thanjavur, TN', notes: 'Different Pipelines' },
    { name: 'upGrad Rise', code: 'UPGRADRISE', type: 'STANDALONE', primaryEnvironment: 'PRODUCTION', productionUrl: 'https://www.upgradrise.com/', location: 'Mumbai, MH', notes: 'Different Pipelines' },
    { name: 'Andhra University', code: 'ANDHRA', type: 'STANDALONE', primaryEnvironment: 'PRODUCTION', productionUrl: '', location: 'Visakhapatnam, AP', notes: '' },
    { name: 'Sri Venkateswara University', code: 'SVU', type: 'STANDALONE', primaryEnvironment: 'PRODUCTION', productionUrl: '', location: 'Tirupati, AP', notes: '' },
    { name: 'Gradr', code: 'GRADR', type: 'STANDALONE', primaryEnvironment: 'PRODUCTION', productionUrl: '', location: 'India', notes: '' },
  ];

  const universities = await University.create(universityData);
  console.log(`[Seed] Seeded ${universities.length} universities`);

  const uniMap = new Map<string, any>();
  universities.forEach((u) => uniMap.set(u.code, u));

  // 3. Create Features
  const featureData = [
    { name: 'New Lead Form', code: 'NEW_LEAD_FORM', category: 'LEAD_MANAGEMENT', description: 'Next-gen responsive multi-step lead capture form with instant validation' },
    { name: 'LSQ Integration', code: 'LSQ_INTEGRATION', category: 'INTEGRATION', description: 'Bi-directional real-time LeadSquared CRM synchronization' },
    { name: 'Hero Banner', code: 'HERO_BANNER', category: 'CORE', description: 'Dynamic customizable hero promotional banner with A/B testing' },
    { name: 'Instrumentation', code: 'INSTRUMENTATION_EVENTS', category: 'ANALYTICS', description: 'Telemetry and user action clickstream instrumentation tracking' },
    { name: 'Fee Module', code: 'FEE_PAYMENT_MODULE', category: 'PAYMENTS', description: 'Razorpay & PayU multi-gateway fee collection and installment engine' },
    { name: 'UTM Tracking', code: 'UTM_TRACKING', category: 'LEAD_MANAGEMENT', description: 'First-touch, last-touch, and multi-touch campaign attribution engine' },
    { name: 'OTP Flow', code: 'OTP_VERIFICATION_FLOW', category: 'ADMISSION', description: 'WhatsApp & SMS powered instant applicant phone verification' },
    { name: 'Program Mapping', code: 'PROGRAM_MAPPING', category: 'ADMISSION', description: 'Multi-discipline course eligibility criteria and department mapping' },
    { name: 'Document Upload Engine', code: 'DOCUMENT_UPLOAD_ENGINE', category: 'ADMISSION', description: 'S3-backed applicant scorecard and transcript verification OCR' },
    { name: 'Single Sign-On SSO', code: 'SSO_AUTHENTICATION', category: 'CORE', description: 'SAML2 and Google Workspace single sign-on integration' },
  ];

  const features = await Feature.create(featureData);
  console.log(`[Seed] Seeded ${features.length} features`);

  const featMap = new Map<string, any>();
  features.forEach((f) => featMap.set(f.code, f));

  // 4. Create Key Reference Releases
  const keyReleases = [
    {
      uniCode: 'IITKGP-V2',
      featCode: 'NEW_LEAD_FORM',
      title: 'New Lead Form',
      description: 'Production deployment of high-converting multi-step lead capture form for 2026-27 batch.',
      type: 'FEATURE',
      env: 'PRODUCTION',
      date: new Date('2026-09-25T15:45:00'),
      time: '03:45 PM',
      status: 'LIVE',
      bugTicket: { id: 'UPG-2345', title: 'Lead form responsive layout glitch on iOS Safari', priority: 'HIGH', status: 'RESOLVED' },
      lead: { id: 'LID9087', program: 'B.Tech', form: 'Admission Enquiry', source: 'Website', status: 'SUCCESS' },
      sanity: { total: 18, passed: 18, failed: 0, blocked: 0, status: 'PASSED' },
    },
    {
      uniCode: 'ATLAS',
      featCode: 'LSQ_INTEGRATION',
      title: 'LSQ Integration Fix',
      description: 'Hotfix resolving custom field mapping payload synchronization to LeadSquared CRM.',
      type: 'BUG_FIX',
      env: 'PRODUCTION',
      date: new Date('2026-09-25T13:20:00'),
      time: '01:20 PM',
      status: 'LIVE',
      bugTicket: { id: 'UPG-2311', title: 'LSQ Opportunity not created for MBA program applicants', priority: 'CRITICAL', status: 'RESOLVED' },
      lead: { id: 'LID9086', program: 'MBA', form: 'Lead Capture Widget', source: 'Campaign', status: 'SUCCESS' },
      sanity: { total: 14, passed: 14, failed: 0, blocked: 0, status: 'PASSED' },
    },
    {
      uniCode: 'BDU',
      featCode: 'HERO_BANNER',
      title: 'Hero Banner Enhancement',
      description: 'Dynamic gradient styling and responsive video background support for admissions season.',
      type: 'ENHANCEMENT',
      env: 'PRODUCTION',
      date: new Date('2026-09-24T18:10:00'),
      time: '06:10 PM',
      status: 'LIVE',
      bugTicket: { id: 'UPG-2203', title: 'Video thumbnail flickering on slow mobile 4G networks', priority: 'MEDIUM', status: 'RESOLVED' },
      lead: { id: 'LID9085', program: 'B.Sc', form: 'Homepage Hero CTA', source: 'Website', status: 'PENDING' },
      sanity: { total: 12, passed: 12, failed: 0, blocked: 0, status: 'PASSED' },
    },
    {
      uniCode: 'CU',
      featCode: 'FEE_PAYMENT_MODULE',
      title: 'Fee Module Fix',
      description: 'Staging environment fix for webhook signature validation in multi-installment fee plans.',
      type: 'BUG_FIX',
      env: 'STAGING',
      date: new Date('2026-09-24T11:15:00'),
      time: '11:15 AM',
      status: 'LIVE',
      bugTicket: { id: 'UPG-2189', title: 'Payment receipt PDF generation timeout on high load', priority: 'HIGH', status: 'RESOLVED' },
      lead: { id: 'LID9084', program: 'M.Tech', form: 'Application Fee Portal', source: 'Portal', status: 'SUCCESS' },
      sanity: { total: 16, passed: 16, failed: 0, blocked: 0, status: 'PASSED' },
    },
    {
      uniCode: 'DYP',
      featCode: 'INSTRUMENTATION_EVENTS',
      title: 'Instrumentation Events',
      description: 'Telemetry tracking for button clicks, form drop-offs, and payment funnel progression.',
      type: 'FEATURE',
      env: 'PRODUCTION',
      date: new Date('2026-09-23T16:20:00'),
      time: '04:20 PM',
      status: 'LIVE',
      bugTicket: { id: 'UPG-2176', title: 'Missing session_id property in Google Analytics 4 event payload', priority: 'MEDIUM', status: 'RESOLVED' },
      lead: { id: 'LID9083', program: 'MBA', form: 'Executive Enquiry Form', source: 'Campaign', status: 'SUCCESS' },
      sanity: { total: 20, passed: 20, failed: 0, blocked: 0, status: 'PASSED' },
    },
  ];

  for (const item of keyReleases) {
    const uni = uniMap.get(item.uniCode);
    const feat = featMap.get(item.featCode);

    if (!uni || !feat) continue;

    const rel = await Release.create({
      university: uni._id,
      feature: feat._id,
      title: item.title,
      description: item.description,
      releaseType: item.type,
      environment: item.env,
      releaseDate: item.date,
      releaseTime: item.time,
      status: item.status,
      deployedBy: 'Shoaib Ahmed',
      releasedBy: defaultUser._id,
      version: 'v2.4.0',
    });

    // Bug
    const bug = await BugTicket.create({
      ticketId: item.bugTicket.id,
      title: item.bugTicket.title,
      jiraUrl: `https://jira.company.internal/browse/${item.bugTicket.id}`,
      priority: item.bugTicket.priority,
      status: item.bugTicket.status,
      university: uni._id,
      release: rel._id,
      createdDate: item.date,
      resolvedDate: item.date,
    });

    // Sanity
    const sanity = await SanityReport.create({
      title: `${uni.code} ${item.title} Sanity Report`,
      release: rel._id,
      university: uni._id,
      sanityStatus: item.sanity.status,
      testedBy: 'Shoaib Ahmed',
      testDate: item.date,
      testTime: item.time,
      environment: item.env,
      totalTestCases: item.sanity.total,
      passed: item.sanity.passed,
      failed: item.sanity.failed,
      blocked: item.sanity.blocked,
      notes: 'All core workflows and edge cases verified successfully on production environment.',
      attachments: [
        {
          name: `${uni.code}_${item.featCode}_Sanity_Report.pdf`,
          url: '/uploads/sample-sanity-report.pdf',
          size: 245000,
          mimeType: 'application/pdf',
        },
      ],
    });

    // Lead
    const lead = await Lead.create({
      leadId: item.lead.id,
      university: uni._id,
      release: rel._id,
      program: item.lead.program,
      form: item.lead.form,
      environment: item.env,
      source: item.lead.source,
      generatedAt: item.date,
      lsqStatus: 'CREATED',
      opportunityStatus: 'CREATED',
      erpStatus: 'CREATED',
      verificationStatus: item.lead.status,
      leadEmail: `test_${item.lead.id.toLowerCase()}@testdomain.com`,
      leadPhone: '+91 98765 43210',
    });

    rel.bugTickets = [bug._id];
    rel.sanityReports = [sanity._id];
    rel.leads = [lead._id];
    await rel.save();
  }

  // 5. Build matrix deployments
  const matrixDeployments = [
    { feat: 'NEW_LEAD_FORM', unis: ['IITKGP-V2', 'ATLAS', 'BDU', 'CU', 'DYP', 'CUTN', 'IIMB', 'VISTAS'], type: 'FEATURE' },
    { feat: 'LSQ_INTEGRATION', unis: ['IITKGP-V2', 'ATLAS', 'BDU', 'DYP', 'YD', 'ALLIANCE'], type: 'FEATURE' },
    { feat: 'HERO_BANNER', unis: ['ATLAS', 'BDU', 'CU', 'DYP', 'V1-KGP', 'ONLINEATLAS'], type: 'FEATURE' },
    { feat: 'INSTRUMENTATION_EVENTS', unis: ['IITKGP-V2', 'ATLAS', 'BDU', 'DYP', 'UPGRADRISE', 'CUTN'], type: 'FEATURE' },
    { feat: 'FEE_PAYMENT_MODULE', unis: ['IITKGP-V2', 'ATLAS', 'BDU', 'CU', 'DYP', 'IIMB', 'VISTAS'], type: 'FEATURE' },
    { feat: 'UTM_TRACKING', unis: ['IITKGP-V2', 'ATLAS', 'ALLIANCE', 'CUTN', 'IIMB'], type: 'FEATURE' },
    { feat: 'OTP_VERIFICATION_FLOW', unis: ['IITKGP-V2', 'ONLINEATLAS', 'YD', 'PSBDEU', 'UPGRADRISE'], type: 'FEATURE' },
    { feat: 'PROGRAM_MAPPING', unis: ['ATLAS', 'BDU', 'OPJ', 'ANDHRA', 'SVU'], type: 'FEATURE' },
    { feat: 'DOCUMENT_UPLOAD_ENGINE', unis: ['IITKGP-V2', 'DYP', 'CUTN', 'GRADR', 'VISTAS'], type: 'FEATURE' },
    { feat: 'SSO_AUTHENTICATION', unis: ['IITKGP-V2', 'IIMB', 'OPJ', 'PSBDEU', 'UPGRADRISE'], type: 'FEATURE' },
  ];

  for (const m of matrixDeployments) {
    const feat = featMap.get(m.feat);
    if (!feat) continue;

    for (const code of m.unis) {
      const uni = uniMap.get(code);
      if (!uni) continue;

      // Check if already created in keyReleases
      const existing = await Release.findOne({ university: uni._id, feature: feat._id, environment: 'PRODUCTION', status: 'LIVE' });
      if (!existing) {
        const releaseDay = 10 + (uni.code.charCodeAt(0) % 15);
        const relDate = new Date(`2026-09-${releaseDay.toString().padStart(2, '0')}T14:30:00`);

        const rel = await Release.create({
          university: uni._id,
          feature: feat._id,
          title: `${feat.name} Live Deployment`,
          description: `General availability release of ${feat.name} for ${uni.name}.`,
          releaseType: m.type,
          environment: 'PRODUCTION',
          releaseDate: relDate,
          releaseTime: '02:30 PM',
          status: 'LIVE',
          deployedBy: 'Shoaib Ahmed',
          releasedBy: defaultUser._id,
          version: 'v2.1.0',
        });

        // Add sanity test
        const sanity = await SanityReport.create({
          title: `${uni.code} ${feat.name} Sanity`,
          release: rel._id,
          university: uni._id,
          sanityStatus: 'PASSED',
          testedBy: 'QA Team',
          testDate: relDate,
          testTime: '03:15 PM',
          environment: 'PRODUCTION',
          totalTestCases: 15,
          passed: 15,
          failed: 0,
          blocked: 0,
          notes: 'Full regression and sanity testing passed.',
        });

        rel.sanityReports = [sanity._id];
        await rel.save();
      }
    }
  }

  // 6. Seed extra realistic releases across September 2026 to reach total ~124 releases
  // matching calendar dots on 1, 4, 7, 8, 10, 11, 13, 15, 16, 18, 19, 21, 22, 23, 24, 25, 28, 29, 30
  const releaseDates = [
    1, 2, 4, 5, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 28, 29, 30,
  ];

  const releaseTypesPool: Array<'FEATURE' | 'ENHANCEMENT' | 'BUG_FIX' | 'HOTFIX'> = [
    'FEATURE', 'ENHANCEMENT', 'BUG_FIX', 'HOTFIX', 'FEATURE', 'ENHANCEMENT', 'BUG_FIX',
  ];

  let currentReleaseCount = await Release.countDocuments();
  let leadCounter = 9088;
  let bugCounter = 2350;

  for (let i = currentReleaseCount; i < 124; i++) {
    const day = releaseDates[i % releaseDates.length];
    const uni = universities[i % universities.length];
    const feat = features[i % features.length];
    const rType = releaseTypesPool[i % releaseTypesPool.length];
    const hours = 9 + (i % 10);
    const mins = (i * 15) % 60;
    const timeStr = `${hours > 12 ? hours - 12 : hours}:${mins.toString().padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
    const relDate = new Date(`2026-09-${day.toString().padStart(2, '0')}T${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`);

    const titlePrefix = rType === 'BUG_FIX' ? 'Fix for' : rType === 'ENHANCEMENT' ? 'Enhancement to' : rType === 'HOTFIX' ? 'Emergency Patch:' : 'Release of';
    const relTitle = `${titlePrefix} ${feat.name}`;

    const rel = await Release.create({
      university: uni._id,
      feature: feat._id,
      title: relTitle,
      description: `Automated release tracked for ${uni.name} - ${feat.name} module update.`,
      releaseType: rType,
      environment: (i % 8 === 0) ? 'STAGING' : 'PRODUCTION',
      releaseDate: relDate,
      releaseTime: timeStr,
      status: (i % 25 === 0) ? 'ROLLED_BACK' : 'LIVE',
      deployedBy: i % 2 === 0 ? 'Shoaib Ahmed' : 'Priya Sharma',
      releasedBy: defaultUser._id,
      version: `v2.${(i % 5) + 1}.${i % 10}`,
    });

    // Create Sanity
    const sanityPass = i % 15 !== 0;
    const sanity = await SanityReport.create({
      title: `${uni.code} ${feat.name} QA Report`,
      release: rel._id,
      university: uni._id,
      sanityStatus: sanityPass ? 'PASSED' : 'PARTIAL',
      testedBy: i % 2 === 0 ? 'Shoaib Ahmed' : 'Priya Sharma',
      testDate: relDate,
      testTime: timeStr,
      environment: rel.environment,
      totalTestCases: 12 + (i % 8),
      passed: sanityPass ? 12 + (i % 8) : 10,
      failed: sanityPass ? 0 : 2,
      blocked: 0,
      notes: sanityPass ? 'All sanity test checks passed successfully.' : 'Minor cosmetic defect observed, signed off for non-critical path.',
    });

    // Create Bug if BUG_FIX or HOTFIX
    const bugsList = [];
    if (rType === 'BUG_FIX' || rType === 'HOTFIX' || i % 4 === 0) {
      const bug = await BugTicket.create({
        ticketId: `UPG-${bugCounter++}`,
        title: `${feat.name} unexpected behavior on ${uni.code}`,
        priority: rType === 'HOTFIX' ? 'CRITICAL' : 'HIGH',
        status: 'RESOLVED',
        university: uni._id,
        release: rel._id,
        createdDate: relDate,
        resolvedDate: relDate,
      });
      bugsList.push(bug._id);
    }

    // Create Leads
    const leadsList = [];
    for (let l = 0; l < (i % 5) + 1; l++) {
      const lead = await Lead.create({
        leadId: `LID-${leadCounter++}`,
        university: uni._id,
        release: rel._id,
        program: ['B.Tech', 'MBA', 'B.Sc', 'M.Tech', 'BBA', 'B.Des'][l % 6],
        form: 'Application Enquiry',
        environment: rel.environment,
        source: ['Website', 'Campaign', 'Portal', 'Social', 'Direct'][l % 5],
        generatedAt: relDate,
        lsqStatus: 'CREATED',
        opportunityStatus: 'CREATED',
        erpStatus: 'CREATED',
        verificationStatus: 'SUCCESS',
      });
      leadsList.push(lead._id);
    }

    rel.sanityReports = [sanity._id];
    rel.bugTickets = bugsList;
    rel.leads = leadsList;
    await rel.save();
  }

  // 7. Seed Initial Audit Logs
  const auditEvents = [
    { event: 'LOGIN', title: 'Shoaib Ahmed Login', details: 'User shoaib@releasetrack.com logged in' },
    { event: 'CREATE_RELEASE', title: 'IITKGP New Lead Form', details: 'Created release for IITKGP New Lead Form in PRODUCTION' },
    { event: 'MARK_RELEASE_LIVE', title: 'IITKGP New Lead Form', details: 'Release marked LIVE' },
    { event: 'UPLOAD_REPORT', title: 'IITKGP Sanity Report', details: 'Uploaded sanity verification report (18/18 passed)' },
    { event: 'CREATE_LEAD', title: 'LID9087', details: 'Verified test lead LID9087 in CRM and ERP' },
    { event: 'CREATE_BUG', title: 'UPG-2345', details: 'Jira issue UPG-2345 attached and marked resolved' },
  ];

  for (const a of auditEvents) {
    await AuditLog.create({
      event: a.event as any,
      performedBy: defaultUser._id,
      userName: defaultUser.name,
      userRole: defaultUser.role,
      entityType: 'Release',
      entityTitle: a.title,
      details: a.details,
      ipAddress: '127.0.0.1',
    });
  }

  // 8. Seed Notifications
  await Notification.create([
    {
      title: 'New Production Release Live',
      message: 'New Lead Form is now LIVE on IITKGP with sanity passed.',
      type: 'RELEASE',
      priority: 'HIGH',
      link: '/releases',
      readBy: [],
    },
    {
      title: 'Sanity Report Approved',
      message: 'Atlas LSQ Integration Fix report verified by QA Lead.',
      type: 'SANITY',
      priority: 'NORMAL',
      link: '/sanity-reports',
      readBy: [],
    },
    {
      title: 'Lead Verification Complete',
      message: '5 new test leads verified across BDU and DYP.',
      type: 'SYSTEM',
      priority: 'LOW',
      link: '/leads',
      readBy: [],
    },
  ]);

  console.log('[Seed] Database seeding completed successfully!');
};

// If run directly via CLI
if (require.main === module) {
  (async () => {
    await connectDB();
    await seedDatabase();
    await disconnectDB();
    process.exit(0);
  })();
}
