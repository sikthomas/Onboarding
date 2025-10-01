from django.db.models.signals import m2m_changed, post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from .models import FormAssignment, Submission

User = get_user_model()


@receiver(m2m_changed, sender=FormAssignment.users.through)
def send_form_assignment_email(sender, instance, action, pk_set, **kwargs):
    """Send email when users are assigned to a form"""
    if action == "post_add" and pk_set:
        try:
            added_users = instance.users.filter(pk__in=pk_set)
            for user in added_users:
                if user.email:
                    send_mail(
                        subject=f"New Form Assigned: {instance.form.name}",
                        message=(
                            f"Hello {user.first_name or user.username},\n\n"
                            f"You have been assigned a new form: {instance.form.name}.\n"
                            f"Description: {instance.form.description or 'No description provided'}\n\n"
                            "Please login to our onboarding site and fill it as soon as possible.\n\n"
                            "Thank you."
                        ),
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[user.email],
                        fail_silently=False,
                    )
                    print(f"✅ Assignment email sent to {user.email} for form '{instance.form.name}'")
                else:
                    print(f"⚠️ No email address for user {user.username}")
        except Exception as e:
            print(f"❌ Failed to send assignment email notifications: {e}")


@receiver(post_save, sender=Submission)
def notify_admins_on_submission(sender, instance, created, **kwargs):
    """Notify all superuser+staff admins when a new submission is created"""
    if created:
        try:
            admin_users = User.objects.filter(
                is_staff=True, 
                is_superuser=True, 
                email__isnull=False
            ).exclude(email='')

            if admin_users.exists():
                submitted_by_name = (
                    f"{instance.submitted_by.first_name} {instance.submitted_by.last_name}".strip()
                    if instance.submitted_by else "Anonymous User"
                )
                if not submitted_by_name:
                    submitted_by_name = instance.submitted_by.username

                subject = f"New Form Submission: {instance.form.name}"

                for admin in admin_users:
                    message = f"""
Hello {admin.first_name or admin.username},

A new form submission has been received:

📋 Form: {instance.form.name}
👤 Submitted by: {submitted_by_name}
📧 Submitter Email: {instance.submitted_by.email if instance.submitted_by else 'N/A'}
📅 Submitted on: {instance.created_at.strftime('%Y-%m-%d %H:%M:%S')}
📊 Status: {instance.status.title()}

Form Description: {instance.form.description or 'No description provided'}

Please review the submission in your admin dashboard.

Best regards,
Customer Onboarding System
                    """.strip()

                    send_mail(
                        subject=subject,
                        message=message,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[admin.email],
                        fail_silently=False,
                    )
                    print(f"✅ Submission notification sent to admin: {admin.email}")
            else:
                print("ℹ️ No admin users with email addresses found to notify")
        except Exception as e:
            print(f"❌ Failed to send submission notification emails: {e}")
