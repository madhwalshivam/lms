const express = require('express');
const router = express.Router();
const { getLeads, createLead, updateLeadStatus, addLeadNote, assignLead, webhookLead, logLeadAction } = require('../controllers/leadController');

router.get('/', getLeads);
router.post('/', createLead);
router.put('/:leadId/status', updateLeadStatus);
router.post('/:leadId/notes', addLeadNote);
router.put('/:leadId/assign', assignLead);
router.post('/:leadId/action', logLeadAction);
router.post('/webhook', webhookLead);

module.exports = router;
