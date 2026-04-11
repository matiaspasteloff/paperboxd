"""
Email verification via Gmail SMTP.

Required env vars:
  GMAIL_USER     – tu cuenta de Gmail (ej: miapp@gmail.com)
  GMAIL_APP_PASS – contraseña de aplicación de Google (no la contraseña normal)
                   Generala en: Google Account > Security > 2-Step > App passwords

Setup Gmail App Password:
  1. Activá verificación en dos pasos en tu cuenta Gmail
  2. Andá a myaccount.google.com/apppasswords
  3. Creá una contraseña de app para "Mail" en "Other device"
  4. Usá esa contraseña de 16 caracteres en GMAIL_APP_PASS
"""

import os
import random
import smtplib
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
import models

router = APIRouter()

# ── In-memory store for verification codes ────────────────────────────────────
# { email: { code: str, expires: float, attempts: int } }
_codes: dict = {}

CODE_TTL_SECONDS  = 600   # 10 minutes
MAX_ATTEMPTS      = 5
RESEND_COOLDOWN   = 60    # 1 minute between resends


# ── Gmail config ──────────────────────────────────────────────────────────────
GMAIL_USER     = os.getenv("GMAIL_USER", "")
GMAIL_APP_PASS = os.getenv("GMAIL_APP_PASS", "")


def _send_email(to_email: str, code: str):
    """Send a verification code via Gmail SMTP."""
    if not GMAIL_USER or not GMAIL_APP_PASS:
        # Dev mode: just print the code
        print(f"[DEV] Verification code for {to_email}: {code}")
        return

    subject = "Tu código de verificación — PaperBoxd"
    html = f"""
    <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 32px; background: #0e0c09; border-radius: 12px;">
      <h1 style="font-size: 28px; color: #f0e8d8; margin: 0 0 8px;">Paper<em style="color:#c8943a;">Boxd</em></h1>
      <p style="color: #a08c6e; font-size: 14px; margin: 0 0 32px;">Tu diario de lectura</p>

      <p style="color: #f0e8d8; font-size: 16px; margin: 0 0 24px;">
        Ingresá este código para verificar tu cuenta:
      </p>

      <div style="background: #161310; border: 1px solid rgba(212,180,120,0.20); border-radius: 10px; padding: 24px; text-align: center; margin: 0 0 24px;">
        <span style="font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #c8943a; font-family: monospace;">
          {code}
        </span>
      </div>

      <p style="color: #5a4e38; font-size: 13px; line-height: 1.7; margin: 0;">
        Este código expira en 10 minutos.<br>
        Si no solicitaste este código, ignorá este mensaje.
      </p>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = f"PaperBoxd <{GMAIL_USER}>"
    msg["To"]      = to_email
    msg.attach(MIMEText(html, "html", "utf-8"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(GMAIL_USER, GMAIL_APP_PASS)
        server.sendmail(GMAIL_USER, to_email, msg.as_string())


# ── Schemas ───────────────────────────────────────────────────────────────────
class SendCodeRequest(BaseModel):
    email: str

class VerifyCodeRequest(BaseModel):
    email: str
    code: str


# ── Endpoints ─────────────────────────────────────────────────────────────────
@router.post("/auth/send-verification")
def send_verification(body: SendCodeRequest, db: Session = Depends(get_db)):
    """Generate and email a 6-digit verification code."""
    email = body.email.lower().strip()

    # Check user exists
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(404, "Usuario no encontrado")

    # Resend cooldown
    existing = _codes.get(email)
    if existing and (time.time() - existing.get("sent_at", 0)) < RESEND_COOLDOWN:
        wait = int(RESEND_COOLDOWN - (time.time() - existing["sent_at"]))
        raise HTTPException(429, f"Esperá {wait} segundos antes de reenviar")

    # Generate code
    code = f"{random.randint(0, 999999):06d}"
    _codes[email] = {
        "code":     code,
        "expires":  time.time() + CODE_TTL_SECONDS,
        "attempts": 0,
        "sent_at":  time.time(),
    }

    try:
        _send_email(email, code)
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")
        raise HTTPException(500, "Error al enviar el email. Verificá la configuración de Gmail.")

    return {"ok": True, "message": f"Código enviado a {email}"}


@router.post("/auth/verify-email")
def verify_email(body: VerifyCodeRequest, db: Session = Depends(get_db)):
    """Verify the code and mark user as verified."""
    email = body.email.lower().strip()
    code  = body.code.strip()

    entry = _codes.get(email)
    if not entry:
        raise HTTPException(400, "No hay un código activo para este email. Solicitá uno nuevo.")

    # Expiry check
    if time.time() > entry["expires"]:
        del _codes[email]
        raise HTTPException(400, "El código expiró. Solicitá uno nuevo.")

    # Max attempts
    entry["attempts"] += 1
    if entry["attempts"] > MAX_ATTEMPTS:
        del _codes[email]
        raise HTTPException(400, "Demasiados intentos fallidos. Solicitá un nuevo código.")

    # Code check
    if entry["code"] != code:
        remaining = MAX_ATTEMPTS - entry["attempts"]
        raise HTTPException(400, f"Código incorrecto. Te quedan {remaining} intento(s).")

    # Mark verified in DB
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(404, "Usuario no encontrado")

    user.is_verified = True
    db.commit()

    del _codes[email]
    return {"ok": True, "message": "Email verificado correctamente"}