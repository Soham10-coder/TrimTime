import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
import os
from config import Config

logger = logging.getLogger(__name__)

def log_dev_email(to_email, subject, html_content, otp=None, error_msg=None):
    """
    Fallback logger for local dev mode when SMTP fails or is not configured.
    """
    dev_log_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'dev_otp_emails.log')
    reason = f" (SMTP Error: {error_msg})" if error_msg else " (SMTP credentials not configured)"
    log_msg = f"\n========================================\n[EMAIL FALLBACK NOTICE]{reason}\nTO: {to_email}\nSUBJECT: {subject}\nOTP CODE: {otp if otp else 'N/A'}\n========================================\n"
    print(log_msg)
    try:
        with open(dev_log_path, 'a', encoding='utf-8') as f:
            f.write(log_msg)
    except Exception as e:
        logger.error(f"Failed to write to dev email log: {e}")

def send_html_email(to_email, subject, html_content, otp=None):
    """
    Sends an HTML email using SMTP configuration with Gmail support.
    """
    mail_user = Config.MAIL_USERNAME
    mail_pass = Config.MAIL_PASSWORD
    
    if not mail_user or not mail_pass:
        logger.warning("--- SMTP credentials (MAIL_USERNAME / MAIL_PASSWORD) missing in .env ---")
        log_dev_email(to_email, subject, html_content, otp, "Missing MAIL_USERNAME or MAIL_PASSWORD in .env")
        return False

    msg = MIMEMultipart()
    msg['From'] = f"TrimTime <{mail_user}>"
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(html_content, 'html'))

    clean_pass = str(mail_pass).strip().strip('"').strip("'").replace(" ", "")

    try:
        port = int(Config.MAIL_PORT)
        server = None

        if port == 465 or Config.MAIL_USE_SSL:
            server = smtplib.SMTP_SSL(Config.MAIL_SERVER, port, timeout=12)
        else:
            server = smtplib.SMTP(Config.MAIL_SERVER, port, timeout=12)
            server.ehlo()
            if Config.MAIL_USE_TLS or port == 587:
                server.starttls()
                server.ehlo()

        server.login(mail_user, clean_pass)
        server.sendmail(mail_user, to_email, msg.as_string())
        server.quit()
        logger.info(f"Email successfully delivered from {mail_user} to {to_email}")
        print(f"[SUCCESS] EMAIL SENT SUCCESSFULLY via SMTP to {to_email}")
        return True

    except Exception as e:
        err_str = str(e)
        logger.error(f"Failed to send email via SMTP to {to_email}: {err_str}")
        print(f"[FAILED] SMTP TRANSMISSION ERROR: {err_str}")
        log_dev_email(to_email, subject, html_content, otp, err_str)
        return False

def send_verification_otp(email, name, otp):
    subject = f"Verify Your Account - TrimTime"
    html = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #1e293b; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Trim<span style="color: #d97706;">Time</span></h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Grooming on your schedule</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 24px;"/>
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Verify Your Email Address</h2>
        <p style="color: #334155; font-size: 16px; line-height: 24px;">Hi {name},</p>
        <p style="color: #334155; font-size: 16px; line-height: 24px;">Thank you for signing up with TrimTime! Please use the verification code below to activate your account:</p>
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0; border: 1px dashed #cbd5e1;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #d97706; font-family: monospace;">{otp}</span>
        </div>
        <p style="color: #64748b; font-size: 14px; line-height: 20px;">This verification code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;"/>
        <div style="text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; 2026 TrimTime. All rights reserved.</p>
        </div>
    </div>
    """
    return send_html_email(email, subject, html, otp=otp)

def send_reset_otp(email, otp):
    subject = "Reset Your Password - TrimTime"
    html = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #1e293b; margin: 0; font-size: 28px; font-weight: 800;">Trim<span style="color: #d97706;">Time</span></h1>
        </div>
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Password Reset Request</h2>
        <p style="color: #334155; font-size: 16px; line-height: 24px;">We received a request to reset your password. Use the verification code below to complete the reset:</p>
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0; border: 1px dashed #cbd5e1;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #ef4444; font-family: monospace;">{otp}</span>
        </div>
        <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes. If you didn't request a password reset, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;"/>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">&copy; 2026 TrimTime. All rights reserved.</p>
    </div>
    """
    return send_html_email(email, subject, html, otp=otp)

