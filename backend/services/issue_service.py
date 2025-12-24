"""
Issue reporting service: sends internal emails (via Resend) and creates notifications
"""
import logging
from typing import Dict, Any
from datetime import datetime, timezone

from database import mongodb
from config import settings
from models.trip import Notification

logger = logging.getLogger(__name__)

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib

# Check SMTP availability by ensuring credentials exist
_HAS_SMTP = bool(settings.gmail_user and settings.gmail_app_password and settings.dev_team_email)


class IssueService:
    async def report_issue_owner(self, user_id: str, user_name: str, trip_id: str, subject: str, message: str) -> Dict[str, Any]:
        """Handle issue reported by trip owner: send internal mail and notify owner"""
        try:
            # Send email to dev team via SMTP if credentials available
            email_sent = False
            if _HAS_SMTP:
                try:
                    msg = MIMEMultipart("alternative")
                    msg["Subject"] = f"[Issue Report] {subject} (Trip: {trip_id})"
                    msg["From"] = settings.gmail_from_email
                    msg["To"] = settings.dev_team_email

                    plain = f"Reporter: {user_name} ({user_id})\nTrip ID: {trip_id}\n\n{message}"
                    html = f"<p><strong>Reporter:</strong> {user_name} ({user_id})</p>"
                    html += f"<p><strong>Trip ID:</strong> {trip_id}</p>"
                    html += f"<p><strong>Message:</strong></p><div>{message}</div>"

                    part1 = MIMEText(plain, "plain")
                    part2 = MIMEText(html, "html")
                    msg.attach(part1)
                    msg.attach(part2)

                    with smtplib.SMTP(settings.smtp_server, settings.smtp_port) as server:
                        server.starttls()
                        server.login(settings.gmail_user, settings.gmail_app_password)
                        server.sendmail(settings.gmail_from_email, [settings.dev_team_email], msg.as_string())

                    email_sent = True
                except Exception as e:
                    logger.error(f"Failed to send issue email via SMTP: {e}")

            # Create confirmation notification for owner
            notif_message = "We've received your issue report and our team is looking into it."
            notification = Notification(
                user_id=user_id,
                type="issue_report",
                title="Issue Report Received",
                message=notif_message,
                related_trip_id=trip_id,
                created_at=datetime.now(timezone.utc)
            )
            await mongodb.insert_one("notifications", notification.model_dump())

            return {"success": True, "email_sent": email_sent, "message": "Issue reported"}

        except Exception as e:
            logger.error(f"Error in report_issue_owner: {e}")
            return {"success": False, "message": str(e)}


    async def report_issue_joined(self, reporter_id: str, reporter_name: str, trip_id: str, subject: str, message: str, category: str) -> Dict[str, Any]:
        """Handle issue reported by a joined user.

        category: 'technical' or 'personal'
        """
        try:
            # Lookup trip and resolve original trip owner (handle joined trip copies)
            trip_doc = await mongodb.find_one("trips", {"trip_id": trip_id})
            if not trip_doc:
                return {"success": False, "message": "Trip not found"}

            # If this is a joined trip copy, try to resolve the original trip's owner
            original_trip_id = trip_doc.get("original_trip_id") if trip_doc.get("is_joined") else None
            report_trip_id = trip_id
            trip_owner_id = trip_doc.get("user_id")

            if original_trip_id:
                orig = await mongodb.find_one("trips", {"trip_id": original_trip_id})
                if orig and orig.get("user_id"):
                    trip_owner_id = orig.get("user_id")
                    report_trip_id = original_trip_id

            # Prepare notification for trip owner
            owner_message = ""
            email_sent = False

            if category == "technical":
                # Send internal mail to dev team via SMTP
                if _HAS_SMTP:
                    try:
                        msg = MIMEMultipart("alternative")
                        msg["Subject"] = f"[Technical Issue] {subject} (Trip: {trip_id})"
                        msg["From"] = settings.gmail_from_email
                        msg["To"] = settings.dev_team_email

                        plain = f"Reporter: {reporter_name} ({reporter_id})\nTrip ID: {trip_id}\n\n{message}"
                        html = f"<p><strong>Reporter:</strong> {reporter_name} ({reporter_id})</p>"
                        html += f"<p><strong>Trip ID:</strong> {trip_id}</p>"
                        html += f"<p><strong>Message:</strong></p><div>{message}</div>"

                        part1 = MIMEText(plain, "plain")
                        part2 = MIMEText(html, "html")
                        msg.attach(part1)
                        msg.attach(part2)

                        with smtplib.SMTP(settings.smtp_server, settings.smtp_port) as server:
                            server.starttls()
                            server.login(settings.gmail_user, settings.gmail_app_password)
                            server.sendmail(settings.gmail_from_email, [settings.dev_team_email], msg.as_string())

                        email_sent = True
                    except Exception as e:
                        logger.error(f"Failed to send technical issue email via SMTP: {e}")

                owner_message = f"{reporter_name} reported a technical issue for your trip. Our team has been notified and is looking into it."

            else:
                # personal/non-technical: only notify trip owner with issue content
                owner_message = f"{reporter_name} reported an issue: {message}"

            # Avoid notifying the reporter themselves (happens if reporter owns the joined copy)
            if trip_owner_id != reporter_id:
                notification = Notification(
                    user_id=trip_owner_id,
                    type="issue_report",
                    title="Issue Reported for Your Trip",
                    message=owner_message,
                    related_trip_id=report_trip_id,
                    requester_id=reporter_id,
                    requester_name=reporter_name,
                    created_at=datetime.now(timezone.utc)
                )
                await mongodb.insert_one("notifications", notification.model_dump())

            return {"success": True, "email_sent": email_sent, "message": "Issue reported"}

        except Exception as e:
            logger.error(f"Error in report_issue_joined: {e}")
            return {"success": False, "message": str(e)}


# Global instance
issue_service = IssueService()
