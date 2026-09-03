import json
import unittest
from app import app, db, User, Project, ProjectPhase, Task, Comment, AuditLog, seed_data

class TestSDLCGovernanceV2(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = app.test_client()
        
        with app.app_context():
            db.drop_all()
            db.create_all()
            seed_data()

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_signup_corporate_restriction(self):
        """Verify that signups are restricted to alphabet.numberid@bankalhabib.com and start as PENDING."""
        # 1. Invalid domain signup
        res = self.client.post('/api/auth/signup', json={
            'name': 'Hack Hacker',
            'email': 'hacker@google.com',
            'password': 'Password123!',
            'role': 'Developer'
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn('Corporate restriction', json.loads(res.data)['error'])

        # 2. Invalid format signup (lacks number id)
        res = self.client.post('/api/auth/signup', json={
            'name': 'Grace Dev',
            'email': 'grace@bankalhabib.com',
            'password': 'Password123!',
            'role': 'Developer'
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn('Corporate restriction', json.loads(res.data)['error'])

        # 3. Valid corporate signup
        res = self.client.post('/api/auth/signup', json={
            'name': 'Grace Dev',
            'email': 'grace.67890@bankalhabib.com',
            'password': 'Password123!',
            'role': 'Developer'
        })
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.data)
        self.assertEqual(data['user']['status'], 'PENDING')

    def test_auth_and_admin_gating(self):
        """Test sign-up, login blocking of pending users, admin approval, and successful login."""
        # 1. Register a corporate user
        self.client.post('/api/auth/signup', json={
            'name': 'Frank Auditor',
            'email': 'frank.12345@bankalhabib.com',
            'password': 'Password123!',
            'role': 'Compliance Officer'
        })

        # 2. Attempt login (Should fail with 403 because status is PENDING)
        res = self.client.post('/api/auth/login', json={
            'email': 'frank.12345@bankalhabib.com',
            'password': 'Password123!'
        })
        self.assertEqual(res.status_code, 403)
        self.assertIn('pending review', json.loads(res.data)['error'])

        # 3. Log in as Seeded Admin
        res = self.client.post('/api/auth/login', json={
            'email': 'admin@bankalhabib.com',
            'password': 'Admin123!'
        })
        self.assertEqual(res.status_code, 200)
        admin_token = json.loads(res.data)['token']

        # 4. Fetch pending users
        headers = {'Authorization': f'Bearer {admin_token}'}
        res = self.client.get('/api/admin/pending-users', headers=headers)
        self.assertEqual(res.status_code, 200)
        pending_list = json.loads(res.data)
        frank_user = next(u for u in pending_list if u['email'] == 'frank.12345@bankalhabib.com')

        # 5. Approve User
        res = self.client.post(
            f'/api/admin/approve-user/{frank_user["id"]}',
            json={'status': 'APPROVED'},
            headers=headers
        )
        self.assertEqual(res.status_code, 200)

        # 6. Attempt login as Frank again (Should now succeed!)
        res = self.client.post('/api/auth/login', json={
            'email': 'frank.12345@bankalhabib.com',
            'password': 'Password123!'
        })
        self.assertEqual(res.status_code, 200)
        frank_data = json.loads(res.data)
        self.assertIn('token', frank_data)
        self.assertEqual(frank_data['user']['status'], 'APPROVED')

    def test_dynamic_phases_tasks_and_comments(self):
        """Test adding dynamic phases, tasks management, shifting stages, and comments."""
        # 1. Login as Seeded Admin
        res = self.client.post('/api/auth/login', json={
            'email': 'admin@bankalhabib.com',
            'password': 'Admin123!'
        })
        token = json.loads(res.data)['token']
        headers = {'Authorization': f'Bearer {token}'}

        # 2. Get Seeded Project
        res = self.client.get('/api/projects', headers=headers)
        project_id = json.loads(res.data)[0]['id']

        # Get details to inspect seeded phases
        res = self.client.get(f'/api/projects/{project_id}', headers=headers)
        proj_details = json.loads(res.data)
        initial_phases = proj_details['phases']
        self.assertEqual(len(initial_phases), 6) # Initial default seed length

        # 3. Add a dynamic phase
        res = self.client.post(
            f'/api/projects/{project_id}/phases',
            json={
                'name': 'Phase 7: Post-Implementation Review',
                'description': 'Conduct lessons learned review meetings.'
            },
            headers=headers
        )
        self.assertEqual(res.status_code, 201)
        new_phase = json.loads(res.data)
        self.assertEqual(new_phase['phase_order'], 6) # Append to end index 6 (7th phase)

        # 4. Create a task in Phase 1
        first_phase_id = initial_phases[0]['id']
        res = self.client.post(
            f'/api/projects/{project_id}/tasks',
            json={
                'title': 'Validate regulatory specifications',
                'description': 'Ensure all AML policies are detailed.',
                'priority': 'Critical',
                'phase_id': first_phase_id
            },
            headers=headers
        )
        self.assertEqual(res.status_code, 201)
        task_id = json.loads(res.data)['id']

        # 5. Shift task to next phase
        second_phase_id = initial_phases[1]['id']
        res = self.client.put(
            f'/api/projects/{project_id}/tasks/{task_id}',
            json={'phase_id': second_phase_id},
            headers=headers
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(json.loads(res.data)['phase_id'], second_phase_id)

        # 6. Post comments on the task
        res = self.client.post(
            f'/api/tasks/{task_id}/comments',
            json={'body': 'Review started. Requirements look comprehensive.'},
            headers=headers
        )
        self.assertEqual(res.status_code, 201)

        # 7. Read comments
        res = self.client.get(f'/api/tasks/{task_id}/comments', headers=headers)
        self.assertEqual(res.status_code, 200)
        comments = json.loads(res.data)
        self.assertEqual(len(comments), 1)
        self.assertEqual(comments[0]['body'], 'Review started. Requirements look comprehensive.')

    def test_project_deletion(self):
        """Verify that a project can be deleted, cascading to its phases, tasks, and comments."""
        # 1. Login
        res = self.client.post('/api/auth/login', json={
            'email': 'admin@bankalhabib.com',
            'password': 'Admin123!'
        })
        token = json.loads(res.data)['token']
        headers = {'Authorization': f'Bearer {token}'}

        # 2. Create a temporary project
        res = self.client.post('/api/projects', json={
            'name': 'Temp Project To Delete',
            'description': 'This project will be deleted.',
            'load_defaults': True
        }, headers=headers)
        self.assertEqual(res.status_code, 201)
        project_id = json.loads(res.data)['id']

        # Verify phases exist
        res = self.client.get(f'/api/projects/{project_id}', headers=headers)
        proj_details = json.loads(res.data)
        phase_id = proj_details['phases'][0]['id']

        # Create a task in it
        res = self.client.post(
            f'/api/projects/{project_id}/tasks',
            json={
                'title': 'Temp Task',
                'description': 'Will be deleted.',
                'priority': 'Medium',
                'phase_id': phase_id
            },
            headers=headers
        )
        self.assertEqual(res.status_code, 201)
        task_id = json.loads(res.data)['id']

        # Add a comment
        res = self.client.post(
            f'/api/tasks/{task_id}/comments',
            json={'body': 'Temp Comment'},
            headers=headers
        )
        self.assertEqual(res.status_code, 201)

        # 3. Delete Project
        res = self.client.delete(f'/api/projects/{project_id}', headers=headers)
        self.assertEqual(res.status_code, 200)

        # 4. Verify Project is deleted
        res = self.client.get(f'/api/projects/{project_id}', headers=headers)
        self.assertEqual(res.status_code, 404)

        # 5. Verify cascade dropped phases, tasks, and comments from database
        with app.app_context():
            self.assertEqual(ProjectPhase.query.filter_by(project_id=project_id).count(), 0)
            self.assertEqual(Task.query.filter_by(project_id=project_id).count(), 0)
            self.assertEqual(Comment.query.filter_by(task_id=task_id).count(), 0)

    def test_user_management(self):
        """Verify that admins can list and edit user attributes (search, role, status)."""
        # 1. Login as Admin
        res = self.client.post('/api/auth/login', json={
            'email': 'admin@bankalhabib.com',
            'password': 'Admin123!'
        })
        admin_token = json.loads(res.data)['token']
        headers = {'Authorization': f'Bearer {admin_token}'}

        # Register a user
        self.client.post('/api/auth/signup', json={
            'name': 'Test User',
            'email': 'test.99999@bankalhabib.com',
            'password': 'Password123!',
            'role': 'Developer'
        })

        # 2. Get All Users
        res = self.client.get('/api/admin/users', headers=headers)
        self.assertEqual(res.status_code, 200)
        users = json.loads(res.data)
        self.assertTrue(len(users) >= 2) # Admin and Test User

        test_u = next(u for u in users if u['email'] == 'test.99999@bankalhabib.com')
        self.assertEqual(test_u['role'], 'Developer')
        self.assertEqual(test_u['status'], 'PENDING')

        # 3. Edit User details
        res = self.client.put(
            f'/api/admin/users/{test_u["id"]}',
            json={
                'name': 'Updated Test Name',
                'role': 'Compliance Officer',
                'status': 'APPROVED'
            },
            headers=headers
        )
        self.assertEqual(res.status_code, 200)
        updated = json.loads(res.data)['user']
        self.assertEqual(updated['name'], 'Updated Test Name')
        self.assertEqual(updated['role'], 'Compliance Officer')
        self.assertEqual(updated['status'], 'APPROVED')

    def test_role_access_restrictions(self):
        """Verify that phase-level role allocations block unauthorized users from creating/editing tasks."""
        # 1. Login as Admin and approve a test developer user
        res = self.client.post('/api/auth/login', json={
            'email': 'admin@bankalhabib.com',
            'password': 'Admin123!'
        })
        admin_token = json.loads(res.data)['token']
        admin_headers = {'Authorization': f'Bearer {admin_token}'}

        # Signup a Developer
        self.client.post('/api/auth/signup', json={
            'name': 'Dev User',
            'email': 'dev.11111@bankalhabib.com',
            'password': 'Password123!',
            'role': 'Developer'
        })

        # Fetch and approve the dev user
        res = self.client.get('/api/admin/users', headers=admin_headers)
        users = json.loads(res.data)
        dev_u = next(u for u in users if u['email'] == 'dev.11111@bankalhabib.com')
        self.client.put(f'/api/admin/users/{dev_u["id"]}', json={'status': 'APPROVED'}, headers=admin_headers)

        # Login as Developer
        res = self.client.post('/api/auth/login', json={
            'email': 'dev.11111@bankalhabib.com',
            'password': 'Password123!'
        })
        dev_token = json.loads(res.data)['token']
        dev_headers = {'Authorization': f'Bearer {dev_token}'}

        # 2. Setup project and phases
        res = self.client.post('/api/projects', json={'name': 'Role Access Test Project', 'load_defaults': True}, headers=admin_headers)
        project_id = json.loads(res.data)['id']

        res = self.client.get(f'/api/projects/{project_id}', headers=admin_headers)
        proj_data = json.loads(res.data)
        phases = proj_data['phases']

        # Default Phase 2 is Architecture & Security (Role: InfoSec Lead)
        # Default Phase 3 is Dev Implementation (Role: Developer)
        sec_phase = next(ph for ph in phases if 'Architecture' in ph['name'])
        dev_phase = next(ph for ph in phases if 'Dev Implementation' in ph['name'])

        # 3. Dev tries to create a task in InfoSec phase (Should Fail: 403)
        res = self.client.post(
            f'/api/projects/{project_id}/tasks',
            json={
                'title': 'Hack Entry',
                'phase_id': sec_phase['id'],
                'priority': 'Critical'
            },
            headers=dev_headers
        )
        self.assertEqual(res.status_code, 403)

        # 4. Dev tries to create a task in Developer phase (Should Succeed: 201)
        res = self.client.post(
            f'/api/projects/{project_id}/tasks',
            json={
                'title': 'Write Microservice',
                'phase_id': dev_phase['id'],
                'priority': 'Medium'
            },
            headers=dev_headers
        )
        self.assertEqual(res.status_code, 201)

if __name__ == '__main__':
    unittest.main()
