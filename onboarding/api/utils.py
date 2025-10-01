from django.core.mail import send_mail, send_mass_mail
from django.conf import settings
from django.contrib.auth.models import User
import logging

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def send_form_assignment_email(form, users, assignment_type="staff"):
        """Send email notification when a form is assigned to users"""
        try:
            subject = f"New Form Assignment: {form.name}"
            
            # Prepare email data for mass sending
            email_messages = []
            
            for user in users:
                message = EmailService._create_assignment_message(form, user, assignment_type)
                
                email_messages.append((
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email]
                ))
            
            # Send all emails
            if email_messages:
                send_mass_mail(email_messages, fail_silently=False)
                logger.info(f"Assignment emails sent for form '{form.name}' to {len(users)} users")
                return True
                
        except Exception as e:
            logger.error(f"Failed to send assignment emails: {str(e)}")
            return False
    
    @staticmethod
    def _create_assignment_message(form, user, assignment_type):
        """Create email message content"""
        return f"""
Hello {user.first_name or user.username},

You have been assigned a new form to complete:

Form: {form.name}
Description: {form.description or 'No description provided'}
Assignment Type: {assignment_type.title()}

Please log in to your account to view and complete this form.

Best regards,
Customer Onboarding Team
        """.strip()

    @staticmethod
    def send_test_email(recipient_email):
        """Send a test email to verify email configuration"""
        try:
            send_mail(
                subject='Test Email from Django',
                message='This is a test email to verify email configuration is working.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                fail_silently=False,
            )
            return True
        except Exception as e:
            logger.error(f"Failed to send test email: {str(e)}")
            return False

    @staticmethod
    def send_form_submission_notification(submission):
        """Send email notification to admins when a form is submitted"""
        try:
            # Get all admin users (is_staff=True and is_superuser=True)
            admin_users = User.objects.filter(is_staff=True, is_superuser=True)
            
            if not admin_users.exists():
                logger.info("No admin users found to notify about form submission")
                return False
            
            subject = f"New Form Submission: {submission.form.name}"
            
            # Prepare email data for mass sending
            email_messages = []
            
            for admin in admin_users:
                if admin.email:  # Only send if admin has email
                    message = EmailService._create_submission_notification_message(submission, admin)
                    
                    email_messages.append((
                        subject,
                        message,
                        settings.DEFAULT_FROM_EMAIL,
                        [admin.email]
                    ))
            
            # Send all emails
            if email_messages:
                send_mass_mail(email_messages, fail_silently=False)
                logger.info(f"Submission notification emails sent for form '{submission.form.name}' to {len(email_messages)} admins")
                return True
            else:
                logger.info("No admin users with email addresses found")
                return False
                
        except Exception as e:
            logger.error(f"Failed to send submission notification emails: {str(e)}")
            return False
    
    @staticmethod
    def _create_submission_notification_message(submission, admin):
        """Create submission notification email message content"""
        submitted_by_name = "Anonymous User"
        if submission.submitted_by:
            submitted_by_name = f"{submission.submitted_by.first_name} {submission.submitted_by.last_name}".strip()
            if not submitted_by_name:
                submitted_by_name = submission.submitted_by.username
        
        return f"""
Hello {admin.first_name or admin.username},

A new form submission has been received:

📋 Form: {submission.form.name}
👤 Submitted by: {submitted_by_name}
📧 Submitter Email: {submission.submitted_by.email if submission.submitted_by else 'N/A'}
📅 Submitted on: {submission.created_at.strftime('%Y-%m-%d %H:%M:%S')}
📊 Status: {submission.status.title()}

Form Description: {submission.form.description or 'No description provided'}

Please review the submission in your admin dashboard.

Best regards,
Customer Onboarding System
        """.strip()