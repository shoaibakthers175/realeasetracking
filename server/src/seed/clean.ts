import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import {
  Release,
  BugTicket,
  SanityReport,
  Lead,
  AuditLog,
  Notification,
} from '../models';

export const cleanDemoData = async () => {
  console.log('[Clean] Cleaning all demo operational records (releases, bugs, sanity, leads, audit logs)...');

  const [releases, bugs, sanity, leads, audits, notifications] = await Promise.all([
    Release.deleteMany({}),
    BugTicket.deleteMany({}),
    SanityReport.deleteMany({}),
    Lead.deleteMany({}),
    AuditLog.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log(`[Clean] Deleted:
    - ${releases.deletedCount} Releases
    - ${bugs.deletedCount} Bug Tickets
    - ${sanity.deletedCount} Sanity Reports
    - ${leads.deletedCount} Test Leads
    - ${audits.deletedCount} Audit Logs
    - ${notifications.deletedCount} Notifications
  `);

  return {
    releases: releases.deletedCount,
    bugs: bugs.deletedCount,
    sanity: sanity.deletedCount,
    leads: leads.deletedCount,
    audits: audits.deletedCount,
    notifications: notifications.deletedCount,
  };
};

if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await cleanDemoData();
      await disconnectDB();
      console.log('[Clean] Database successfully cleared of all demo operational data.');
      process.exit(0);
    } catch (err) {
      console.error('[Clean] Error cleaning database:', err);
      process.exit(1);
    }
  })();
}
