/**
 * SmartMail AI — 100% Self-Contained Fictional Portfolio Demo Dataset
 * 
 * Clean, simple fictional emails with zero photo DPs.
 * User account: abc@gmail.com
 */

export const DEMO_USER = {
  id: 'demo_user_abc',
  name: 'abc',
  email: 'abc@gmail.com',
};

export const INITIAL_DEMO_EMAILS = [
  {
    id: 'demo_email_01',
    sender: {
      name: 'Sarah Chen',
      email: 'sarah.chen@example.com',
    },
    recipient: 'abc@gmail.com',
    subject: 'Invitation: Final Round Technical Interview — Frontend Engineering Intern',
    date_display: '9:42 AM',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 min ago
    is_read: false,
    is_starred: true,
    needs_action: true,
    category: 'Work',
    priority: 'Urgent',
    summary: 'The engineering team was impressed with your frontend take-home assignment and invited you to a 3-part final interview this Thursday.',
    action_text: 'Confirm interview availability for Thursday by 5 PM',
    action_deadline: 'Today by 5:00 PM',
    ai_reasons: [
      'Direct recruitment invitation for late-stage internship hiring',
      'Time-sensitive confirmation required before 5:00 PM today',
      'High-impact career opportunity'
    ],
    gmail_labels: ['INBOX', 'IMPORTANT', 'UNREAD', 'Interviews', 'Category: Updates'],
    organized_status: true,
    body_text: `Hello,

Thank you for your patience while our engineering team reviewed your take-home submission and design component architecture. The evaluation committee was very impressed with your state management structure and clean CSS tokens!

We would love to invite you to our final round interview for the Frontend Engineering Intern position.

Here is the proposed schedule for this Thursday:

• 10:00 AM – 10:45 AM: Component Architecture & State Modeling (with Lead Engineer)
• 11:00 AM – 11:45 AM: Interactive Design Systems & Glassmorphism (with Product Designer)
• 12:00 PM – 12:30 PM: Engineering Culture & Internship Scope (with Engineering Manager)

Please let me know if this Thursday schedule works for your timezone, or if you require an alternative time on Friday morning. Please confirm your availability by 5:00 PM today so we can issue your calendar invites and technical briefing packet.

Looking forward to hearing from you!

Warm regards,

Sarah Chen
University Talent Acquisition | Tech Systems Inc.
sarah.chen@example.com`
  },
  {
    id: 'demo_email_02',
    sender: {
      name: 'Prof. Robert Miller',
      email: 'robert.miller@example.com',
    },
    recipient: 'abc@gmail.com',
    subject: 'CS 482: Distributed Systems Final Milestone Due Friday (11:59 PM)',
    date_display: '8:15 AM',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    is_read: false,
    is_starred: false,
    needs_action: true,
    category: 'Work',
    priority: 'Important',
    summary: 'Milestone 2 for Distributed Systems is due Friday at 11:59 PM covering Raft consensus, heartbeat simulation, and partitioned test clusters.',
    action_text: 'Submit Milestone 2 codebase & test report on course portal',
    action_deadline: 'Friday, 11:59 PM',
    ai_reasons: [
      'Academic project deadline with strict submission cutoff',
      'Contains cluster test requirements and grading rubrics'
    ],
    gmail_labels: ['INBOX', 'IMPORTANT', 'UNREAD', 'University', 'Academics'],
    organized_status: true,
    body_text: `Hello CS 482 Students,

This is a reminder that Milestone 2 (Raft Consensus Implementation & Fault Tolerance) is due this Friday at 11:59 PM.

Key deliverables for this milestone:
1. Leader Election & Heartbeat: Node state transitions must pass all partitioned cluster unit tests without race conditions.
2. Log Replication: Uncommitted entries must be safely truncated upon leader reassignment.
3. Automated Benchmarking: Include benchmark logs from the test cluster allocated to your group.

Your test cluster endpoints and temporary SSH credentials have been uploaded to the course portal under /assignments/milestone-2/creds.

Please ensure your repository is tagged with 'v0.2.0-milestone2' before submitting your portal link. Late submissions will incur a 10% penalty per 24-hour period.

Office hours are held daily from 3 PM to 5 PM in Hall Room 392 if your group encounters Raft split-vote deadlocks.

Best of luck,

Prof. Robert Miller
Department of Computer Science`
  },
  {
    id: 'demo_email_03',
    sender: {
      name: 'Maya Chen',
      email: 'maya.chen@example.com',
    },
    recipient: 'abc@gmail.com',
    subject: 'Sprint Planning & Design System Review (10:30 AM Tomorrow)',
    date_display: 'Yesterday',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    is_read: true,
    is_starred: true,
    needs_action: true,
    category: 'Work',
    priority: 'Important',
    summary: 'Maya finalized the Figma glassmorphic tokens and requested review on Pull Request #142 before tomorrow\'s sprint demo at 10:30 AM.',
    action_text: 'Review and approve PR #142 on code repository',
    action_deadline: 'Tomorrow by 10:30 AM',
    ai_reasons: [
      'Team design collaboration blocking tomorrow’s release sprint',
      'Direct mention requesting review on PR #142'
    ],
    gmail_labels: ['INBOX', 'IMPORTANT', 'Design', 'Work'],
    organized_status: true,
    body_text: `Hi,

I just wrapped up the final component kit for the V2 release! We refined the rose gold and blush palette tokens so that cards have that subtle 10px backdrop blur with 1px border highlights.

Could you please take a look at Pull Request #142 on our repo?
• I updated the CSS custom properties in tokens.css to reflect the new hsl curves.
• Checked contrast ratios for WCAG AA compliance across both light canvas and elevated cards.
• Re-centered the icon containers on summary stat cards as we discussed yesterday.

If everything looks solid to you, let's approve and merge it into main before our team sprint review tomorrow at 10:30 AM.

Figma spec link: design.example.com/smartmail-v2-system
PR #142: repo.example.com/frontend/pull/142

Thanks a ton!

Maya Chen
Lead Product Designer`
  },
  {
    id: 'demo_email_04',
    sender: {
      name: 'GitHub Notifications',
      email: 'notifications@example.com',
    },
    recipient: 'abc@gmail.com',
    subject: '[SmartMail/frontend] PR #142: Glassmorphic UI tokens passed CI tests',
    date_display: 'Yesterday',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    is_read: true,
    is_starred: false,
    needs_action: true,
    category: 'Work',
    priority: 'Normal',
    summary: 'Automated CI workflow completed with 18 unit tests passing, zero lint errors, and 2 approvals ready for merge.',
    action_text: 'Merge pull request #142 into main branch',
    action_deadline: 'Today',
    ai_reasons: [
      'Automated code repository alert',
      'CI test status notification ready for deployment'
    ],
    gmail_labels: ['INBOX', 'GitHub', 'Category: Updates'],
    organized_status: true,
    body_text: `Continuous Integration Workflow Run Succeeded

Repository: SmartMail/frontend
Branch: feature/glassmorphic-tokens
Pull Request: #142 Add glassmorphic theme tokens and centered icon containers
Triggered by: @mayachen-design

Workflow: CI Build & Automated Tests
Status: Completed in 1m 42s
Test Results: 18 passed, 0 failed, 0 skipped
Bundle Analysis: 142.4 kB gzip (0.2% decrease)
Approvals: 2 / 2 reviewers approved

All required status checks have passed. This branch is clean and ready to merge into main.

View Run Details: repo.example.com/actions/runs/9842104`
  },
  {
    id: 'demo_email_05',
    sender: {
      name: 'Finance Desk',
      email: 'finance@example.com',
    },
    recipient: 'abc@gmail.com',
    subject: 'Invoice #INV-2026-8941: Cloud Compute Cluster Usage ($148.50)',
    date_display: 'Yesterday',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    is_read: false,
    is_starred: false,
    needs_action: true,
    category: 'Finance',
    priority: 'Urgent',
    summary: 'Cloud compute statement of $148.50 for GPU model inference and vector database storage is due; payment card update required.',
    action_text: 'Update payment card & settle $148.50 invoice',
    action_deadline: 'Tomorrow by 5:00 PM',
    ai_reasons: [
      'Financial invoice with outstanding balance ($148.50)',
      'Service disruption warning if card is not updated',
      'Actionable payment deadline'
    ],
    gmail_labels: ['INBOX', 'IMPORTANT', 'UNREAD', 'Finance', 'Billing'],
    organized_status: true,
    body_text: `Hello,

Thank you for choosing CloudCompute for your development and model inference clusters.

Your monthly usage statement for the billing cycle ending Oct 2nd is now available:

Invoice Number: INV-2026-8941
Account ID: CC-99482-ABC
Total Due: $148.50 USD
Due Date: October 6, 2026

Summary of Charges:
• A100 GPU Inference Instance (72 hours): $98.00
• Managed Vector Database Storage (50GB): $28.50
• Outbound Bandwidth & Fast Edge CDN: $22.00

Note: We attempted to charge your card on file, but the transaction was declined (Card Expired). Please navigate to your CloudCompute Billing Portal to update your payment details by tomorrow to ensure uninterrupted API access.

View invoice: billing.example.com/invoices/INV-2026-8941

Best regards,
Finance Operations Team
CloudCompute Inc.`
  },
  {
    id: 'demo_email_06',
    sender: {
      name: 'Airbnb Reservations',
      email: 'reservations@example.com',
    },
    recipient: 'abc@gmail.com',
    subject: 'Reservation Confirmed: Waterfront Loft in Seattle (Oct 18–22, 2026)',
    date_display: 'Oct 2',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString(),
    is_read: true,
    is_starred: true,
    needs_action: false,
    category: 'Personal',
    priority: 'Normal',
    summary: 'Seattle waterfront loft booking is confirmed for Oct 18–22 with keyless door code 4821# and check-in instructions.',
    action_text: 'Save door code (4821#) & check-in guide',
    action_deadline: 'Oct 18, 3:00 PM',
    ai_reasons: [
      'Personal travel booking confirmation',
      'Contains stay dates, access codes, and host details'
    ],
    gmail_labels: ['INBOX', 'Personal', 'Travel', 'Category: Updates'],
    organized_status: true,
    body_text: `You're all set for Seattle!

Your reservation is confirmed. Host Elena is preparing the loft for your arrival.

Trip Details:
• Property: Sunny Waterfront Loft with Space Needle Views
• Check-in: Sunday, October 18, 2026 (After 3:00 PM)
• Check-out: Thursday, October 22, 2026 (Before 11:00 AM)
• Confirmation Code: HM892KLA
• Door Access: Keypad code is 4821# (active from 3 PM on check-in day)

House Rules & Parking:
- Dedicated parking spot #14 in the underground garage
- High-speed fiber Wi-Fi (Network: Loft_Guest_5G / Pass: emeraldcity26)
- Quiet hours begin at 10:00 PM

If you need early check-in or recommendations for coffee shops near Pike Place Market, message Elena directly in the app.

Enjoy your trip to Seattle!
The Reservations Team`
  },
  {
    id: 'demo_email_07',
    sender: {
      name: 'Figma Talent Team',
      email: 'careers@example.com',
    },
    recipient: 'abc@gmail.com',
    subject: 'Update regarding your Product Engineering Application',
    date_display: 'Oct 2',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    is_read: true,
    is_starred: false,
    needs_action: false,
    category: 'Work',
    priority: 'Normal',
    summary: 'Figma recruiting confirmed receipt of your updated portfolio and shared positive notes from the initial engineering review.',
    action_text: '',
    action_deadline: '',
    ai_reasons: [
      'Job application status update',
      'Informational hiring communication'
    ],
    gmail_labels: ['INBOX', 'Careers', 'Category: Updates'],
    organized_status: true,
    body_text: `Hi,

Thank you for your continued interest in the Product Engineering role.

We wanted to let you know that our hiring committee has completed their review of your updated portfolio and web application case studies. The team was especially enthusiastic about your focus on latency reduction and accessible component architecture.

Our recruiter will reach out early next week with specific details regarding team matching and next steps in our hiring cycle.

Thank you again for sharing your work with us!

Best regards,
Figma Talent Team`
  },
  {
    id: 'demo_email_08',
    sender: {
      name: 'Marcus Vance',
      email: 'recruiting@example.com',
    },
    recipient: 'abc@gmail.com',
    subject: 'Quick follow-up on your technical portfolio & UI architecture',
    date_display: 'Oct 1',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    is_read: false,
    is_starred: true,
    needs_action: true,
    category: 'Work',
    priority: 'Important',
    summary: 'Marcus followed up on your portfolio discussion to see if you have 15 minutes for an introductory sync regarding full-stack AI roles.',
    action_text: 'Reply to Marcus with preferred times for an introductory call',
    action_deadline: 'This week',
    ai_reasons: [
      'Recruiter follow-up regarding active engineering openings',
      'Direct scheduling request'
    ],
    gmail_labels: ['INBOX', 'IMPORTANT', 'UNREAD', 'Recruiting'],
    organized_status: true,
    body_text: `Hello,

Hope you're having a productive week!

I came across your recent work on AI-powered productivity tools and was really impressed by the clean visual hierarchy and responsive micro-animations in your SmartMail interface.

Our engineering team is actively expanding our Core Product pod, and your background in React state architecture and modern CSS systems seems like a great match.

Would you be open to a casual 15-minute intro chat sometime this week? I'd love to learn more about what you're looking for in your next role and share what we're building.

Let me know what times work best for you!

Best,
Marcus Vance
Lead Technical Recruiter
recruiting@example.com`
  },
  {
    id: 'demo_email_09',
    sender: {
      name: 'Smart Interfaces Weekly',
      email: 'digest@example.com',
    },
    recipient: 'abc@gmail.com',
    subject: 'Issue #184: Designing Fast AI Micro-Interactions & Optimistic UI',
    date_display: 'Sep 30',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    is_read: true,
    is_starred: false,
    needs_action: false,
    category: 'Other',
    priority: 'Low',
    summary: 'Weekly tech editorial exploring progressive disclosure, optimistic UI updates, and micro-animations in generative AI applications.',
    action_text: '',
    action_deadline: '',
    ai_reasons: [
      'Long-form weekly industry newsletter',
      'No action required — informational reading'
    ],
    gmail_labels: ['INBOX', 'Newsletters', 'Category: Updates'],
    organized_status: true,
    body_text: `Smart Interfaces Weekly — Issue #184

"How Leading AI Products Design Fast & Delightful Micro-Interactions"

When building AI-powered web applications, perceptual speed often matters more than raw benchmark latency. In this week's issue, we break down 5 design patterns used by top design engineering teams:

1. Optimistic Local State Transitions
Don't freeze the UI while waiting for remote confirmation. Update badges, category tags, and counters instantly, reconciling state smoothly in the background.

2. Soft Curated Color Palettes
Using refined tones like rose gold, warm blush, and soft lilac creates a calm reading environment for dense email dashboards.

3. Contextual Draft Synthesis
Rather than generic chatbots, contextual single-click draft helpers that understand the sender's constraints reduce user friction by over 70%.

4. Welcoming Delight & Playful Mascots
A brief, tasteful greeting mascot creates an emotional connection without getting in the way of power users.

Read the full breakdown: digest.example.com/issue-184-ai-ux

Until next week,
The Editorial Desk`
  },
  {
    id: 'demo_email_10',
    sender: {
      name: 'Cloud Tools Community',
      email: 'offers@example.com',
    },
    recipient: 'abc@gmail.com',
    subject: 'Autumn Special: 40% discount on Pro Developer Subscriptions',
    date_display: 'Sep 29',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    is_read: false,
    is_starred: false,
    needs_action: false,
    category: 'Promotions',
    priority: 'Low',
    summary: 'Cloud Tools is offering 40% off annual professional workspaces and hosting a live workshop on advanced design variables.',
    action_text: '',
    action_deadline: '',
    ai_reasons: [
      'Commercial marketing email with promotional discount code',
      'Low urgency promotional announcement'
    ],
    gmail_labels: ['INBOX', 'Category: Promotions', 'UNREAD'],
    organized_status: true,
    body_text: `Supercharge your development workflow this autumn!

For a limited time, upgrade your workspace to Developer Pro and save 40% on your first annual subscription.

What's included in Pro:
✓ Unlimited cloud environments and version history
✓ Shared team component libraries and design variables
✓ Real-time telemetry, logs, and automated code inspection
✓ Advanced interactive state logic and cloud build pipelines

Join our free live workshop:
"Architecting Enterprise Design Systems with Tokens & Micro-Interactions"
Thursday, October 15th at 10:00 AM PST.

Claim your discount code 'AUTUMN40' at checkout before October 31st.

Happy coding!
The Community Team`
  },
  {
    id: 'demo_email_11',
    sender: {
      name: 'Elena Rostova',
      email: 'elena@example.com',
    },
    recipient: 'abc@gmail.com',
    subject: 'Saturday rooftop dinner & birthday celebration for Marcus! 🎂',
    date_display: 'Sep 28',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 144).toISOString(),
    is_read: true,
    is_starred: false,
    needs_action: false,
    category: 'Personal',
    priority: 'Normal',
    summary: 'Elena is organizing Marcus\'s birthday dinner at Cielo Rooftop this Saturday at 7:30 PM; please confirm attendance by Thursday.',
    action_text: 'RSVP to Elena for Marcus\'s dinner',
    action_deadline: 'Thursday, 6:00 PM',
    ai_reasons: [
      'Personal social invitation from a friend',
      'Casual RSVP request for weekend group dinner'
    ],
    gmail_labels: ['INBOX', 'Personal', 'Friends'],
    organized_status: true,
    body_text: `Hey!

We are putting together a surprise birthday dinner for Marcus this Saturday, October 10th, and really hope you can make it!

Here is the plan:
• Where: Cielo Rooftop Restaurant (Downtown)
• Time: 7:30 PM (Marcus thinks he's just grabbing drinks with me at 8:00 PM, so please arrive by 7:15 PM so we're all seated!)
• Gift: We started a group split for the mechanical keyboard he's been eyeing.

Could you let me know by Thursday if you can come so I can finalize our table headcount with the restaurant?

Can't wait to catch up!

Elena`
  },
  {
    id: 'demo_email_12',
    sender: {
      name: 'Cloud Security Alert',
      email: 'security@example.com',
    },
    recipient: 'abc@gmail.com',
    subject: '[Security Alert] New Service Account Key Generated for project smartmail',
    date_display: 'Sep 27',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString(),
    is_read: false,
    is_starred: false,
    needs_action: true,
    category: 'Other',
    priority: 'Urgent',
    summary: 'A new JSON private key was generated for service account worker@smartmail-prod; verify this credential activity immediately.',
    action_text: 'Verify audit log and revoke key if unrecognized',
    action_deadline: 'Immediate',
    ai_reasons: [
      'High-priority automated security notification',
      'Production credential modification event',
      'Immediate verification recommended'
    ],
    gmail_labels: ['INBOX', 'IMPORTANT', 'UNREAD', 'Security', 'Category: Updates'],
    organized_status: true,
    body_text: `Cloud Infrastructure Security Notification

Project: smartmail-prod (ID: smartmail-prod-78921)
Service Account: worker@smartmail-prod.iam.example.com
Event: Service Account Key Creation (JSON format)
Actor: abc@gmail.com
IP Address: 198.51.100.44
Timestamp: 2026-09-27T16:28:10 UTC

A new private key (Key ID: 8f92ab3c4d...) was successfully generated and downloaded for the service account listed above.

What you should do:
1. If you initiated this credential generation for local development or CI deployment, no further action is necessary.
2. If you did not perform this action, visit the IAM Security console immediately to revoke this key and rotate all active session tokens.

IAM Console: console.example.com/iam-admin/keys

Thank you,
Cloud Security Operations Team`
  },
  {
    id: 'demo_email_13',
    sender: {
      name: 'Engineering Leadership',
      email: 'team@example.com',
    },
    recipient: 'abc@gmail.com',
    subject: 'Q4 Engineering Roadmap & AI Model Optimization Kickoff',
    date_display: 'Sep 26',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 192).toISOString(),
    is_read: true,
    is_starred: false,
    needs_action: false,
    category: 'Work',
    priority: 'Normal',
    summary: 'Engineering leadership announced the Q4 priorities focusing on client-side caching, vector latency reduction, and accessibility.',
    action_text: '',
    action_deadline: '',
    ai_reasons: [
      'Company-wide engineering announcement',
      'Roadmap overview for the upcoming quarter'
    ],
    gmail_labels: ['INBOX', 'Work', 'Announcements'],
    organized_status: true,
    body_text: `Team,

Welcome to Q4! Over the last quarter, we achieved 99.9% uptime and reduced email classification latency down to 320ms.

Key Priorities for Q4:
1. Client-Side Optimistic State: Transitioning all category, priority, and resolved state changes to instant local reconciliation.
2. Design Token Consolidation: Standardizing our rose-gold glassmorphic palette across all dialogs, chips, and modals.
3. Expanded Test Coverage: Ensuring our automated suite tests edge-case parsing of multipart email payloads.

Join our all-hands kickoff meeting on Monday at 9:00 AM PST for Q&A.

Best,
Engineering Leadership Team`
  },
  {
    id: 'demo_email_14',
    sender: {
      name: 'University Registrar',
      email: 'registrar@example.com',
    },
    recipient: 'abc@gmail.com',
    subject: 'Spring 2027 Course Registration Window Opens Monday at 8:00 AM',
    date_display: 'Sep 25',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 216).toISOString(),
    is_read: false,
    is_starred: false,
    needs_action: true,
    category: 'Work',
    priority: 'Important',
    summary: 'Course registration for Spring 2027 begins Monday morning; clear any outstanding advisor holds prior to your enrollment window.',
    action_text: 'Review course schedule and verify registration holds',
    action_deadline: 'Monday, 8:00 AM',
    ai_reasons: [
      'University academic registration milestone',
      'Time-sensitive enrollment window with potential capacity limits'
    ],
    gmail_labels: ['INBOX', 'University', 'UNREAD'],
    organized_status: true,
    body_text: `Dear Student,

Your enrollment appointment for the Spring 2027 academic term has been assigned:

Registration Opens: Monday, October 19, 2026 at 8:00 AM PST
Maximum Credits: 18.0 units

Before your appointment time:
1. Log into your Student Portal and verify that you have zero advising or balance holds on your record.
2. Populate your course cart with your primary classes and at least 2 alternate electives.
3. Review prerequisites for CS 494 (Advanced Distributed Systems) and CS 430 (Human-Computer Interaction).

If you require departmental approval for an independent study or research project, submit your faculty approval form by Friday at 5:00 PM.

Office of the University Registrar`
  },
  {
    id: 'demo_email_15',
    sender: {
      name: 'Jane Doe',
      email: 'talent@example.com',
    },
    recipient: 'abc@gmail.com',
    subject: 'Next Steps: Complete the 45-minute Technical Assessment',
    date_display: 'Sep 24',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 240).toISOString(),
    is_read: false,
    is_starred: true,
    needs_action: true,
    category: 'Work',
    priority: 'Urgent',
    summary: 'Invitation to complete a 45-minute practical coding assessment on algorithms and frontend component design within 48 hours.',
    action_text: 'Complete 45-min technical assessment link',
    action_deadline: 'Within 48 hours',
    ai_reasons: [
      'Time-sensitive recruitment assessment with 48-hour expiration',
      'Critical step in technical internship candidate evaluation'
    ],
    gmail_labels: ['INBOX', 'IMPORTANT', 'UNREAD', 'Interviews', 'Careers'],
    organized_status: true,
    body_text: `Hello,

Thank you for applying for the Summer 2027 Software Engineering Internship!

We have reviewed your application and would like to invite you to take our 45-minute online technical assessment. The assessment focuses on practical data structure operations and component state design.

Instructions:
• The assessment takes approximately 45 minutes to complete.
• You can take it at any time within the next 48 hours.
• You may use your preferred language (TypeScript, JavaScript, or Python).

Assessment Link: tests.example.com/assess/token-994821a

If you need any special accommodations or have technical difficulties, feel free to reply directly to this message.

Good luck!

Jane Doe
Technical Recruiting Coordinator | Talent Team`
  }
];

