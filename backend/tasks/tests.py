from django.test import TestCase
from .models import Task

class TaskModelTest(TestCase):

    def setUp(self):
        Task.objects.create(
            title="Desktop survey Design",
            status="Nil"
        )
        Task.objects.create(
            title="Network Health checkup",
            status="In progress"
        )
        Task.objects.create(
            title="Hoto-existing",
            status="Completed"
        )

    def test_task_creation(self):
        task = Task.objects.get(title="Desktop survey Design")
        self.assertEqual(task.status, "Nil")

    def test_task_status(self):
        task = Task.objects.get(title="Network Health checkup")
        self.assertEqual(task.status, "In progress")

    def test_completed_task(self):
        task = Task.objects.get(title="Hoto-existing")
        self.assertEqual(task.status, "Completed")