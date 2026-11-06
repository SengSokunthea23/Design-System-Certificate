import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


async def notify_submission(
    designer_email: str,
    project_name: str,
    client_name: str,
    version: int,
    project_url: str,
) -> None:
    subject = f"New submission: {project_name} (v{version})"
    body = (
        f"Hi,\n\n"
        f"{client_name} just submitted version {version} of the design rules for {project_name}.\n\n"
        f"Review it here: {project_url}\n\n"
        f"— Design System Picker"
    )
    await _send_email(designer_email, subject, body)
    await _send_telegram(f"📬 *{client_name}* submitted v{version} for *{project_name}*\n{project_url}")


async def _send_email(to: str, subject: str, body: str) -> None:
    if settings.email_backend == "console":
        logger.info("── EMAIL ──────────────────────────")
        logger.info("To: %s", to)
        logger.info("Subject: %s", subject)
        logger.info(body)
        logger.info("────────────────────────────────────")
        return

    msg = MIMEMultipart()
    msg["From"] = settings.smtp_from
    msg["To"] = to
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as smtp:
            smtp.starttls()
            smtp.login(settings.smtp_user, settings.smtp_password)
            smtp.send_message(msg)
    except Exception:
        logger.exception("Failed to send email to %s", to)


async def _send_telegram(message: str) -> None:
    if not settings.telegram_bot_token or not settings.telegram_chat_id:
        return
    import httpx
    url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"
    try:
        async with httpx.AsyncClient() as client:
            await client.post(url, json={
                "chat_id": settings.telegram_chat_id,
                "text": message,
                "parse_mode": "Markdown",
            }, timeout=5.0)
    except Exception:
        logger.exception("Failed to send Telegram notification")
