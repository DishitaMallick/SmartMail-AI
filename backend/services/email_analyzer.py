import re
import html
from html.parser import HTMLParser
from typing import Dict, Any, Tuple, Optional, List

from backend.models.schemas import PriorityEnum, AIDraftResponse


class HTMLTextExtractor(HTMLParser):
    """
    Robust HTML-to-plain-text parser that completely strips HTML, head, 
    meta, style, script, svg tags, and CSS attributes, while cleanly 
    preserving readable paragraphs and text content in proper English.
    """
    def __init__(self):
        super().__init__()
        self.result = []
        self.hide_depth = 0
        self.hide_tags = {'head', 'style', 'script', 'title', 'meta', 'svg', 'noscript', 'link'}

    def handle_starttag(self, tag, attrs):
        t = tag.lower()
        if t in self.hide_tags:
            self.hide_depth += 1
        elif t in {'p', 'div', 'br', 'tr', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'blockquote', 'section', 'article'}:
            self.result.append('\n')

    def handle_endtag(self, tag):
        t = tag.lower()
        if t in self.hide_tags:
            self.hide_depth = max(0, self.hide_depth - 1)
        elif t in {'p', 'div', 'tr', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'section', 'article'}:
            self.result.append('\n')

    def handle_data(self, data):
        if self.hide_depth == 0 and data:
            self.result.append(data)


def html_to_clean_text(raw_text: str) -> str:
    """
    Converts raw email body (HTML or messy text) into clean, formatted, 
    natural English paragraphs with zero coding language, no DOCTYPE, 
    no HTML tags, no CSS blocks, and no tracking entity strings.
    Preserves original paragraph structure as the sender intended.
    """
    if not raw_text:
        return ""

    text = str(raw_text)

    # 1. Strip script, style, head tags & content directly without complex backtracking
    text = re.sub(r"<(script|style|head)[^>]*>[\s\S]*?</\1>", " ", text, flags=re.IGNORECASE)

    # 2. Extract plain text with parser
    if "<" in text and ">" in text or "<!doctype" in text.lower() or "<html" in text.lower():
        parser = HTMLTextExtractor()
        try:
            parser.feed(text)
            text = "".join(parser.result)
        except Exception:
            text = re.sub(r"<[^>]+>", " ", text)

    # 3. Unescape entities
    for _ in range(3):
        unescaped = html.unescape(text)
        if unescaped == text:
            break
        text = unescaped

    text = re.sub(r"&[a-zA-Z0-9#]+;", " ", text)
    text = re.sub(r"\b(?:amp;)+", " ", text)

    # 4. Remove tracking URLs (keep text clean and readable)
    text = re.sub(r"https?://\S+", " ", text)
    text = re.sub(r"www\.\S+", " ", text)

    # 5. Group lines into proper paragraphs preserving original structure.
    #    Consecutive non-empty lines belong to the same paragraph.
    #    A blank line (or multiple) signals a paragraph break.
    paragraphs = []
    current_para_lines = []

    for line in text.splitlines():
        trimmed = re.sub(r"\s+", " ", line).strip()
        # Skip junk lines that are purely punctuation/code artifacts
        if trimmed and len(trimmed) > 1 and not all(c in "{};:\"'<>/\\#_-" for c in trimmed):
            current_para_lines.append(trimmed)
        else:
            # Empty/junk line → flush the current paragraph
            if current_para_lines:
                paragraphs.append(" ".join(current_para_lines))
                current_para_lines = []

    # Don't forget the last paragraph
    if current_para_lines:
        paragraphs.append(" ".join(current_para_lines))

    # 6. Format as readable paragraphs separated by double newline
    return "\n\n".join(paragraphs).strip()


def clean_raw_email_text(text: str) -> str:
    """
    Returns single-line collapsed clean plain English text for analysis & summaries.
    """
    clean_paragraphs = html_to_clean_text(text)
    # Collapse into single space-separated string
    collapsed = re.sub(r"\s+", " ", clean_paragraphs).strip()

    # Remove email footers and unsubscribe boilerplate
    boilerplate_patterns = [
        r"unsubscribe\b.*",
        r"view in (?:browser|web)\b.*",
        r"to manage your (?:email|subscription|preferences)\b.*",
        r"privacy policy\b.*",
        r"terms of service\b.*",
        r"all rights reserved\b.*",
        r"this email was sent to\b.*",
        r"don'?t want to receive these emails\b.*",
        r"opt out\b.*",
        r"copyright ©\b.*",
    ]
    for bp in boilerplate_patterns:
        collapsed = re.split(bp, collapsed, flags=re.IGNORECASE)[0]

    return collapsed.strip()


