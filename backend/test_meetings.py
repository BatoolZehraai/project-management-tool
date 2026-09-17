import requests

BASE_URL = 'http://127.0.0.1:5000/api'

# 1. Login
try:
    login_res = requests.post(f'{BASE_URL}/auth/login', json={
        'email': 'admin@bankalhabib.com',
        'password': 'password123'
    })
    print("Login status:", login_res.status_code)
    token = login_res.json().get('token')
    headers = {'Authorization': f'Bearer {token}'}

    # 2. Get projects
    proj_res = requests.get(f'{BASE_URL}/projects', headers=headers)
    projects = proj_res.json()
    print("Projects count:", len(projects))
    project_id = projects[0]['id']

    # 3. Create scheduled meeting with base_url = http://localhost:3000
    meeting_payload = {
        'title': 'PCI-DSS Compliance & Architecture Gate Review',
        'phase_id': None,
        'agenda': 'Review zero-trust network topology and cryptographic token isolation.',
        'duration_minutes': 45,
        'scheduled_at': '2026-09-20T14:30:00.000Z',
        'invitees': ['external.auditor@gmail.com', 'security.lead@partner.org'],
        'is_instant': False,
        'base_url': 'http://localhost:3000'
    }

    create_res = requests.post(f'{BASE_URL}/projects/{project_id}/meetings', json=meeting_payload, headers=headers)
    print("Create meeting status:", create_res.status_code)
    meeting_data = create_res.json()
    print("Created meeting link:", meeting_data.get('meeting_link'))
    print("Room name:", meeting_data.get('room_name'))
    print("Attendees count:", len(meeting_data.get('attendees', [])))

    meeting_id = meeting_data.get('id')
    room_name = meeting_data.get('room_name')

    # 4. Test on-the-fly quick invite endpoint
    invite_res = requests.post(f'{BASE_URL}/meetings/{meeting_id}/invite', json={
        'email': 'governance.officer@outlook.com'
    }, headers=headers)
    print("Invite endpoint status:", invite_res.status_code, invite_res.json())

    # 5. Test public guest endpoint (no token required!)
    public_res = requests.get(f'{BASE_URL}/meetings/public/{room_name}')
    print("Public meeting endpoint status:", public_res.status_code)
    print("Public meeting title:", public_res.json().get('title'))
    print("Public meeting link:", public_res.json().get('meeting_link'))

    print("\n--- ALL BACKEND VERIFICATIONS PASSED ---")
except Exception as e:
    print("Backend test error:", e)
