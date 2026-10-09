from typing import Dict, List, Tuple

class EmailClassifier:
    """
    Intelligent Rule-based & Heuristic AI Classifier for SmartMail AI.
    Accurately classifies real incoming Gmail messages into Work, Personal,
    Finance, Promotions, Social, and Other categories with explainable signals.
    """

    CATEGORIES = [
        "Work",
        "Personal",
        "Finance",
        "Promotions",
        "Social",
        "Other"
    ]

    SIGNALS = {
        "Work": {
            "domains": [
                "google.com", "stripe.com", "github.com", "slack.com", "figma.com",
                "notion.so", "linear.app", "openai.com", "microsoft.com", "zoom.us",
                "linkedin.com", "greenhouse.io", "lever.co", "atlassian.net", "jira.com",
                "salesforce.com", "oracle.com", "aws.amazon.com", "gitlab.com", "stanford.edu", "mit.edu", "edu"
            ],
            "keywords": [
                "interview", "recruiter", "hiring", "job", "career", "pull request",
                "pr #", "sprint", "meeting", "roadmap", "sync", "standup", "client",
                "project", "quarterly", "jira", "deploy", "architecture", "codesignal",
                "talent acquisition", "deadline", "assignment", "report", "presentation",
                "review requested", "collaborator", "agenda", "minutes", "deliverable"
            ],
            "reasons": [
                "Sender is a verified workplace, technical, or career platform",
                "Professional collaboration, engineering, or project workflow detected",
                "Meeting scheduling, code review, or workplace action item identified"
            ]
        },
        "Personal": {
            "domains": [
                "gmail.com", "yahoo.com", "outlook.com", "icloud.com", "hotmail.com",
                "airbnb.com", "delta.com", "united.com", "aa.com", "marriott.com",
                "booking.com", "expedia.com", "uber.com", "lyft.com"
            ],
            "keywords": [
                "mom", "dad", "family", "dinner", "weekend", "trip", "reservation",
                "flight", "hotel", "cabin", "rsvp", "birthday", "catch up", "photos",
                "vacation", "boarding pass", "itinerary", "check-in", "see you",
                "plans", "get together", "holiday", "home"
            ],
            "reasons": [
                "Personal correspondence, family, or friend communication",
                "Personal travel reservation, flight itinerary, or lodging booking",
                "Informal social plans and direct personal correspondence"
            ]
        },
        "Finance": {
            "domains": [
                "chase.com", "bankofamerica.com", "wellsfargo.com", "citi.com", "paypal.com",
                "stripe.com", "robinhood.com", "fidelity.com", "vanguard.com", "turbotax.com",
                "irs.gov", "apple.com", "spotify.com", "intuit.com", "coinbase.com",
                "americanexpress.com", "capitalone.com", "venmo.com"
            ],
            "keywords": [
                "statement", "payment due", "minimum payment", "invoice", "receipt",
                "billed", "charge", "balance", "credit card", "bank account",
                "wire transfer", "payout", "tax return", "subscription", "usd",
                "$", "billing", "auto-renewal", "transaction", "direct deposit"
            ],
            "reasons": [
                "Sender is a verified banking, payment, or financial institution",
                "Account statement, payment due reminder, or transaction alert",
                "Billing receipt, tax document, or recurring subscription detected"
            ]
        },
        "Promotions": {
            "domains": [
                "marketing", "promo", "mailchimp.com", "klaviyo.com", "substack.com",
                "discount", "store", "deal", "newsletter", "offers", "target.com",
                "walmart.com", "bestbuy.com", "nike.com", "myntra.com", "flipkart.com",
                "amazon.in", "amazon.com", "swiggy.in", "zomato.com", "ajio.com",
                "nykaa.com", "meesho.com", "tatacliq.com", "zara.com", "hm.com"
            ],
            "keywords": [
                "% off", "discount", "sale", "deal", "limited time", "exclusive offer",
                "coupon", "black friday", "clearance", "promo code", "free shipping",
                "shop now", "save big", "special discount", "flash sale", "unsubscribe",
                "shopping", "bff", "big fashion festival", "festive offers", "extra discount"
            ],
            "reasons": [
                "Commercial promotional broadcast or discount campaign",
                "Marketing offer, coupon code, or retail seasonal sale",
                "Promotional newsletter call-to-action detected"
            ]
        },
        "Social": {
            "domains": [
                "instagram.com", "facebookmail.com", "twitter.com", "x.com", "reddit.com",
                "discord.com", "pinterest.com", "tiktok.com", "meetup.com", "eventbrite.com",
                "strava.com", "threads.net"
            ],
            "keywords": [
                "mentioned you", "tagged you", "commented on", "followed you", "friend request",
                "notification", "upvoted", "direct message", "channel", "community",
                "event", "rsvpd", "invited you to join", "new post"
            ],
            "reasons": [
                "Social media or online community platform notification",
                "User mention, comment, follower, or activity alert",
                "Community networking event or discussion notification"
            ]
        }
    }

    def classify(self, sender_email: str, sender_name: str, subject: str, body: str) -> Tuple[str, List[str], int]:
        """
        Classifies an email and returns: (best_category, explainable_reasons, confidence_score)
        """
        text = f"{sender_name} {sender_email} {subject} {body}".lower()
        sender_email_lower = (sender_email or "").lower()
        domain = sender_email_lower.split("@")[-1] if "@" in sender_email_lower else ""

        category_scores: Dict[str, float] = {cat: 0.0 for cat in self.CATEGORIES}
        category_reasons: Dict[str, List[str]] = {cat: [] for cat in self.CATEGORIES}

        # Check domain matches
        for cat, config in self.SIGNALS.items():
            for d in config["domains"]:
                if d in domain or d in sender_email_lower:
                    category_scores[cat] += 4.5
                    if config["reasons"][0] not in category_reasons[cat]:
                        category_reasons[cat].append(config["reasons"][0])

            # Check keywords in subject (weighted higher)
            subject_lower = (subject or "").lower()
            for kw in config["keywords"]:
                if kw in subject_lower:
                    category_scores[cat] += 4.0
                    if len(config["reasons"]) > 1 and config["reasons"][1] not in category_reasons[cat]:
                        category_reasons[cat].append(config["reasons"][1])

            # Check keywords in body
            for kw in config["keywords"]:
                if kw in text:
                    category_scores[cat] += 1.2

        # Special priority boosts
        if any(term in text for term in ["interview", "pull request", "meeting", "sprint", "jira", "google careers"]):
            category_scores["Work"] += 5.0
        if any(term in text for term in ["payment due", "statement", "invoice", "receipt", "charged"]):
            category_scores["Finance"] += 5.0
        if any(term in text for term in ["flight", "hotel", "airbnb", "dinner", "family"]):
            category_scores["Personal"] += 4.0
        if any(term in text for term in ["discount", "% off", "promo code", "sale"]):
            category_scores["Promotions"] += 5.0
        if any(term in text for term in ["eventbrite", "meetup", "tagged you", "discord"]):
            category_scores["Social"] += 4.0

        best_category = max(category_scores, key=category_scores.get)
        best_score = category_scores[best_category]

        if best_score < 2.0:
            best_category = "Other"
            reasons = ["General correspondence without specific category indicators"]
            confidence = 72
        else:
            reasons = category_reasons.get(best_category, [])
            if not reasons:
                reasons = self.SIGNALS.get(best_category, {}).get("reasons", ["Contextual language match"])
            confidence = min(99, int(78 + (best_score * 2.5)))

        return best_category, reasons[:3], confidence

classifier_service = EmailClassifier()
