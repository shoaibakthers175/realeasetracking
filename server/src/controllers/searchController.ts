import { Request, Response, NextFunction } from 'express';
import { University } from '../models/University';
import { Feature } from '../models/Feature';
import { Release } from '../models/Release';
import { BugTicket } from '../models/BugTicket';
import { Lead } from '../models/Lead';
import { sendSuccess } from '../utils/response';

export const globalSearch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = ((req.query.q as string) || '').trim();

    if (!query || query.length < 2) {
      return sendSuccess(res, {
        universities: [],
        features: [],
        releases: [],
        bugs: [],
        leads: [],
        total: 0,
      });
    }

    const regex = new RegExp(query, 'i');

    const [universities, features, releases, bugs, leads] = await Promise.all([
      // 1. Universities
      University.find({
        $or: [{ name: regex }, { code: regex }, { tenantId: regex }],
      })
        .limit(5)
        .select('name code type primaryEnvironment status'),

      // 2. Features
      Feature.find({
        $or: [{ name: regex }, { code: regex }, { category: regex }],
      })
        .limit(5)
        .select('name code category isActive'),

      // 3. Releases
      Release.find({
        $or: [{ title: regex }, { description: regex }, { version: regex }],
      })
        .populate('university', 'name code')
        .populate('feature', 'name code')
        .populate('sanityReports', 'sanityStatus')
        .limit(8)
        .select('title releaseType environment releaseDate releaseTime status version university feature sanityReports leads bugTickets'),

      // 4. Bug Tickets
      BugTicket.find({
        $or: [{ ticketId: regex }, { title: regex }, { description: regex }],
      })
        .populate('university', 'name code')
        .populate({
          path: 'release',
          select: 'title releaseDate environment status sanityReports',
          populate: { path: 'sanityReports', select: 'sanityStatus' },
        })
        .limit(6)
        .select('ticketId title priority status university release jiraUrl'),

      // 5. Leads
      Lead.find({
        $or: [{ leadId: regex }, { program: regex }, { leadEmail: regex }, { form: regex }],
      })
        .populate('university', 'name code')
        .populate('release', 'title')
        .limit(5)
        .select('leadId university release program source verificationStatus lsqStatus opportunityStatus generatedAt'),
    ]);

    const total =
      universities.length +
      features.length +
      releases.length +
      bugs.length +
      leads.length;

    return sendSuccess(
      res,
      {
        universities,
        features,
        releases,
        bugs,
        leads,
        total,
      },
      'Search results retrieved'
    );
  } catch (error) {
    next(error);
  }
};