def send_booking_confirmation(email, customer_name, booking_details):
    subject = f"Booking Confirmed! - TrimTime ({booking_details['booking_id']})"
    html = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #1e293b; margin: 0; font-size: 28px; font-weight: 800;">Trim<span style="color: #d97706;">Time</span></h1>
            <span style="background-color: #dcfce7; color: #15803d; font-size: 12px; padding: 6px 12px; border-radius: 9999px; font-weight: 600; display: inline-block; margin-top: 8px;">Appointment Confirmed</span>
        </div>
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Booking Confirmation</h2>
        <p style="color: #334155; font-size: 16px; line-height: 24px;">Hi {customer_name},</p>
        <p style="color: #334155; font-size: 16px; line-height: 24px;">Your appointment has been successfully booked! Here are your booking details:</p>
        
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 24px 0; border: 1px solid #cbd5e1;">
            <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
                <tr>
                    <td style="padding: 8px 0; color: #64748b;"><b>Booking ID:</b></td>
                    <td style="padding: 8px 0; color: #0f172a; text-align: right;"><b>{booking_details['booking_id']}</b></td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #64748b;"><b>Shop Name:</b></td>
                    <td style="padding: 8px 0; color: #0f172a; text-align: right;">{booking_details['shop_name']}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #64748b;"><b>Hairstyle:</b></td>
                    <td style="padding: 8px 0; color: #0f172a; text-align: right;">{booking_details['hairstyle_name']}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #64748b;"><b>Date:</b></td>
                    <td style="padding: 8px 0; color: #0f172a; text-align: right;">{booking_details['date']}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #64748b;"><b>Time:</b></td>
                    <td style="padding: 8px 0; color: #0f172a; text-align: right;">{booking_details['time']} ({booking_details['duration']} mins)</td>
                </tr>
                <tr style="border-top: 1px solid #cbd5e1;">
                    <td style="padding: 12px 0 0 0; color: #0f172a; font-weight: 700;"><b>Total Paid:</b></td>
                    <td style="padding: 12px 0 0 0; color: #d97706; font-weight: 700; text-align: right; font-size: 18px;"><b>₹{booking_details['price']}</b></td>
                </tr>
            </table>
        </div>
        
        <p style="color: #334155; font-size: 15px; line-height: 22px;">Please present the QR Code or Booking ID in your dashboard when you arrive at the shop.</p>
        <p style="color: #64748b; font-size: 13px;">Need to make changes? You can cancel or reschedule up to 24 hours before your slot via your dashboard.</p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;"/>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">&copy; 2026 TrimTime. All rights reserved.</p>
    </div>
    """
    return send_html_email(email, subject, html)

def send_booking_cancellation(email, customer_name, booking_id, refund_processed=False):
    subject = f"Appointment Cancelled - TrimTime ({booking_id})"
    refund_status = "A refund will be credited back to your original payment method in 5-7 business days." if refund_processed else "This booking was cancelled. If you believe this is an error, please contact support."
    html = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #1e293b; margin: 0; font-size: 28px; font-weight: 800;">Trim<span style="color: #d97706;">Time</span></h1>
            <span style="background-color: #fee2e2; color: #991b1b; font-size: 12px; padding: 6px 12px; border-radius: 9999px; font-weight: 600; display: inline-block; margin-top: 8px;">Booking Cancelled</span>
        </div>
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Cancellation Notice</h2>
        <p style="color: #334155; font-size: 16px; line-height: 24px;">Hi {customer_name},</p>
        <p style="color: #334155; font-size: 16px; line-height: 24px;">We are writing to confirm that your appointment <b>{booking_id}</b> has been cancelled.</p>
        <div style="background-color: #fffbeb; border-left: 4px solid #d97706; padding: 16px; margin: 24px 0; border-radius: 4px;">
            <p style="color: #b45309; margin: 0; font-size: 15px; line-height: 22px; font-weight: 500;">{refund_status}</p>
        </div>
        <p style="color: #64748b; font-size: 14px;">We hope to see you again soon!</p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;"/>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">&copy; 2026 TrimTime. All rights reserved.</p>
    </div>
    """
    return send_html_email(email, subject, html)

def send_haircut_reminder(to_email, name, gender, days_since_last_cut, shop_name):
    subject = "Time for a Fresh Trim! ✂️ - TrimTime"
    gender_label = "gentlemen" if gender.lower() == 'male' else "ladies"
    interval_text = "25 days" if gender.lower() == 'male' else "40 days"
    
    html = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #1e293b; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Trim<span style="color: #d97706;">Time</span></h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Grooming on your schedule</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 24px;"/>
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; text-align: center;">Keep Your Hair Looking Sharp!</h2>
        <p style="color: #334155; font-size: 16px; line-height: 24px;">Hi {name},</p>
        <p style="color: #334155; font-size: 16px; line-height: 24px;">It has been <b>{days_since_last_cut} days</b> since your last styling session at <b>{shop_name}</b>.</p>
        <p style="color: #334155; font-size: 16px; line-height: 24px;">For {gender_label}, we recommend getting a professional trim every <b>{interval_text}</b> to maintain healthy hair growth and keep your cut looking clean.</p>
        
        <div style="text-align: center; margin: 32px 0;">
            <a href="http://localhost:5173/" style="background-color: #d97706; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(217, 119, 6, 0.2);">Book Your Next Trim</a>
        </div>
        
        <p style="color: #64748b; font-size: 14px; line-height: 20px; text-align: center;">Choose your favorite stylist and reserve your slot before it gets fully booked!</p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;"/>
        <div style="text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; 2026 TrimTime. All rights reserved.</p>
        </div>
    </div>
    """
    return send_html_email(to_email, subject, html)
