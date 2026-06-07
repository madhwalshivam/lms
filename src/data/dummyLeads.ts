import { Lead, LeadStatus, LeadSource, TravelDestination, SalesExecutive, Note, ActivityLog, FollowUp } from '../types';
import { LEAD_SOURCES, LEAD_STATUSES, DESTINATIONS, SALES_EXECUTIVES, TRAVEL_PACKAGES } from '../constants';

// Seedable random number generator for deterministic data
function createRandom(seed: number) {
  let x = Math.sin(seed++) * 10000;
  return function() {
    x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
}

const random = createRandom(42);

const FIRST_NAMES = [
  'Aarav', 'Ananya', 'Vihaan', 'Aditi', 'Ishaan', 'Diya', 'Sai', 'Kiara', 'Arjun', 'Meera',
  'Kabir', 'Riya', 'Rohan', 'Isha', 'Aanya', 'Aryan', 'Neha', 'Rahul', 'Sneha', 'Karan',
  'Siddharth', 'Pooja', 'Aditya', 'Shruti', 'Dev', 'Tanya', 'Varun', 'Kriti', 'Amit', 'Payal',
  'Rajesh', 'Sunita', 'Vikram', 'Deepika', 'Sanjay', 'Priya', 'Anil', 'Kiran', 'Harish', 'Geeta',
  'John', 'Emily', 'David', 'Sarah', 'Michael', 'Jessica', 'James', 'Ashley', 'Robert', 'Amanda'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Joshi', 'Mehta', 'Reddy', 'Nair',
  'Roy', 'Das', 'Sen', 'Banerjee', 'Chatterjee', 'Iyer', 'Pillai', 'Rao', 'Bhat', 'Hegde',
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson',
  'Chawla', 'Malhotra', 'Kapoor', 'Khanna', 'Anand', 'Gill', 'Sodhi', 'Dhillon', 'Grover', 'Bhasin',
  'Choudhury', 'Dutta', 'Mishra', 'Trivedi', 'Pandey', 'Dubey', 'Saxena', 'Srivastava', 'Prasad', 'Sinha'
];

const NOTES_TEMPLATES = [
  'Interested in 5-star hotel options.',
  'Traveling with family (2 adults, 2 kids). Needs family-friendly packages.',
  'Honeymoon couple. Requesting romantic candle-light dinner and room decoration.',
  'Looking for vegetarian food options throughout the tour.',
  'Prefers flights over cruise options. Flexible with dates.',
  'Requested a detailed itinerary for all adventure activities.',
  'Looking for budget-friendly packages. Willing to negotiate.',
  'Wants a sea-facing villa in Maldives.',
  'Asked if airport transfers and travel insurance are included.',
  'Traveling in a group of 8. Requested group discount.',
  'Wants a customized private tour instead of a group package.',
  'Looking for shopping-focused sightseeing.',
  'Needs wheel-chair accessibility during transit.'
];

const ACTIVITY_TEMPLATES = [
  { text: 'Lead created from website contact form.', type: 'status_change' },
  { text: 'Assigned to executive.', type: 'assigned' },
  { text: 'Outbound call placed. Discussed itinerary options.', type: 'call' },
  { text: 'Sent package details on WhatsApp.', type: 'whatsapp' },
  { text: 'Sent detailed PDF quotation via email.', type: 'email' },
  { text: 'Follow-up call scheduled.', type: 'note_added' }
];

export const generateDummyLeads = (): Lead[] => {
  const leads: Lead[] = [];
  
  // Base date of June 7, 2026
  const baseDate = new Date(2026, 5, 7); // Month is 0-indexed (5 = June)

  for (let i = 1; i <= 100; i++) {
    const r1 = random();
    const r2 = random();
    const r3 = random();
    const r4 = random();
    const r5 = random();
    const r6 = random();
    
    const firstName = FIRST_NAMES[Math.floor(r1 * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(r2 * LAST_NAMES.length)];
    const fullName = `${firstName} ${lastName}`;
    
    // Generate phone: standard 10 digit
    const areaCode = Math.floor(700 + r3 * 299); // 700 to 999
    const midCode = Math.floor(100 + r4 * 899);
    const lastCode = Math.floor(1000 + r5 * 8999);
    const phone = `+91 ${areaCode}${midCode}${lastCode}`;
    
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    
    const destination = DESTINATIONS[Math.floor(r6 * DESTINATIONS.length)];
    const packages = TRAVEL_PACKAGES[destination];
    const travelPackage = packages[Math.floor(random() * packages.length)];
    
    const leadSource = LEAD_SOURCES[Math.floor(random() * LEAD_SOURCES.length)];
    
    // Status distribution: New (15%), Contacted (25%), Follow-Up (30%), Converted (20%), Rejected (10%)
    const statusRand = random();
    let leadStatus: LeadStatus = 'New';
    if (statusRand < 0.15) leadStatus = 'New';
    else if (statusRand < 0.40) leadStatus = 'Contacted';
    else if (statusRand < 0.70) leadStatus = 'Follow-Up';
    else if (statusRand < 0.90) leadStatus = 'Converted';
    else leadStatus = 'Rejected';
    
    // Executive assignment: New leads might be Unassigned (30% chance), otherwise assigned.
    let assignedExecutive: SalesExecutive | 'Unassigned' = 'Unassigned';
    if (leadStatus !== 'New' || random() > 0.3) {
      assignedExecutive = SALES_EXECUTIVES[Math.floor(random() * SALES_EXECUTIVES.length)];
    }
    
    // Create Date: 1 to 45 days ago
    const createdDaysAgo = Math.floor(random() * 45) + 1;
    const createdDate = new Date(baseDate.getTime() - createdDaysAgo * 24 * 60 * 60 * 1000);
    
    // Travel Date: 30 to 180 days in the future
    const travelDaysInFuture = Math.floor(random() * 150) + 30;
    const travelDate = new Date(baseDate.getTime() + travelDaysInFuture * 24 * 60 * 60 * 1000);
    
    // Budget based on destination
    let baseBudget = 40000; // Goa / Kashmir base
    if (destination === 'Maldives' || destination === 'Europe Tour') baseBudget = 150000;
    else if (destination === 'Dubai' || destination === 'Singapore') baseBudget = 80000;
    else if (destination === 'Bali' || destination === 'Thailand') baseBudget = 60000;
    
    const budget = baseBudget + Math.floor(random() * (baseBudget * 0.5));
    
    const campaignNames = {
      'Website': 'Organic Search',
      'Facebook Ads': 'Summer Getaway Promo 2026',
      'Instagram Ads': 'Visual Escapes Reels Campaign',
      'Google Ads': 'Travel Search Intent - Match Type'
    };
    const campaignName = campaignNames[leadSource];

    // Generate Notes
    const notesCount = Math.floor(random() * 3);
    const notes: Note[] = [];
    for (let j = 0; j < notesCount; j++) {
      const noteText = NOTES_TEMPLATES[Math.floor(random() * NOTES_TEMPLATES.length)];
      const noteDaysAfter = Math.floor(random() * createdDaysAgo);
      const noteDate = new Date(createdDate.getTime() + noteDaysAfter * 24 * 60 * 60 * 1000);
      notes.push({
        id: `note-${i}-${j}`,
        text: noteText,
        date: noteDate.toISOString().split('T')[0],
        author: assignedExecutive !== 'Unassigned' ? assignedExecutive : 'System Admin'
      });
    }

    // Generate Activity History
    const activityCount = Math.floor(random() * 4) + 1;
    const activityHistory: ActivityLog[] = [];
    
    // Default created log
    activityHistory.push({
      id: `act-${i}-0`,
      text: `Lead imported from ${leadSource} (${campaignName}).`,
      date: createdDate.toISOString().split('T')[0],
      type: 'status_change'
    });
    
    if (assignedExecutive !== 'Unassigned') {
      activityHistory.push({
        id: `act-${i}-assigned`,
        text: `Lead assigned to ${assignedExecutive}.`,
        date: createdDate.toISOString().split('T')[0],
        type: 'assigned'
      });
    }

    for (let j = 1; j < activityCount; j++) {
      const actSeed = Math.floor(random() * ACTIVITY_TEMPLATES.length);
      const act = ACTIVITY_TEMPLATES[actSeed];
      const actDaysAfter = Math.floor(random() * createdDaysAgo);
      const actDate = new Date(createdDate.getTime() + actDaysAfter * 24 * 60 * 60 * 1000);
      
      activityHistory.push({
        id: `act-${i}-${j}`,
        text: act.text,
        date: actDate.toISOString().split('T')[0],
        type: act.type as any
      });
    }

    // Sort activity by date
    activityHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Generate Follow-ups
    const followUpHistory: FollowUp[] = [];
    if (leadStatus === 'Follow-Up') {
      const followUpDaysOffset = Math.floor(random() * 7) - 2; // Some past, some future
      const followUpDate = new Date(baseDate.getTime() + followUpDaysOffset * 24 * 60 * 60 * 1000);
      
      const types: Array<'Call' | 'WhatsApp' | 'Email'> = ['Call', 'WhatsApp', 'Email'];
      const followUpType = types[Math.floor(random() * types.length)];
      
      followUpHistory.push({
        id: `fu-${i}-1`,
        text: `Discuss travel itinerary and budget negotiation.`,
        date: followUpDate.toISOString().split('T')[0],
        type: followUpType,
        completed: followUpDaysOffset < 0
      });
    }

    leads.push({
      id: `LMS-${10000 + i}`,
      name: fullName,
      phone,
      email,
      destination,
      travelPackage,
      leadSource,
      assignedExecutive,
      leadStatus,
      createdDate: createdDate.toISOString().split('T')[0],
      budget,
      travelDate: travelDate.toISOString().split('T')[0],
      campaignName,
      notes,
      activityHistory,
      followUpHistory
    });
  }

  // Sort leads: newest first
  return leads.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
};

export const dummyLeads = generateDummyLeads();

export const dummyUser = {
  name: 'Vikram Aditya',
  role: 'Sales Manager',
  email: 'vikram.aditya@urbancruisetravel.com',
  phone: '+91 9876543210',
  profilePicture: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200'
};

export const dummyNotifications = [
  {
    id: 'notif-1',
    title: 'New Website Lead',
    body: 'Aarav Sharma has submitted an inquiry for Dubai Deluxe package.',
    timestamp: '2026-06-07T14:30:00Z',
    read: false,
    category: 'new_lead' as const
  },
  {
    id: 'notif-2',
    title: 'Follow-up Reminder',
    body: 'Call with Priya Singh for Maldives Water Villa is scheduled in 30 minutes.',
    timestamp: '2026-06-07T14:00:00Z',
    read: false,
    category: 'reminder' as const
  },
  {
    id: 'notif-3',
    title: 'Lead Converted!',
    body: 'Rahul Kumar package to Bali has been successfully converted. Total value: ₹95,000.',
    timestamp: '2026-06-07T11:15:00Z',
    read: true,
    category: 'converted' as const
  },
  {
    id: 'notif-4',
    title: 'Daily Summary Report',
    body: 'Yesterday summary: 14 new leads received, 3 converted, 1 rejected. Conversion rate: 21%.',
    timestamp: '2026-06-07T08:00:00Z',
    read: true,
    category: 'summary' as const
  },
  {
    id: 'notif-5',
    title: 'New Facebook Ads Lead',
    body: 'Emily Smith inquired about Thailand Scenic Highlights package.',
    timestamp: '2026-06-06T18:45:00Z',
    read: true,
    category: 'new_lead' as const
  }
];
