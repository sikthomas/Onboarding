from django.db import models
from django.db import models
from django.utils import timezone

from django.contrib.auth.models import User
from .utils import EmailService



class Form(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    # canonical JSON schema for the form (optional canonical representation)
    schema = models.JSONField(default=dict, blank=True)  # requires Django 3.1+; else use JSONField from postgres
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="created_forms")
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
    
class Clossform(models.Model):
    form_id=models.ForeignKey(Form, on_delete=models.CASCADE)
    form_status=models.CharField(max_length=20)


class FormSection(models.Model):
    """
    Optional grouping inside a form (e.g., 'Personal details', 'Employment').
    """
    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name="sections")
    title = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ["order"]

class FormField(models.Model):
    """
    A single configurable field in the form.
    type: text, number, date, dropdown, checkbox, radio, file, textarea, email, phone, etc.
    validation: JSON object containing rules (required, min, max, regex, conditional rules, etc.)
    """
    FIELD_TYPES = [
        ("text", "Text"),
        ("textarea", "TextArea"),
        ("number", "Number"),
        ("date", "Date"),
        ("select", "Select"),
        ("checkbox", "Checkbox"),
        ("radio", "Radio"),
        ("file", "File"),
        ("email", "Email"),
    ]

    section = models.ForeignKey(FormSection, on_delete=models.CASCADE, related_name="fields", null=True, blank=True)
    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name="fields")
    name = models.CharField(max_length=255)  # internal name
    label = models.CharField(max_length=255)  # display label
    field_type = models.CharField(max_length=50, choices=FIELD_TYPES)
    placeholder = models.CharField(max_length=255, blank=True)
    help_text = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    required = models.BooleanField(default=False)
    multiple = models.BooleanField(default=False)  # for file uploads / checkboxes
    # any extra config such as options for select/radio, conditional logic, etc.
    config = models.JSONField(default=dict, blank=True)
    validation = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["order"]

class FieldOption(models.Model):
    """Option for select/radio fields."""
    field = models.ForeignKey(FormField, on_delete=models.CASCADE, related_name="options")
    value = models.CharField(max_length=255)
    label = models.CharField(max_length=255)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ["order"]


class Submission(models.Model):
    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name="submissions")
    submitted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="submissions")
    data = models.JSONField(default=dict)
    file_upload = models.FileField(upload_to='uploads/', null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=50, default="submitted") 



class Roles(models.Model):
    userid = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=30)
    def __str__(self):
        return f"{self.userid.username} - {self.role}"
    


    
class FormAssignment(models.Model):
    """
    Assign a form to a group: 'Staff' or 'Client'.
    The actual users are populated automatically based on their is_staff / is_superuser flags.
    """
    FORM_GROUPS = [
        ("staff", "Staff"),
        ("client", "Client"),
    ]
    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name="assignments")
    group = models.CharField(max_length=20, choices=FORM_GROUPS)
    users = models.ManyToManyField(User, related_name="assigned_forms", blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="form_assignments_created")
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)  # save once to get an ID

        if is_new:
            if self.group == "staff":
                assigned_users = User.objects.filter(is_staff=True, is_superuser=False)
            elif self.group == "client":
                assigned_users = User.objects.filter(is_staff=False, is_superuser=False)
            else:
                assigned_users = User.objects.none()

            self.users.set(assigned_users)  # set users without saving again
            
            # Send email notifications
            if assigned_users.exists():
                EmailService.send_form_assignment_email(
                    form=self.form,
                    users=assigned_users,
                    assignment_type=self.group
                )
