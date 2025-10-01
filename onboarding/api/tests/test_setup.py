from rest_framework.test import APITestCase
from django.urls import reverse

class TestSetUp(APITestCase):
    def setUp(self):
        # ✅ Auth URLs
        self.register_url = reverse('signup')
        self.login_url = reverse('login')

        # ✅ Forms URLs
        self.forms_list_create_url = reverse('forms-list-create')
        self.available_forms_url = reverse('available-forms')
        self.roles_list_url = reverse('roles-list')
        self.submissions_url = reverse('submissions')

        # ✅ Newly added ones (fix your error!)
        self.count_users_url = reverse('count-users')
        self.count_forms_url = reverse('count-forms')
        self.me_api_url = reverse('me_api')

        # ✅ Test data
        self.signup_data = {
            "first_name": "Gloria",
            "last_name": "Mukwana",
            "email": "glorwafubwa@gmail.com",
            "username": "Glor",
            "password": "Thomasconnect000.",
            "confirm_password": "Thomasconnect000."
        }

        self.login_data = {
            "email": "glorwafubwa@gmail.com",
            "password": "Thomasconnect000."
        }

        self.create_form_data = {
            "name": "Personal Information",
            "slug": "personal-information",
            "description": "This form is to take personal information and employment profile",
            "schema": {},
            "is_active": True
        }

        return super().setUp()

    def tearDown(self):
        return super().tearDown()
