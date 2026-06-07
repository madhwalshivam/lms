const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const User = require('./models/User');
const Lead = require('./models/Lead');
const Notification = require('./models/Notification');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/notifications', notificationRoutes);

// Base + health routes (Render pings these)
app.get('/', (req, res) => {
  res.send('Urban Cruise LMS Backend is running successfully!');
});
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Seed data function to ensure easy testing on first start
const seedAdminAndUser = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding initial demo executive account...');
      await User.create({
        name: 'Vikram Aditya',
        email: 'agent@urbancruise.com',
        password: 'Password123', // Raw password, model pre-save will hash it
        role: 'Sales Executive',
      });
      await User.create({
        name: 'Sonia Sharma',
        email: 'admin@urbancruise.com',
        password: 'AdminPassword123',
        role: 'Admin',
      });
      console.log('Initial accounts seeded! agent@urbancruise.com (Password123) and admin@urbancruise.com (AdminPassword123) are ready.');
    }

    const leadCount = await Lead.countDocuments();
    if (leadCount < 10) {
      console.log('Leads count is less than 10. Reseeding 50 dummy leads in MongoDB...');
      await Lead.deleteMany({}); // Clear out old static entries to prevent collisions
      
      const firstNames = ['Rohan', 'Amit', 'Sunita', 'Rahul', 'Pooja', 'Deepak', 'Neha', 'Sanjay', 'Preeti', 'Vikram', 'Anjali', 'Karan', 'Simran', 'Arjun', 'Tanvi', 'Rajesh', 'Kirti', 'Abhishek', 'Meera', 'Vijay', 'Divya', 'Suresh', 'Ritu', 'Manish', 'Komal'];
      const lastNames = ['Sharma', 'Singh', 'Gupta', 'Verma', 'Patel', 'Joshi', 'Nair', 'Mehta', 'Nayar', 'Malhotra', 'Rao', 'Kapoor', 'Chawla', 'Sood', 'Reddy', 'Choudhary', 'Sen', 'Das', 'Roy', 'Mishra', 'Trivedi'];
      const destinations = ['Dubai', 'Maldives', 'Bali', 'Europe Tour', 'Singapore', 'Thailand', 'Kashmir', 'Goa'];
      const budgets = ['₹45,000', '₹75,000', '₹95,000', '₹1,20,000', '₹1,50,000', '₹1,80,000', '₹2,10,000', '₹2,50,000'];
      const sources = ['Website', 'Google Ads', 'Facebook Ads', 'Instagram Ads'];
      const statuses = ['New', 'Contacted', 'Follow-Up', 'Converted', 'Rejected'];
      const executives = ['Vikram Aditya', 'Unassigned'];

      const dummyLeadsList = [];
      const todayVal = new Date();

      for (let i = 1; i <= 50; i++) {
        const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const fullName = `${fName} ${lName}`;
        const destination = destinations[Math.floor(Math.random() * destinations.length)];
        const budget = budgets[Math.floor(Math.random() * budgets.length)];
        const source = sources[Math.floor(Math.random() * sources.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const executive = status === 'New' ? 'Unassigned' : executives[Math.floor(Math.random() * executives.length)];

        // Generate date spanning the last 15 days
        const leadDate = new Date();
        leadDate.setDate(todayVal.getDate() - Math.floor(Math.random() * 15));
        const dateStr = leadDate.toISOString().split('T')[0];

        dummyLeadsList.push({
          id: `LMS-${10000 + i}`,
          name: fullName,
          email: `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@example.com`,
          phone: `+91 9${Math.floor(100 + Math.random() * 900)} ${Math.floor(10000 + Math.random() * 90000)}`,
          destination: destination,
          budget: budget,
          leadSource: source,
          assignedExecutive: executive,
          leadStatus: status,
          createdDate: dateStr,
          activityHistory: [
            {
              id: `act-${Date.now()}-${i}-1`,
              text: `Lead captured via ${source}.`,
              date: dateStr,
              type: 'status_change',
            }
          ],
          notes: i % 3 === 0 ? [
            {
              id: `note-${Date.now()}-${i}`,
              text: `Interested in custom package inclusions. Looking for 3-star/4-star options.`,
              date: dateStr,
              author: 'System Admin'
            }
          ] : []
        });
      }

      await Lead.insertMany(dummyLeadsList);
      console.log('50 Dummy leads successfully seeded!');
    }

    const notificationCount = await Notification.countDocuments();
    if (notificationCount === 0) {
      console.log('Seeding initial notifications...');
      const todayISO = new Date().toISOString();
      await Notification.create([
        {
          title: 'New Website Lead',
          body: 'Aarav Sharma has submitted an inquiry for Dubai package.',
          timestamp: todayISO,
          read: false,
          category: 'new_lead',
        },
        {
          title: 'Immediate Follow-up Alert',
          body: 'Call with Priya Singh for Maldives is scheduled in 30 minutes.',
          timestamp: todayISO,
          read: false,
          category: 'reminder',
        },
        {
          title: 'Lead Converted! 🎉',
          body: 'Neha Gupta Europe Tour booking has been successfully confirmed.',
          timestamp: todayISO,
          read: true,
          category: 'converted',
        }
      ]);
      console.log('Dummy notifications successfully seeded!');
    }
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

// Connect to MongoDB, seed data, then start the server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedAdminAndUser();
  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
};

startServer();
