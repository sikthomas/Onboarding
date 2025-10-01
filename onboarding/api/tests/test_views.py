from rest_framework import status
from .test_setup import TestSetUp  # ✅ Use relative import since it's in the same folder


class TestViews(TestSetUp):

    #  1. Registration (POST)
    def test_registration_success(self):
        """
        Test that a new user can register successfully.
        """
        response = self.client.post(self.register_url, self.signup_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('email', response.data)

    #  2. Login (POST)
    def test_login_success(self):
        """
        Test that a registered user can log in and get access token.
        """
        # Register first
        self.client.post(self.register_url, self.signup_data, format='json')

        # Then login
        response = self.client.post(self.login_url, self.login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    #  Helper method to authenticate client
    def authenticate(self):
        """
        Helper method to register, login and attach JWT token to client.
        """
        self.client.post(self.register_url, self.signup_data, format='json')
        response = self.client.post(self.login_url, self.login_data, format='json')
        token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)

    #  3. Create Form (POST)
    def test_create_form_authenticated(self):
        """
        Test that an authenticated user can create a form.
        """
        self.authenticate()
        response = self.client.post(self.forms_list_create_url, self.create_form_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], self.create_form_data['name'])

    #  4. Get Available Forms (GET)
    def test_get_available_forms_authenticated(self):
        """
        Test that an authenticated user can retrieve list of available forms.
        """
        self.authenticate()
        response = self.client.get(self.available_forms_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)

    #  5. Count Users (GET)
    def test_count_users_authenticated(self):
        """
        Test that authenticated user can get users count.
        """
        self.authenticate()
        response = self.client.get(self.count_users_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('count', response.data)

    #  6. Count Forms (GET)
    def test_count_forms_authenticated(self):
        """
        Test that authenticated user can get forms count.
        """
        self.authenticate()
        response = self.client.get(self.count_forms_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('count', response.data)

    #  7. Get My Profile Data (GET)
    def test_get_my_data_authenticated(self):
        """
        Test that authenticated user can fetch their profile data.
        """
        self.authenticate()
        response = self.client.get(self.me_api_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('email', response.data)
        self.assertIn('username', response.data)
