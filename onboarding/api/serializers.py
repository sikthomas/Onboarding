from rest_framework import serializers
from rest_framework.exceptions import ValidationError, AuthenticationFailed
from django.contrib.auth.models import User
import re
from .models import Form, FormSection, FormField, FieldOption,Submission,Roles,FormAssignment

class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'username', 'password', 'confirm_password']

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError("Password must contain at least one digit.")
        return value

    def validate(self, attrs):
        password = attrs.get('password')
        confirm_password = attrs.pop('confirm_password', None)

        if password != confirm_password:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        return attrs

    def create(self, validated_data):
        if User.objects.filter(email=validated_data['email']).exists():
            raise ValidationError({"email": ["Email already exists"]})
        if User.objects.filter(username=validated_data['username']).exists():
            raise ValidationError({"username": ["Username already exists"]})

        user = User.objects.create_user(
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed('Email does not exist.')

        if not user.check_password(password):
            raise AuthenticationFailed('Incorrect password.')

        return {'user': user}

class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'username', 'is_superuser', 'is_staff']

class FieldOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldOption
        fields = ['id', 'value', 'label', 'order']

class FormFieldSerializer(serializers.ModelSerializer):
    options = FieldOptionSerializer(many=True, required=False)

    class Meta:
        model = FormField
        fields = ['id', 'name', 'label', 'field_type', 'placeholder','help_text', 'order', 'required', 'multiple','config', 'validation', 'options']
    def to_internal_value(self, data):
        if not data.get('name') and data.get('label'):
            data['name'] = re.sub(r'\W+', '_', data['label'].lower()).strip('_')
        return super().to_internal_value(data)

    def create(self, validated_data):
        options_data = validated_data.pop('options', [])
        field = FormField.objects.create(**validated_data)
        for opt in options_data:
            FieldOption.objects.create(field=field, **opt)
        return field


class FormSectionSerializer(serializers.ModelSerializer):
    fields = FormFieldSerializer(many=True, required=False)

    class Meta:
        model = FormSection
        fields = ['id', 'title', 'description', 'order', 'fields']

    def create(self, validated_data):
        fields_data = validated_data.pop('fields', [])
        section = FormSection.objects.create(**validated_data)

        for field_data in fields_data:
            FormField.objects.create(section=section, form=section.form, **field_data)
        return section


class FormSerializer(serializers.ModelSerializer):
    sections = FormSectionSerializer(many=True, required=False)
    fields = FormFieldSerializer(many=True, required=False)

    class Meta:
        model = Form
        fields = [
            'id', 'name', 'slug', 'description', 'schema', 'is_active', 'sections', 'fields'
        ]
        read_only_fields = ['created_by']

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user if request else None

        sections_data = validated_data.pop('sections', [])
        fields_data = validated_data.pop('fields', [])
        form = Form.objects.create(created_by=user, **validated_data)
        for section_data in sections_data:
            fields_in_section = section_data.pop('fields', [])
            section = FormSection.objects.create(form=form, **section_data)
            for field_data in fields_in_section:
                options_data = field_data.pop('options', [])
                field = FormField.objects.create(form=form, section=section, **field_data)
                for opt in options_data:
                    FieldOption.objects.create(field=field, **opt)
        for field_data in fields_data:
            options_data = field_data.pop('options', [])
            field = FormField.objects.create(form=form, **field_data)
            for opt in options_data:
                FieldOption.objects.create(field=field, **opt)

        return form
    
class SubmissionSerializer(serializers.ModelSerializer):
    file_upload = serializers.FileField(required=False, allow_null=True)
    class Meta:
        model = Submission
        fields = ['id', 'form', 'data','file_upload', 'created_at', 'updated_at', 'status']
        read_only_fields = ['created_at', 'updated_at', 'status']

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user if request else None
        return Submission.objects.create(submitted_by=user, **validated_data)
    
    def to_representation(self, instance):
            data = super().to_representation(instance)
            request = self.context.get("request")
            if instance.file_upload and request:
                data["file_upload"] = request.build_absolute_uri(instance.file_upload.url)
            elif instance.file_upload:
                data["file_upload"] = instance.file_upload.url 

            return data
    
class RolesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Roles
        fields = ['id', 'userid', 'role']

    def create(self, validated_data):
        role_instance = super().create(validated_data)
        user = role_instance.userid
        role = role_instance.role.lower()
        if role == 'admin':
            user.is_superuser = True
            user.is_staff = True
        elif role == 'staff':
            user.is_superuser = False
            user.is_staff = True
        else:
            user.is_superuser = False
            user.is_staff = False

        user.save()
        return role_instance

    def update(self, instance, validated_data):
        role = validated_data.get('role', instance.role).lower()
        instance.role = role
        instance.save()

        user = instance.userid
        if role == 'admin':
            user.is_superuser = True
            user.is_staff = True
        elif role == 'client':
            user.is_superuser = False
            user.is_staff = True
        else:
            user.is_superuser = False
            user.is_staff = False

        user.save()
        return instance
    
class SimpleFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = Form
        fields = ["id", "name"]

class FormAssignmentSerializer(serializers.ModelSerializer):
    form = serializers.PrimaryKeyRelatedField(queryset=Form.objects.all())

    class Meta:
        model = FormAssignment
        fields = ["id", "form", "group", "created_by", "created_at"]
        read_only_fields = ["created_by", "created_at"]

    def create(self, validated_data):
        request = self.context.get("request")
        user = request.user if request else None
        assignment = FormAssignment.objects.create(created_by=user, **validated_data)
        return assignment