export function getInitialDemoEmails() {
  const cached = localStorage.getItem('smartmail_demo_emails');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Fallback
    }
  }
  return INITIAL_DEMO_EMAILS;
}

export function saveDemoEmails(emails) {
  try {
    localStorage.setItem('smartmail_demo_emails', JSON.stringify(emails));
  } catch {
    // Ignore storage quota limits
  }
}

export function resetDemoEmails() {
  localStorage.removeItem('smartmail_demo_emails');
  return INITIAL_DEMO_EMAILS;
}

export function calculateDemoSummary(emails = INITIAL_DEMO_EMAILS, customCategories = []) {
  const total = emails.length;
  const unreadCount = emails.filter((e) => !e.is_read).length;
  const importantCount = emails.filter((e) => e.priority === 'Urgent' || e.priority === 'Important').length;
  const needsActionCount = emails.filter((e) => e.needs_action).length;
  const organizedCount = emails.filter((e) => e.organized_status).length;

  const defaultNames = ['Work', 'Personal', 'Finance', 'Promotions', 'Social', 'Other'];
  const allCategoryNames = Array.from(new Set([...defaultNames, ...(customCategories || [])]));

  const categories = allCategoryNames.map((cat) => {
    const matching = emails.filter((e) => (e.category || '').toLowerCase() === cat.toLowerCase());
    const unread = matching.filter((e) => !e.is_read).length;
    const sorted = [...matching].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recent = sorted[0];

    return {
      name: cat,
      count: matching.length,
      unread_count: unread,
      recent_subject: recent ? recent.subject : null,
      recent_sender: recent ? recent.sender?.name : null,
      is_custom: !defaultNames.includes(cat),
    };
  });

  return {
    total_emails: total,
    unread_count: unreadCount,
    important_count: importantCount,
    needs_action_count: needsActionCount,
    organized_count: organizedCount,
    categories,
    ai_insight: `You have ${needsActionCount} action items in your inbox, including an urgent internship interview confirmation and an academic milestone submission.`,
    last_synced_at: new Date().toISOString(),
  };
}

