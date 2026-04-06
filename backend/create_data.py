from users.models import User
from tasks.models import Task

# 3 Admins
admins = [
    ('admin', 'admin@polycab.com', 'Admin123!', 'Admin User'),
    ('admin_rajesh', 'rajesh@polycab.com', 'Admin123!', 'Rajesh Kumar'),
    ('admin_priya', 'priya@polycab.com', 'Admin123!', 'Priya Sharma'),
]
for username, email, password, full_name in admins:
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username=username, email=email, password=password, full_name=full_name, role='admin')
        print(f'Created admin: {username}')
    else:
        print(f'Already exists: {username}')

# 5 Users
users = [
    ('rammohan', 'rammohan@polycab.com', 'Rammohan@01', 'Rammohan Sangati', 'project_manager'),
    ('suresh_sm', 'suresh@polycab.com', 'User@1234', 'Suresh Babu', 'site_manager'),
    ('mahesh_sv', 'mahesh@polycab.com', 'User@1234', 'Mahesh Yadav', 'surveyor'),
    ('sunil_rc', 'sunil@polycab.com', 'User@1234', 'Sunil Patil', 'row_coordinator'),
    ('harish_qi', 'harish@polycab.com', 'User@1234', 'Harish Nair', 'quality_inspector'),
]
for username, email, password, full_name, role in users:
    if not User.objects.filter(username=username).exists():
        User.objects.create_user(username=username, email=email, password=password, full_name=full_name, role=role)
        print(f'Created user: {username}')
    else:
        print(f'Already exists: {username}')

# 10 Tasks
tasks_data = [
    ('Desktop Survey - Patna', 'desktop_survey_design', 'BIHAR', 'PATNA', 'PATNA', 'BIHTA', 'in_progress'),
    ('Network Health - Gaya', 'network_health_checkup', 'BIHAR', 'GAYA', 'GAYA', 'BODHGAYA', 'completed'),
    ('HOTO Existing - Muzaffarpur', 'hoto_existing', 'BIHAR', 'MUZAFFARPUR', 'MUZAFFARPUR', 'MOTIPUR', 'nil'),
    ('Detailed Design - Darbhanga', 'detailed_design', 'BIHAR', 'DARBHANGA', 'DARBHANGA', 'BIRAUL', 'in_progress'),
    ('ROW - Bhagalpur', 'row', 'BIHAR', 'BHAGALPUR', 'BHAGALPUR', 'NATHNAGAR', 'nil'),
    ('IFC - Patna Nalanda', 'ifc', 'BIHAR', 'PATNA', 'NALANDA', 'ISLAMPUR', 'completed'),
    ('IC - Begusarai', 'ic', 'BIHAR', 'DARBHANGA', 'BEGUSARAI', 'BARAUNI', 'in_progress'),
    ('As Built - Siwan', 'as_built', 'BIHAR', 'MUZAFFARPUR', 'SIWAN', 'SIWAN', 'nil'),
    ('HOTO Final - Munger', 'hoto_final', 'BIHAR', 'BHAGALPUR', 'MUNGER', 'JAMALPUR', 'completed'),
    ('Field Survey - Vaishali', 'field_survey', 'BIHAR', 'MUZAFFARPUR', 'VAISHALI', 'HAJIPUR', 'in_progress'),
]
user = User.objects.filter(role='project_manager').first()
for title, milestone, state, ba, district, block, status in tasks_data:
    if not Task.objects.filter(title=title).exists():
        Task.objects.create(
            title=title,
            milestone=milestone,
            state=state,
            business_area=ba,
            district=district,
            block=block,
            status=status,
            assigned_to=user,
            start_date='2026-01-01',
            estimated_end_date='2026-12-31',
        )
        print(f'Created task: {title}')
    else:
        print(f'Already exists: {title}')

print('All done!')