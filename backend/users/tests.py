from django.test import TestCase
from django.urls import reverse
from .models import User

class UserModelTests(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username='admin',
            password='admin',
            email='admin@example.com'
        )

    def test_user_creation(self):
        self.assertEqual(self.user.username, 'admin')
        self.assertTrue(self.user.check_password('admin'))

class UserViewsTests(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username='admin',
            password='admin',
            email='admin@example.com'
        )
        self.client.login(username='admin', password='admin')

    def test_user_list_view(self):
        response = self.client.get(reverse('user-list'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'admin')

    def test_user_create_view(self):
        response = self.client.post(reverse('user-create'), {
            'username': 'newuser',
            'password': 'newpassword',
            'email': 'newuser@example.com'
        })
        self.assertEqual(response.status_code, 302)  # Redirect after successful creation
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_user_update_view(self):
        response = self.client.post(reverse('user-update', args=[self.user.id]), {
            'username': 'updateduser',
            'email': 'updateduser@example.com'
        })
        self.assertEqual(response.status_code, 302)  # Redirect after successful update
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, 'updateduser')

    def test_user_delete_view(self):
        response = self.client.post(reverse('user-delete', args=[self.user.id]))
        self.assertEqual(response.status_code, 302)  # Redirect after successful deletion
        self.assertFalse(User.objects.filter(id=self.user.id).exists())