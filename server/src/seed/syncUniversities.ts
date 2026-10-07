import { connectDB, disconnectDB } from '../config/db';
import { University } from '../models/University';

export const universitiesToSync = [
  {
    name: 'Dr. D.Y. Patil Vidyapeeth',
    code: 'DYP',
    type: 'STANDALONE' as const,
    productionUrl: 'https://v2.dypatiledu.com/sign-in',
    notes: '',
  },
  {
    name: 'Atlas SkillTech University',
    code: 'ATLAS',
    type: 'MULTI_TENANT' as const,
    productionUrl: 'https://v2.atlasonline.edu.in/sign-in',
    notes: 'Microsites',
  },
  {
    name: 'Online Atlas',
    code: 'ONLINEATLAS',
    type: 'MULTI_TENANT' as const,
    productionUrl: 'https://www.onlineatlas.in/sign-in',
    notes: 'Microsites',
  },
  {
    name: 'Central University of Tamil Nadu',
    code: 'CUTN',
    type: 'STANDALONE' as const,
    productionUrl: 'https://www.cutnonline.in/sign-in',
    notes: 'Different Pipelines',
  },
  {
    name: 'Indian Institute of Management Bangalore',
    code: 'IIMB',
    type: 'STANDALONE' as const,
    productionUrl: 'https://online.iimbx.edu.in/sign-in',
    notes: 'Different Pipelines',
  },
  {
    name: 'Vels Institute of Science, Technology & Advanced Studies',
    code: 'VISTAS',
    type: 'STANDALONE' as const,
    productionUrl: 'https://www.vistasonlineedu.in/sign-in',
    notes: '',
  },
  {
    name: 'Chandigarh University',
    code: 'CU',
    type: 'STANDALONE' as const,
    productionUrl: 'https://www.cuonlineedu.in/admin',
    notes: '',
  },
  {
    name: 'Kurukshetra University',
    code: 'KUK',
    type: 'STANDALONE' as const,
    productionUrl: '',
    notes: '',
  },
  {
    name: 'Bharathidasan University',
    code: 'BDU',
    type: 'STANDALONE' as const,
    productionUrl: '',
    notes: '',
  },
  {
    name: 'YourDegree',
    code: 'YD',
    type: 'STANDALONE' as const,
    productionUrl: 'https://cms-infinity.yourdegree.com',
    notes: '',
  },
  {
    name: 'Alliance University',
    code: 'ALLIANCE',
    type: 'MULTI_TENANT' as const,
    productionUrl: 'https://www.onlinealliance.in/sign-in',
    notes: 'Microsites',
  },
  {
    name: 'IIT Kharagpur - v2',
    code: 'IITKGP-V2',
    type: 'STANDALONE' as const,
    productionUrl: 'https://v2.online.iitkgp.ac.in/',
    notes: '',
  },
  {
    name: 'IIT Kharagpur - v1 (v1 KGP)',
    code: 'V1-KGP',
    type: 'STANDALONE' as const,
    productionUrl: 'https://online.iitkgp.ac.in/',
    notes: 'Different Pipelines',
  },
  {
    name: 'O.P. Jindal Global University',
    code: 'OPJ',
    type: 'STANDALONE' as const,
    productionUrl: '',
    notes: 'Different Pipelines',
  },
  {
    name: 'Periyar Maniammai Institute of Science & Technology',
    code: 'PSBDEU',
    type: 'STANDALONE' as const,
    productionUrl: '',
    notes: 'Different Pipelines',
  },
  {
    name: 'upGrad Rise',
    code: 'UPGRADRISE',
    type: 'STANDALONE' as const,
    productionUrl: 'https://www.upgradrise.com/',
    notes: 'Different Pipelines',
  },
  {
    name: 'Andhra University',
    code: 'ANDHRA',
    type: 'STANDALONE' as const,
    productionUrl: '',
    notes: '',
  },
  {
    name: 'Sri Venkateswara University',
    code: 'SVU',
    type: 'STANDALONE' as const,
    productionUrl: '',
    notes: '',
  },
  {
    name: 'Gradr',
    code: 'GRADR',
    type: 'STANDALONE' as const,
    productionUrl: '',
    notes: '',
  },
];

export const syncUniversities = async () => {
  console.log('[Sync] Upserting 19 target universities in database...');

  for (const item of universitiesToSync) {
    await University.findOneAndUpdate(
      { code: item.code.toUpperCase() },
      {
        $set: {
          name: item.name,
          code: item.code.toUpperCase(),
          type: item.type,
          productionUrl: item.productionUrl,
          notes: item.notes,
          status: 'ACTIVE',
          primaryEnvironment: 'PRODUCTION',
        },
      },
      { upsert: true, new: true }
    );
    console.log(`[Sync] ✓ Synced ${item.code} (${item.name})`);
  }

  console.log('[Sync] All 19 universities synced successfully into MongoDB.');
};

if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await syncUniversities();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('[Sync] Error:', err);
      process.exit(1);
    }
  })();
}