export function getDemoSettings() {
  const defaultSettings = {
    custom_categories: ['Interviews', 'University', 'Design'],
    email_limit: 15,
    auto_classify: true,
    notifications: {
      desktop_push: true,
      urgent_alerts: true,
      daily_briefing: true,
      action_reminders: true,
      sound_effects: false,
    },
  };

  const cached = localStorage.getItem('smartmail_demo_settings');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      return {
        ...defaultSettings,
        ...parsed,
        notifications: {
          ...defaultSettings.notifications,
          ...(parsed.notifications || {}),
        },
      };
    } catch {}
  }
  return defaultSettings;
}

export function saveDemoSettings(settings) {
  try {
    localStorage.setItem('smartmail_demo_settings', JSON.stringify(settings));
  } catch {}
}

/**
 * Generates realistic contextual AI reply drafts instantly for demo mode
 */
export function generateDemoDraft(emailId, intent = 'Follow-up', customPrompt = '', emails = INITIAL_DEMO_EMAILS) {
  const target = emails.find((e) => e.id === emailId);
  const senderName = target?.sender?.name?.split(' ')[0] || 'there';
  const subject = target ? `Re: ${target.subject.replace(/^Re:\s*/i, '')}` : 'New Message';

  let body = '';
  let smartTip = 'SmartMail AI aligned this draft with the tone of the sender.';

  if (target?.id === 'demo_email_01') {
    // Interview confirmation
    body = `Hi ${senderName},

Thank you so much for the exciting update and for the positive feedback from the team!

I would be delighted to confirm the proposed schedule for this Thursday:
• 10:00 AM – 10:45 AM: Component Architecture & State Modeling
• 11:00 AM – 11:45 AM: Interactive Design Systems & Glassmorphism
• 12:00 PM – 12:30 PM: Engineering Culture & Internship Scope

This timeframe works perfectly for me. Please feel free to send over the meeting links and technical briefing packet.

Looking forward to meeting the team on Thursday!

Best regards,`;
    smartTip = 'Identified time-sensitive interview confirmation. Kept tone professional and confirmed all 3 interview blocks.';
  } else if (target?.id === 'demo_email_02') {
    // CS 482 milestone
    body = `Hello Prof. Morgan,

Thank you for sharing the Milestone 2 rubric and cluster credentials.

Our team has verified cluster connectivity and successfully passed the partition fault-tolerance tests locally. We are running the final benchmark suite today and will have our codebase tagged ('v0.2.0-milestone2') and submitted on the course portal well before Friday's 11:59 PM deadline.

Best regards,
(Group 4)`;
    smartTip = 'Included group assignment context, milestone tag confirmation, and acknowledged deadline.';
  } else if (target?.id === 'demo_email_03') {
    // Maya Chen PR #142
    body = `Hey ${senderName},

The new glassmorphic tokens look stunning! I went through PR #142 and tested the custom properties across the summary stat cards and modals.

The 10px backdrop blur and centered icon containers work seamlessly, and contrast tests pass with flying colors. I just submitted my review and approved the PR so we are all set to merge before tomorrow's 10:30 AM sprint sync!

Cheers!`;
    smartTip = 'Acknowledged PR #142 review, confirmed token verification, and referenced sprint sync.';
  } else if (target?.id === 'demo_email_05') {
    // Billing invoice
    body = `Hello Finance Support,

Thank you for the notification regarding Invoice #INV-2026-8941.

I have updated our payment card via the billing portal and processed the outstanding balance of $148.50. Please confirm receipt and verify that our cluster services remain active.

Thank you!`;
    smartTip = 'Acknowledged invoice number, confirmed card update, and verified payment amount.';
  } else if (target?.id === 'demo_email_08') {
    // Recruiter Marcus
    body = `Hi ${senderName},

Thanks for reaching out and for the kind words on my recent AI interface projects!

I'd be glad to connect for a 15-minute introductory chat. I have good availability on Thursday at 2:00 PM PST or Friday between 10:00 AM and 1:00 PM PST.

Please let me know if either of those times works for you and I will look forward to the conversation.

Best regards,`;
    smartTip = 'Provided clear availability slots for easy scheduling.';
  } else if (target?.id === 'demo_email_15') {
    // Jane Doe 45-min assessment
    body = `Hi ${senderName},

Thank you for the invitation to take the technical assessment!

I have received the link and will complete the assessment this evening within the 48-hour window. I appreciate the clear instructions regarding language choices.

Best regards,`;
    smartTip = 'Confirmed receipt and commitment to complete the assessment within the specified timeframe.';
  } else if (intent === 'Meeting') {
    body = `Hi ${senderName},

Thanks for reaching out! I would be glad to meet and discuss this further.

I have good availability on Thursday at 2:00 PM PST or Friday morning between 10:00 AM and 12:00 PM PST. Please let me know if either of those slots works on your end.

Best regards,`;
    smartTip = 'Proposed clear, concrete time slots for smooth scheduling.';
  } else if (intent === 'Proposal' || intent === 'Updates') {
    body = `Hi ${senderName},

Here is a quick update on our recent progress:
• Completed initial implementation and verified all unit tests
• Coordinated with design to ensure full token alignment
• Prepared the staging deployment for team review

Let me know if you have any questions or feedback!

Best,`;
    smartTip = 'Structured update using bullet points for high readability.';
  } else {
    // Generic follow-up
    body = `Hi ${senderName},

${customPrompt ? `Following up regarding your note: "${customPrompt}".\n\n` : ''}Thank you for your message. Everything looks great on my end, and I will follow up with any additional details shortly.

Please feel free to reach out if you need anything else in the meantime!

Best regards,`;
    smartTip = 'Polite, clear follow-up response tailored for quick communication.';
  }

  return {
    subject,
    body,
    smart_tip: smartTip,
  };
}
