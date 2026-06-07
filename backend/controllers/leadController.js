const Lead = require('../models/Lead');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { Expo } = require('expo-server-sdk');

// Initialize Expo SDK
const expo = new Expo();

// Helper function to send push notification
const sendPushNotification = async (expoPushTokens, title, body, data = {}) => {
  const messages = [];
  
  for (const pushToken of expoPushTokens) {
    // Check if token is valid
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    messages.push({
      to: pushToken,
      sound: 'default',
      title,
      body,
      data,
    });
  }

  // Chunk messages to avoid sending too many at once
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('Error sending push notifications chunk:', error);
    }
  }
};

// @desc    Get all leads (filtered)
// @route   GET /api/leads
exports.getLeads = async (req, res) => {
  const { source, status, assignedExecutive } = req.query;
  const filterQuery = {};

  if (source && source !== 'All') {
    filterQuery.leadSource = source;
  }
  if (status && status !== 'All') {
    filterQuery.leadStatus = status;
  }
  if (assignedExecutive && assignedExecutive !== 'All') {
    filterQuery.assignedExecutive = assignedExecutive;
  }

  try {
    const leads = await Lead.find(filterQuery).sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create lead manually
// @route   POST /api/leads
exports.createLead = async (req, res) => {
  const { name, email, phone, destination, budget, travelDate, pax, leadSource, assignedExecutive, notes } = req.body;
  const today = new Date().toISOString().split('T')[0];

  try {
    const activityHistory = [
      {
        id: `act-${Date.now()}-create`,
        text: `Lead created manually. Source: ${leadSource || 'Manual'}`,
        date: today,
        type: 'status_change',
      }
    ];

    const notesList = [];
    if (notes && notes.trim()) {
      notesList.push({
        id: `note-${Date.now()}`,
        text: notes.trim(),
        date: today,
        author: 'System Admin',
      });
      activityHistory.push({
        id: `act-${Date.now()}-initial-note`,
        text: `Added initial note: "${notes.trim()}"`,
        date: today,
        type: 'note_added',
      });
    }

    if (assignedExecutive && assignedExecutive !== 'Unassigned') {
      activityHistory.push({
        id: `act-${Date.now()}-initial-assign`,
        text: `Assigned to ${assignedExecutive} upon creation.`,
        date: today,
        type: 'assigned',
      });
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      destination,
      budget: budget || 'Not Specified',
      travelDate: travelDate || '',
      pax: pax || 1,
      leadSource: leadSource || 'Manual',
      assignedExecutive: assignedExecutive || 'Unassigned',
      leadStatus: 'New',
      notes: notesList,
      activityHistory,
      createdDate: today,
    });

    // Send push notification if assigned to an executive
    if (assignedExecutive && assignedExecutive !== 'Unassigned') {
      const executiveUser = await User.findOne({ name: assignedExecutive });
      if (executiveUser && executiveUser.expoPushTokens.length > 0) {
        await sendPushNotification(
          executiveUser.expoPushTokens,
          'New Lead Assigned! ✈️',
          `New manual lead ${name} for ${destination} has been assigned to you.`,
          { leadId: lead.id }
        );
      }
    }

    // Save notification log in DB
    await Notification.create({
      title: 'New Lead Created',
      body: `${name} has been added manually for ${destination}.`,
      timestamp: new Date().toISOString(),
      read: false,
      category: 'new_lead',
    });

    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update lead status
// @route   PUT /api/leads/:leadId/status
exports.updateLeadStatus = async (req, res) => {
  const { leadId } = req.params;
  const { status, noteText } = req.body;
  const today = new Date().toISOString().split('T')[0];

  try {
    const lead = await Lead.findOne({ id: leadId });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const oldStatus = lead.leadStatus;
    lead.leadStatus = status;

    // Log activity
    lead.activityHistory.push({
      id: `act-${Date.now()}-${status}`,
      text: `Status changed from ${oldStatus} to ${status}.`,
      date: today,
      type: 'status_change',
    });

    // Optional note
    if (noteText && noteText.trim()) {
      lead.notes.push({
        id: `note-${Date.now()}`,
        text: noteText.trim(),
        date: today,
        author: lead.assignedExecutive !== 'Unassigned' ? lead.assignedExecutive : 'System Admin',
      });
      lead.activityHistory.push({
        id: `act-${Date.now()}-note`,
        text: `Note added: "${noteText.trim()}"`,
        date: today,
        type: 'note_added',
      });
    }

    // Schedule automatic follow-up if status changed to Follow-Up
    if (status === 'Follow-Up') {
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + 2); // 2 days later

      lead.followUpHistory.push({
        id: `fu-${Date.now()}`,
        text: 'Automatic follow-up call scheduled.',
        date: followUpDate.toISOString().split('T')[0],
        type: 'Call',
        completed: false,
      });
    }

    await lead.save();

    // Send push notification when status is changed
    try {
      const notificationTitle = 'Lead Status Updated! 📈';
      const notificationBody = `Lead "${lead.name}" status has been changed to "${status}".`;

      const recipients = [];
      // 1. Get assigned executive's tokens
      if (lead.assignedExecutive && lead.assignedExecutive !== 'Unassigned') {
        const execUser = await User.findOne({ name: lead.assignedExecutive });
        if (execUser && execUser.expoPushTokens.length > 0) {
          recipients.push(...execUser.expoPushTokens);
        }
      }
      
      // 2. Get all admins' tokens
      const admins = await User.find({ role: 'Admin' });
      for (const admin of admins) {
        if (admin.expoPushTokens.length > 0) {
          recipients.push(...admin.expoPushTokens);
        }
      }

      if (recipients.length > 0) {
        const uniqueRecipients = [...new Set(recipients)];
        await sendPushNotification(
          uniqueRecipients,
          notificationTitle,
          notificationBody,
          { leadId: lead.id, type: 'status_change', status }
        );
      }

      // Also create an in-app notification in DB
      await Notification.create({
        title: notificationTitle,
        body: notificationBody,
        timestamp: new Date().toISOString(),
        read: false,
        category: status === 'Converted' ? 'converted' : 'general',
      });
    } catch (pushErr) {
      console.error('Failed to trigger push notifications on status update:', pushErr);
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add note to a lead
// @route   POST /api/leads/:leadId/notes
exports.addLeadNote = async (req, res) => {
  const { leadId } = req.params;
  const { noteText, author } = req.body;
  const today = new Date().toISOString().split('T')[0];

  try {
    const lead = await Lead.findOne({ id: leadId });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    lead.notes.unshift({
      id: `note-${Date.now()}`,
      text: noteText,
      date: today,
      author: author || 'System Admin',
    });

    lead.activityHistory.push({
      id: `act-${Date.now()}-note`,
      text: `Added note: "${noteText}"`,
      date: today,
      type: 'note_added',
    });

    await lead.save();
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign lead to executive
// @route   PUT /api/leads/:leadId/assign
exports.assignLead = async (req, res) => {
  const { leadId } = req.params;
  const { executive } = req.body;
  const today = new Date().toISOString().split('T')[0];

  try {
    const lead = await Lead.findOne({ id: leadId });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const oldOwner = lead.assignedExecutive;
    lead.assignedExecutive = executive;

    lead.activityHistory.push({
      id: `act-${Date.now()}-assign`,
      text: `Owner changed from ${oldOwner} to ${executive}.`,
      date: today,
      type: 'assigned',
    });

    await lead.save();

    // Trigger push notification to newly assigned executive
    if (executive && executive !== 'Unassigned') {
      const executiveUser = await User.findOne({ name: executive });
      if (executiveUser && executiveUser.expoPushTokens.length > 0) {
        await sendPushNotification(
          executiveUser.expoPushTokens,
          'New Lead Assigned! ✈️',
          `Lead ${lead.name} for ${lead.destination} has been transferred to you.`,
          { leadId: lead.id }
        );
      }
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Universal webhook for Google Ads, Facebook Ads, and Website integration
// @route   POST /api/leads/webhook
exports.webhookLead = async (req, res) => {
  const { name, email, phone, destination, budget, source } = req.body;
  const today = new Date().toISOString().split('T')[0];

  try {
    // 1. Assign lead in round-robin fashion to Sales Executives
    const executives = await User.find({ role: 'Sales Executive' });
    let assignedName = 'Unassigned';
    let assignedUser = null;

    if (executives.length > 0) {
      // Choose an executive randomly or round-robin (random for this demo)
      const randomIndex = Math.floor(Math.random() * executives.length);
      assignedUser = executives[randomIndex];
      assignedName = assignedUser.name;
    }

    const activityHistory = [
      {
        id: `act-${Date.now()}-webhook`,
        text: `Lead captured via API integration from ${source || 'Website'}.`,
        date: today,
        type: 'status_change',
      }
    ];

    if (assignedName !== 'Unassigned') {
      activityHistory.push({
        id: `act-${Date.now()}-webhook-assign`,
        text: `Automatically assigned to Sales Executive ${assignedName}.`,
        date: today,
        type: 'assigned',
      });
    }

    const lead = await Lead.create({
      name: name || 'Inbound Lead Inquirer',
      email: email || 'inquiry@urbancruise.com',
      phone: phone || '+91 99999 99999',
      destination: destination || 'Europe Holiday Package',
      budget: budget || 'Not Specified',
      leadSource: source || 'Website',
      assignedExecutive: assignedName,
      leadStatus: 'New',
      activityHistory,
      createdDate: today,
    });

    // 2. Trigger push notification to assigned executive if they have a token registered
    if (assignedUser && assignedUser.expoPushTokens.length > 0) {
      await sendPushNotification(
        assignedUser.expoPushTokens,
        `New ${source || 'Website'} Lead Inbound! ✈️`,
        `${name || 'Customer'} submitted a new inquiry for ${destination || 'Europe'}.`,
        { leadId: lead.id }
      );
    }

    // Save notification log in DB
    await Notification.create({
      title: `New ${source || 'Website'} Lead`,
      body: `${name || 'Customer'} submitted a new inquiry for ${destination || 'Europe'}.`,
      timestamp: new Date().toISOString(),
      read: false,
      category: 'new_lead',
    });

    res.status(201).json({ success: true, leadId: lead.id, lead });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Log lead communication action (call, whatsapp, email)
// @route   POST /api/leads/:leadId/action
exports.logLeadAction = async (req, res) => {
  const { leadId } = req.params;
  const { actionType, detail } = req.body;
  const today = new Date().toISOString().split('T')[0];

  try {
    const lead = await Lead.findOne({ id: leadId });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    lead.activityHistory.push({
      id: `act-${Date.now()}-${actionType}`,
      text: `Initiated ${actionType}: ${detail}`,
      date: today,
      type: actionType,
    });

    await lead.save();
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