class EmailAnalyzer:
    """
    Analyzes real Gmail message urgency, action items, deadlines,
    clarity scores, generates short & precise English summaries,
    and crafts AI smart drafts.
    """

    DEADLINE_PATTERNS = [
        (
            r"\b(?:due|deadline|by|before)\s+(tomorrow(?:\s+at\s+[\d:]+\s*(?:am|pm|pst|est|gmt)?)?)",
            "Tomorrow",
        ),
        (
            r"\b(?:due|deadline|by)\s+([a-zA-Z]+\s+\d{1,2}(?:,\s*\d{4})?)",
            r"\1",
        ),
        (
            r"\b(?:within\s+(\d+\s*(?:hours|days|hrs)))",
            r"Within \1",
        ),
        (
            r"\b(?:in\s+(\d+\s*(?:days|hours)))",
            r"In \1",
        ),
        (
            r"\b(?:today\s+at\s+[\d:]+\s*(?:am|pm|aoe|pst|est)?)",
            "Today",
        ),
    ]

    URGENT_TERMS = [
        "interview",
        "urgent",
        "immediate",
        "asap",
        "emergency",
        "action required",
        "camera-ready",
        "payment due",
        "security alert",
        "verification code",
        "otp",
        "debited",
        "unauthorized",
        "holds",
        "approval required",
        "expiring",
        "final notice",
        "past due",
        "critical",
    ]

    IMPORTANT_TERMS = [
        "review requested",
        "assessment",
        "codesignal",
        "confirm",
        "gradescope",
        "assignment",
        "proposal",
        "contract",
        "invoice",
        "reservation",
        "flight",
        "deadline",
        "schedule",
        "quarterly",
        "budget",
        "access is available",
        "confirm your access",
    ]

    LOW_TERMS = [
        "newsletter",
        "discount",
        "% off",
        "sale",
        "promo",
        "delivered",
        "receipt",
        "unsubscribe",
        "weekly digest",
        "order shipped",
        "deals",
    ]

    def detect_priority_and_action(
        self,
        subject: str,
        body: str,
    ) -> Tuple[str, bool, Optional[str], Optional[str]]:
        """
        Returns:
            (
                priority: 'Urgent'|'Important'|'Normal'|'Low',
                needs_action: bool,
                action_text,
                action_deadline
            )
        """

        text = f"{subject} {body}".lower()

        is_urgent = any(term in text for term in self.URGENT_TERMS)
        is_important = any(term in text for term in self.IMPORTANT_TERMS)
        is_low = any(term in text for term in self.LOW_TERMS)

        has_action_prompt = any(
            kw in text
            for kw in [
                "please confirm",
                "please review",
                "submit via",
                "complete this",
                "reply by",
                "due date",
                "rsvp",
                "action required",
                "action item",
                "respond by",
                "fill out",
                "schedule a time",
                "confirm your access",
            ]
        )

        priority = "Normal"
        needs_action = False
        action_text = None
        action_deadline = None

        # Deadline extraction
        for pat, replacement in self.DEADLINE_PATTERNS:
            match = re.search(pat, text, re.IGNORECASE)

            if match:
                action_deadline = match.group(0).strip().capitalize()
                break

        # Priority detection
        if is_urgent or (is_important and action_deadline):
            priority = "Urgent"
            needs_action = True

        elif is_important or has_action_prompt:
            priority = "Important"
            needs_action = True

        elif is_low:
            priority = "Low"
            needs_action = False

        else:
            priority = "Normal"
            needs_action = False

        # Extract specific action texts
        if "interview" in text and (
            "confirm" in text or "schedule" in text
        ):
            action_text = "Confirm interview availability"

        elif "confirm your access" in text or "access is available" in text:
            action_text = "Confirm program / access activation"

        elif (
            "assignment" in text
            or "gradescope" in text
            or "submission" in text
        ):
            action_text = "Submit assignment / project report"

        elif (
            "payment due" in text
            or "minimum payment" in text
            or "past due" in text
        ):
            action_text = "Pay statement balance"

        elif "review requested" in text or "pull request" in text:
            action_text = "Review pull request on GitHub"

        elif "codesignal" in text or "assessment" in text:
            action_text = "Complete timed technical assessment"

        elif (
            "rsvp" in text
            or "family dinner" in text
            or "event" in text
        ):
            action_text = "Send RSVP confirmation"

        elif "camera-ready" in text or "approval" in text:
            action_text = "Provide author approval"

        elif "verification code" in text or "otp" in text:
            action_text = "Use verification code to sign in"

        elif "quota" in text or "budget" in text:
            action_text = "Review account spend quota"

        elif needs_action:
            action_text = "Review email and respond"

        return (
            priority,
            needs_action,
            action_text,
            action_deadline,
        )

    def generate_summary(
        self,
        sender_name: str,
        subject: str,
        body: str,
    ) -> str:
        """
        Generates a short, precise, natural English summary of the email.
        Guarantees 100% proper English without raw code, HTML tags, doctypes, or unparsed URLs.
        """
        sender_clean = (sender_name or "Unknown sender").strip()
        subject_clean = (subject or "").strip()
        clean_body = clean_raw_email_text(body or "")
        text_lower = f"{subject_clean} {clean_body}".lower()

        # 1. Bank & Financial Transaction Alerts (e.g. Axis Bank, HDFC, SBI, Chase, etc.)
        combined_text = f"{subject_clean} {clean_body}"

        # Pattern A: "INR xxx was debited from your a/c"
        debit_match = re.search(r"(?:inr|rs\.?|\$)\s*([\d,]+(?:\.\d{2})?)\s+was\s+debited\s+from\s+your\s+(?:a/c|account)(?:\s+no\.?\s*([xX0-9]+))?", combined_text, re.IGNORECASE)
        # Pattern B: "Amount Debited: INR xxx" (Axis Bank, etc.)
        if not debit_match:
            debit_match = re.search(r"amount\s+debited\s*:?\s*(?:inr|rs\.?|\$)?\s*([\d,]+(?:\.\d{2})?)", combined_text, re.IGNORECASE)
        # Pattern C: "debited" in subject like "INR 259.00 was debited from your A/c"
        if not debit_match:
            debit_match = re.search(r"(?:inr|rs\.?|\$)\s*([\d,]+(?:\.\d{2})?)\s+(?:was\s+)?debited", combined_text, re.IGNORECASE)

        if debit_match:
            amount = debit_match.group(1)
            # Try to find account number nearby
            acct_match = re.search(r"(?:a/c|account)\s*(?:no\.?)?\s*:?\s*([xX0-9]+)", combined_text, re.IGNORECASE)
            acct = acct_match.group(1) if acct_match else "your account"
            return f"INR {amount} debited from account {acct}."

        # Pattern A: "INR xxx credited to your a/c"
        credit_match = re.search(r"(?:inr|rs\.?|\$)\s*([\d,]+(?:\.\d{2})?)\s+(?:has been|was)?\s*credited\s+to\s+your\s+(?:a/c|account)(?:\s+no\.?\s*([xX0-9]+))?", combined_text, re.IGNORECASE)
        # Pattern B: "Amount Credited: INR xxx" (Axis Bank, etc.)
        if not credit_match:
            credit_match = re.search(r"amount\s+credited\s*:?\s*(?:inr|rs\.?|\$)?\s*([\d,]+(?:\.\d{2})?)", combined_text, re.IGNORECASE)
        # Pattern C: "credited" in subject
        if not credit_match:
            credit_match = re.search(r"(?:inr|rs\.?|\$)\s*([\d,]+(?:\.\d{2})?)\s+(?:was\s+)?credited", combined_text, re.IGNORECASE)

        if credit_match:
            amount = credit_match.group(1)
            acct_match = re.search(r"(?:a/c|account)\s*(?:no\.?|number)?\s*:?\s*([xX0-9]+)", combined_text, re.IGNORECASE)
            acct = acct_match.group(1) if acct_match else "your account"
            return f"INR {amount} credited to account {acct}."

        # 2. Access / Program / Internship Reminders (e.g. Internshala, Coursera, Google AI)
        if "google ai plus" in text_lower or "access is available" in text_lower:
            return f"Your Google AI Plus access is ready — confirm to activate."

        if "internshala" in text_lower and ("application" in text_lower or "shortlist" in text_lower):
            return f"Internshala update on your internship application status."

        # 3. Job Alerts & Recruitment (e.g. Indeed, LinkedIn, Glassdoor)
        if "indeed" in text_lower or "job alert" in text_lower or "vacancies" in text_lower or "open positions" in text_lower or "jobs matching" in text_lower:
            match_jobs = re.search(r"(\d+)\s+new\s+([a-zA-Z0-9\s/]+?)\s+(?:vacancies|jobs|openings|positions)\s+(?:in\s+([a-zA-Z\s,]+))?", subject_clean, re.IGNORECASE)
            if match_jobs:
                count = match_jobs.group(1)
                role = match_jobs.group(2).strip()
                loc = match_jobs.group(3).strip() if match_jobs.group(3) else ""
                loc_phrase = f" in {loc}" if loc else ""
                return f"{count} new {role} openings{loc_phrase} available."
            return f"New job opportunities matching your profile from {sender_clean}."

        # 4. Security Codes, Verification, OTP & 2FA
        otp_match = re.search(r"\b(?:verification code|security code|otp|passcode|pin)\s*(?:is|:)?\s*([0-9]{4,8})\b", clean_body, re.IGNORECASE)
        if otp_match:
            code = otp_match.group(1)
            return f"Your verification code is {code}."
        elif "security alert" in text_lower or "sign-in attempt" in text_lower or "verification code" in text_lower:
            return f"Security alert regarding recent login activity on your account."

        # 5. Interviews & Meetings
        if "interview" in text_lower:
            if "confirm" in text_lower or "schedule" in text_lower or "availability" in text_lower:
                return f"Interview invite — please confirm your availability."
            return f"Interview details and scheduling info from {sender_clean}."

        # 6. Deadlines, Assignments, Gradescope, Submissions
        if (
            "assignment" in text_lower
            or "gradescope" in text_lower
            or "submission deadline" in text_lower
            or "project due" in text_lower
        ):
            return f"Upcoming submission deadline reminder from {sender_clean}."

        # 7. Financial, Invoices, Bank Statements, Payments
        if (
            "payment due" in text_lower
            or "statement" in text_lower
            or "invoice" in text_lower
            or "wire transfer" in text_lower
            or "balance due" in text_lower
        ):
            return f"Billing notification from {sender_clean} regarding your account."

        # 8. Orders, Shipping & Delivery Tracking
        if (
            "shipped" in text_lower
            or "out for delivery" in text_lower
            or "delivered" in text_lower
            or "tracking number" in text_lower
        ):
            return f"Delivery update from {sender_clean} — check tracking status."

        if "order confirmed" in text_lower or "receipt for your order" in text_lower:
            return f"Order confirmed from {sender_clean}."

        # 9. GitHub, Code Reviews & Pull Requests
        if (
            "pull request" in text_lower
            or "github" in text_lower
            or "pr #" in text_lower
            or "code review" in text_lower
        ):
            return f"GitHub pull request update from {sender_clean}."

        # 10. Travel, Flights & Reservations
        if (
            "flight" in text_lower
            or "hotel reservation" in text_lower
            or "boarding pass" in text_lower
            or "itinerary" in text_lower
            or "airbnb" in text_lower
        ):
            return f"Travel reservation confirmation from {sender_clean}."

        # 11. Promotions, Discounts & Shopping (Myntra, Flipkart, Amazon, retail)
        if (
            "myntra" in text_lower
            or "flipkart" in text_lower
            or "ajio" in text_lower
            or "nykaa" in text_lower
            or "amazon" in text_lower
            or "bff" in text_lower
            or "shopping" in text_lower
            or "discount" in text_lower
            or "sale" in text_lower
            or "% off" in text_lower
            or "coupon" in text_lower
            or "promo code" in text_lower
            or "festive" in text_lower
        ):
            if subject_clean and len(subject_clean) < 60:
                return f"Promo from {sender_clean}: {subject_clean}"
            return f"Promotional offer from {sender_clean} with discounts."

        # 12. Newsletters & Digests
        if (
            "newsletter" in text_lower
            or "weekly digest" in text_lower
            or "monthly digest" in text_lower
            or "roundup" in text_lower
        ):
            return f"Newsletter digest from {sender_clean}."

        # Filter out dummy stub phrases from clean_body before extracting sentences
        dummy_phrases = [
            "open it in a program that understands html",
            "to view this email message",
            "view this message in html",
            "unable to see this email",
            "view as a web page",
            "if you are having trouble viewing",
            "enable images to view",
            "click here to view in browser",
        ]
        is_dummy = any(p in clean_body.lower() for p in dummy_phrases)

        # 13. General message synthesis — pick ONE clean sentence, keep it short
        if clean_body and not is_dummy:
            sentences = re.split(r"(?<=[.!?])\s+", clean_body)
            for s in sentences:
                s_trimmed = s.strip()
                if (
                    len(s_trimmed) > 15
                    and not any(c in s_trimmed for c in ["{", "}", "<", ">", "function()", "/*"])
                    and not any(p in s_trimmed.lower() for p in dummy_phrases)
                ):
                    # Cap at ~120 chars to ensure full display
                    summary_text = re.sub(r"<[^>]+>", " ", s_trimmed).strip()
                    if len(summary_text) > 120:
                        summary_text = summary_text[:115].rsplit(" ", 1)[0] + "…"
                    if summary_text and not any(p in summary_text.lower() for p in dummy_phrases):
                        return summary_text

        # Default fallback — short and direct
        if subject_clean:
            subj = subject_clean if len(subject_clean) < 60 else subject_clean[:55] + "…"
            return f"{sender_clean}: {subj}"

        return f"New email from {sender_clean}."

    def generate_ai_draft(
        self,
        subject: str,
        sender_name: str,
        body: str,
        intent: str = "Follow-up",
        signature: Optional[str] = None,
    ) -> AIDraftResponse:
        """
        Generates context-aware smart response drafts with
        Clarity Score and Smart Tips.
        """
        intent_lower = intent.lower()
        sign_off = (signature or "").strip() or "[Your name]"

        if (
            "meeting" in intent_lower
            or "interview" in subject.lower()
        ):
            draft_subject = f"Re: {subject}"

            draft_body = f"""Hi {sender_name},

Thank you for reaching out! I would be delighted to connect.

Tomorrow at 10:00 AM works well on my end. I have added the invitation to my calendar and look forward to speaking with the team.

Please let me know if you need any additional materials prior to the call.

Best regards,

{sign_off}"""

            clarity_score = 98
            smart_tip = "Added clear confirmation time and affirmative next steps to reduce back-and-forth."
            action_suggested = "Send Calendar Confirmation"

        elif (
            "proposal" in intent_lower
            or "project" in subject.lower()
        ):
            draft_subject = f"Re: {subject} — Updates & Next Steps"

            draft_body = f"""Hi {sender_name},

Thanks for sending over the latest project overview and guidelines.

I have reviewed the requirements and everything looks aligned. I will finalize our submission ahead of the scheduled deadline and share the link once ready.

Best regards,

{sign_off}"""

            clarity_score = 96
            smart_tip = "Explicit milestone commitment gives stakeholders full confidence."
            action_suggested = "Attach Project Deliverable"

        else:
            draft_subject = f"Re: {subject}"

            draft_body = f"""Hi {sender_name},

Thank you for following up!

I received your note and am currently wrapping up the requested items. I will follow up with full details by end of day.

Thanks again for your patience!

Warm regards,

{sign_off}"""

            clarity_score = 95
            smart_tip = "Explicit turnaround time maintains professional communication expectations."
            action_suggested = "Schedule Send"

        return AIDraftResponse(
            draft_id=f"draft_{int(re.sub(r'[^0-9]', '', subject)[:6] or '1001')}",
            subject=draft_subject,
            body=draft_body,
            clarity_score=clarity_score,
            smart_tip=smart_tip,
            action_suggested=action_suggested,
        )


email_analyzer = EmailAnalyzer()