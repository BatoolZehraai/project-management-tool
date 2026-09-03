import os
import datetime
import time
import re
import uuid
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import jwt

from models import db, User, Project, ProjectPhase, Task, Comment, AuditLog, FileItem, ActivityLog
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
AVATARS_FOLDER = os.path.join(UPLOAD_FOLDER, 'avatars')
os.makedirs(AVATARS_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['AVATARS_FOLDER'] = AVATARS_FOLDER
ALLOWED_AVATAR_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}

# Enable CORS (allow credentials or standard headers for JWT authorization)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Default corporate domain constraint
INTERNAL_DOMAIN = "@bankalhabib.com"

# Seed default phases data helper with strict governing department ownership
DEFAULT_PHASES = [
    ("Phase 1: Business Analysis & Requirements (BRD/SRS)", "Define project scope, business specifications, and use cases.", "Business Analysis"),
    ("Phase 2: Architecture & Security Design", "Develop threat modeling (STRIDE), data flow diagrams, and encryption structures.", "Architecture & Design"),
    ("Phase 3: Dev Implementation & Task Sprint", "Microservices core development, API definitions, and sprint backlog completion.", "Software Engineering"),
    ("Phase 4: QA, VAPT & Security Audit", "Execute pen-testing, vulnerability assessments, and integration checks.", "QA"),
    ("Phase 5: Business UAT & Acceptance", "Gather business user acceptance signs and verify regulatory compliance.", "Compliance"),
    ("Phase 6: CAB & Production Release", "Deploy to live bank ledger after Change Advisory Board reviews.", "Operations & Release")
]

# ----------------- JWT Authentication Decorators & RBAC Guards -----------------

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
            
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            # Load user
            # SQLAlchemy 2.0 uses Session.get(Model, id)
            current_user = db.session.get(User, data['user_id'])
            if not current_user:
                return jsonify({'error': 'User account not found'}), 401
            if current_user.status != 'APPROVED':
                return jsonify({'error': 'Access denied. Account status: ' + current_user.status}), 403
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token session has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token is invalid'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.role not in ['SUPER_ADMIN', 'Admin']:
            return jsonify({'error': 'Administrator access required.'}), 403
        return f(current_user, *args, **kwargs)
    return decorated

def can_modify_stage_task(user, phase):
    """
    Department-Based Stage Ownership Guard:
    - SUPER_ADMIN / Admin has universal bypass permissions across all stages.
    - Other users can only modify/create/delete tasks if their department matches the stage's governing department.
    """
    if not user:
        return False
    if user.role in ['SUPER_ADMIN', 'Admin']:
        return True
    if not phase:
        return False
    stage_dept = (phase.governing_department or phase.role_access or '').strip().lower()
    user_dept = (user.department or '').strip().lower()
    return bool(stage_dept and user_dept and stage_dept == user_dept)

# ----------------- DB Initialization & Schema Auto-Migration -----------------

def migrate_database_schema():
    """Ensure database columns exist without dropping tables."""
    with app.app_context():
        try:
            from sqlalchemy import text
            col_stmts = [
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT 'Software Engineering'",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(300)",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30)",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS bio VARCHAR(250)",
                "ALTER TABLE project_phases ADD COLUMN IF NOT EXISTS governing_department VARCHAR(100)"
            ]
            with db.engine.connect() as conn:
                for stmt in col_stmts:
                    try:
                        conn.execute(text(stmt))
                        conn.commit()
                    except Exception:
                        conn.rollback()

                # Standard department mappings for legacy data
                phase_dept_map = {
                    'Project Manager': 'Business Analysis',
                    'InfoSec Lead': 'Architecture & Design',
                    'Developer': 'Software Engineering',
                    'QA Lead': 'QA',
                    'Compliance Officer': 'Compliance',
                    'CAB Committee': 'Operations & Release'
                }
                for role_val, dept_val in phase_dept_map.items():
                    try:
                        conn.execute(text(f"UPDATE project_phases SET governing_department = '{dept_val}' WHERE governing_department = '{role_val}' OR governing_department IS NULL OR governing_department = ''"))
                        conn.commit()
                    except Exception:
                        conn.rollback()

                try:
                    conn.execute(text("UPDATE users SET department = 'Executive Management', role = 'SUPER_ADMIN' WHERE email LIKE 'admin%'"))
                    conn.commit()
                except Exception:
                    conn.rollback()
                try:
                    conn.execute(text("UPDATE users SET department = 'Business Analysis' WHERE email LIKE 'batool%'"))
                    conn.commit()
                except Exception:
                    conn.rollback()
        except Exception as e:
            print(f"Migration notice: {e}")

def init_database_environment():
    db_uri = app.config['SQLALCHEMY_DATABASE_URI']
    if 'postgresql' in db_uri:
        try:
            engine = create_engine(db_uri)
            engine.connect()
        except OperationalError as e:
            err_msg = str(e)
            if 'does not exist' in err_msg or 'sdlc_governance' in err_msg:
                try:
                    import psycopg2
                    from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
                    conn = psycopg2.connect(dbname='postgres', user='postgres', password='postgres', host='localhost', port=5432)
                    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
                    cursor = conn.cursor()
                    cursor.execute('CREATE DATABASE sdlc_governance;')
                    cursor.close()
                    conn.close()
                except Exception as conn_err:
                    print(f"PostgreSQL connection failed: {conn_err}. Falling back to SQLite.")
                    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{Config.DEFAULT_SQLITE_PATH}'
            else:
                app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{Config.DEFAULT_SQLITE_PATH}'
    db.init_app(app)
    migrate_database_schema()

def seed_data():
    with app.app_context():
        db.create_all()
        migrate_database_schema()
        
        # Check if Admin seeded
        admin_email = 'admin' + INTERNAL_DOMAIN
        admin = User.query.filter_by(email=admin_email).first()
        if not admin:
            # Hash password
            hashed = generate_password_hash('Admin123!')
            admin = User(
                name='Corporate Administrator',
                email=admin_email,
                password_hash=hashed,
                department='Executive Management',
                role='SUPER_ADMIN',
                status='APPROVED'
            )
            db.session.add(admin)
            db.session.commit()
            print(f"Seeded administrator: {admin_email}")

        # Check if sample project exists, otherwise seed one
        if not Project.query.first():
            p = Project(
                name="Core Banking Ledger System Migration",
                description="Upgrading transactional ledger microservices to support ISO 20022 compliance."
            )
            db.session.add(p)
            db.session.commit()

            # Create default phases with governing departments
            for i, (name, desc, dept) in enumerate(DEFAULT_PHASES):
                phase = ProjectPhase(
                    project_id=p.id,
                    name=name,
                    description=desc,
                    phase_order=i,
                    governing_department=dept,
                    role_access=dept
                )
                db.session.add(phase)
            db.session.commit()

            # Get first phase ID
            first_phase = p.phases[0]
            dev_phase = p.phases[2] # Phase 3: Dev

            # Add tasks
            t1 = Task(
                project_id=p.id,
                phase_id=first_phase.id,
                title="Draft Product Scope Requirements",
                description="Draft initial scope document, actors, use cases, and functional specifications for transaction endpoints.",
                priority="High",
                assignee_id=admin.id
            )
            t2 = Task(
                project_id=p.id,
                phase_id=dev_phase.id,
                title="Setup Spring Boot Containerization",
                description="Create Dockerfile, define database connection pools, and config environment profiles.",
                priority="Medium",
                assignee_id=admin.id
            )
            db.session.add_all([t1, t2])
            db.session.commit()

            # Add a comment
            c1 = Comment(
                task_id=t2.id,
                author_id=admin.id,
                author_name=admin.name,
                body="InfoSec check: Ensure container runs as non-root user."
            )
            db.session.add(c1)
            db.session.commit()

            # Write Audit Log
            log = AuditLog(
                project_id=p.id,
                username="System",
                action="INITIAL_SEED",
                description="Seeded database with initial project: Core Banking Ledger System Migration, custom phases, and sample tasks."
            )
            db.session.add(log)
            db.session.commit()

init_database_environment()
# seed_data() will be run when the app starts directly or during migrations

# ----------------- REST API ENDPOINTS -----------------

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.json or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    department = data.get('department', 'Software Engineering').strip()
    role = data.get('role', 'TEAM_MEMBER').strip()
    
    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required'}), 400
        
    # Corporate Email Format Check (alphabet.numberid@bankalhabib.com)
    if not re.match(r'^[a-zA-Z]+\.[0-9]+@bankalhabib\.com$', email):
        return jsonify({'error': "Corporate restriction: Email must follow the format 'alphabet.numberid@bankalhabib.com' (e.g. john.12345@bankalhabib.com)."}), 400
        
    # Check duplicate
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'User already registered with this email address.'}), 400
        
    # Password hash
    hashed = generate_password_hash(password)
    
    user = User(
        name=name,
        email=email,
        password_hash=hashed,
        department=department,
        role=role,
        status='PENDING' # Registration starts as pending
    )
    
    db.session.add(user)
    db.session.commit()
    
    # Audit log
    audit = AuditLog(
        username=email,
        action="USER_SIGNUP",
        description=f"User '{name}' registered in department '{department}' with role '{role}'. Account status set to PENDING."
    )
    db.session.add(audit)
    db.session.commit()
    
    return jsonify({
        'message': 'Registration successful. Your account is pending review by an Administrator.',
        'user': user.to_dict()
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Invalid corporate email or password.'}), 401
        
    # Gated admin review blocker
    if user.status == 'PENDING':
        return jsonify({'error': 'Access Denied: Your account registration is pending review by an Administrator.'}), 403
    elif user.status == 'REJECTED':
        return jsonify({'error': 'Access Denied: Your account registration was rejected by an Administrator.'}), 403
        
    # Generate Token (Expires in 24 hours)
    token = jwt.encode({
        'user_id': user.id,
        'email': user.email,
        'name': user.name,
        'department': user.department or 'Software Engineering',
        'role': user.role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm='HS256')
    
    # Log audit
    audit = AuditLog(
        user_id=user.id,
        username=user.email,
        action="USER_LOGIN",
        description=f"User {user.name} ({user.department}) logged in successfully."
    )
    db.session.add(audit)
    db.session.commit()
    
    return jsonify({
        'token': token,
        'user': user.to_dict()
    })

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify(current_user.to_dict())

@app.route('/api/auth/profile', methods=['PUT'])
@token_required
def update_user_profile(current_user):
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    if not name:
        return jsonify({'error': 'Name cannot be empty'}), 400

    phone = data.get('phone', '').strip()
    bio = data.get('bio', '').strip()
    current_password = data.get('current_password', '').strip()
    new_password = data.get('new_password', '').strip()

    if current_password or new_password:
        if not current_password or not new_password:
            return jsonify({'error': 'Both current password and new password are required to update password'}), 400
        if not check_password_hash(current_user.password_hash, current_password):
            return jsonify({'error': 'Current password is incorrect'}), 400
        if len(new_password) < 6:
            return jsonify({'error': 'New password must be at least 6 characters long'}), 400
        current_user.password_hash = generate_password_hash(new_password)

    current_user.name = name
    current_user.phone = phone
    current_user.bio = bio
    db.session.commit()

    return jsonify({
        'message': 'Profile updated successfully',
        'user': current_user.to_dict()
    })

@app.route('/api/auth/profile/avatar', methods=['POST'])
@token_required
def upload_user_avatar(current_user):
    if 'avatar' not in request.files:
        return jsonify({'error': 'No avatar file uploaded'}), 400
    file = request.files['avatar']
    if not file or file.filename == '':
        return jsonify({'error': 'No file selected for upload'}), 400

    original_filename = file.filename
    if '.' not in original_filename:
        return jsonify({'error': 'Invalid file format'}), 400
    ext = original_filename.rsplit('.', 1)[1].lower()
    if ext not in ALLOWED_AVATAR_EXTENSIONS:
        return jsonify({'error': f'Unsupported format. Allowed: {", ".join(ALLOWED_AVATAR_EXTENSIONS)}'}), 400

    os.makedirs(app.config['AVATARS_FOLDER'], exist_ok=True)
    unique_filename = f"avatar_u{current_user.id}_{int(time.time())}.{ext}"
    save_path = os.path.join(app.config['AVATARS_FOLDER'], unique_filename)
    file.save(save_path)

    # Delete previous avatar file if exists
    if current_user.avatar_url and '/api/uploads/avatars/' in current_user.avatar_url:
        prev_filename = current_user.avatar_url.split('/api/uploads/avatars/')[-1]
        prev_path = os.path.join(app.config['AVATARS_FOLDER'], prev_filename)
        if os.path.exists(prev_path):
            try:
                os.remove(prev_path)
            except Exception as e:
                print(f"Error removing previous avatar: {e}")

    current_user.avatar_url = f"/api/uploads/avatars/{unique_filename}"
    db.session.commit()

    return jsonify({
        'message': 'Profile picture updated successfully',
        'avatar_url': current_user.avatar_url,
        'user': current_user.to_dict()
    })

@app.route('/api/auth/profile/avatar', methods=['DELETE'])
@token_required
def delete_user_avatar(current_user):
    if current_user.avatar_url and '/api/uploads/avatars/' in current_user.avatar_url:
        prev_filename = current_user.avatar_url.split('/api/uploads/avatars/')[-1]
        prev_path = os.path.join(app.config['AVATARS_FOLDER'], prev_filename)
        if os.path.exists(prev_path):
            try:
                os.remove(prev_path)
            except Exception as e:
                print(f"Error removing avatar file: {e}")

    current_user.avatar_url = None
    db.session.commit()

    return jsonify({
        'message': 'Profile picture removed successfully',
        'user': current_user.to_dict()
    })

@app.route('/api/uploads/avatars/<path:filename>', methods=['GET'])
def get_avatar_image(filename):
    return send_from_directory(app.config['AVATARS_FOLDER'], filename)

@app.route('/api/users/approved', methods=['GET'])
@token_required
def get_approved_users(current_user):
    dept = request.args.get('department', '').strip()
    query = User.query.filter_by(status='APPROVED')
    if dept:
        # Strictly return members of this stage's governing department OR SUPER_ADMIN / Admin
        query = query.filter(
            db.or_(
                User.department.ilike(dept),
                User.role.in_(['SUPER_ADMIN', 'Admin'])
            )
        )
    users = query.all()
    return jsonify([u.to_dict() for u in users])

# ----------------- ADMIN DASHBOARD ENDPOINTS -----------------

@app.route('/api/admin/pending-users', methods=['GET'])
@token_required
@admin_required
def get_pending_users(current_user):
    users = User.query.filter_by(status='PENDING').all()
    return jsonify([u.to_dict() for u in users])

@app.route('/api/admin/approve-user/<int:user_id>', methods=['POST'])
@token_required
@admin_required
def approve_user(current_user, user_id):
    target_user = db.session.get(User, user_id)
    if not target_user:
        return jsonify({'error': 'User not found'}), 404
        
    data = request.json or {}
    status = data.get('status')
    
    if status not in ['APPROVED', 'REJECTED']:
        return jsonify({'error': "Invalid status. Must be 'APPROVED' or 'REJECTED'."}), 400
        
    target_user.status = status
    db.session.commit()
    
    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        username=current_user.email,
        action="USER_APPROVAL",
        description=f"Administrator approved/updated status of {target_user.email} to {status}."
    )
    db.session.add(audit)
    db.session.commit()
    
    return jsonify({
        'message': f"User status successfully updated to {status}.",
        'user': target_user.to_dict()
    })

@app.route('/api/admin/users', methods=['GET'])
@token_required
@admin_required
def get_all_users(current_user):
    users = User.query.order_by(User.id).all()
    return jsonify([u.to_dict() for u in users])

@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
@token_required
@admin_required
def edit_user(current_user, user_id):
    target_user = db.session.get(User, user_id)
    if not target_user:
        return jsonify({'error': 'User not found'}), 404
        
    data = request.json or {}
    name = data.get('name', '').strip()
    role = data.get('role', '').strip()
    status = data.get('status', '').strip()
    
    if name:
        target_user.name = name
    if role:
        if role not in ['Developer', 'Project Manager', 'Compliance Officer', 'InfoSec Lead', 'QA Lead', 'CAB Committee', 'Admin']:
            return jsonify({'error': 'Invalid role'}), 400
        target_user.role = role
    if status:
        if status not in ['PENDING', 'APPROVED', 'REJECTED']:
            return jsonify({'error': 'Invalid status'}), 400
        target_user.status = status
        
    db.session.commit()
    
    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        username=current_user.email,
        action="USER_EDIT",
        description=f"Administrator edited profile of user {target_user.email} (Name: {target_user.name}, Role: {target_user.role}, Status: {target_user.status})."
    )
    db.session.add(audit)
    db.session.commit()
    
    return jsonify({
        'message': 'User details successfully updated.',
        'user': target_user.to_dict()
    })

# ----------------- PROJECTS & DYNAMIC PHASES -----------------

@app.route('/api/projects', methods=['GET'])
@token_required
def get_projects(current_user):
    projects = Project.query.all()
    return jsonify([p.to_dict() for p in projects])

@app.route('/api/projects', methods=['POST'])
@token_required
def create_project(current_user):
    data = request.json or {}
    name = data.get('name', '').strip()
    description = data.get('description', '')
    load_defaults = data.get('load_defaults', True)
    
    if not name:
        return jsonify({'error': 'Project name is required'}), 400
        
    p = Project(name=name, description=description)
    db.session.add(p)
    db.session.commit()
    
    # Optionally load default recommended banking phases
    if load_defaults:
        for idx, (p_name, p_desc, p_role) in enumerate(DEFAULT_PHASES):
            phase = ProjectPhase(
                project_id=p.id,
                name=p_name,
                description=p_desc,
                phase_order=idx,
                role_access=p_role
            )
            db.session.add(phase)
        db.session.commit()
        
    # Log Audit
    audit = AuditLog(
        project_id=p.id,
        user_id=current_user.id,
        username=current_user.email,
        action="PROJECT_CREATE",
        description=f"Created project '{name}' (Load default phases: {load_defaults})."
    )
    db.session.add(audit)
    db.session.commit()
    
    return jsonify(p.to_dict()), 201

@app.route('/api/projects/<int:project_id>', methods=['GET'])
@token_required
def get_project_details(current_user, project_id):
    project = db.session.get(Project, project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404
        
    phases = ProjectPhase.query.filter_by(project_id=project_id).order_by(ProjectPhase.phase_order).all()
    tasks = Task.query.filter_by(project_id=project_id).all()
    audit_logs = AuditLog.query.filter_by(project_id=project_id).order_by(AuditLog.timestamp.desc()).all()
    
    return jsonify({
        'project': project.to_dict(),
        'phases': [ph.to_dict() for ph in phases],
        'tasks': [t.to_dict() for t in tasks],
        'audit_logs': [log.to_dict() for log in audit_logs]
    })

@app.route('/api/projects/<int:project_id>', methods=['DELETE'])
@token_required
def delete_project(current_user, project_id):
    project = db.session.get(Project, project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404
        
    project_name = project.name
    db.session.delete(project)
    db.session.commit()
    
    # Audit log (note: project_id becomes null in database)
    audit = AuditLog(
        user_id=current_user.id,
        username=current_user.email,
        action="PROJECT_DELETE",
        description=f"Deleted project '{project_name}' and all associated tasks, phases, and comments."
    )
    db.session.add(audit)
    db.session.commit()
    
    return jsonify({'message': f"Project '{project_name}' was successfully deleted."})

# Add Custom Phase
@app.route('/api/projects/<int:project_id>/phases', methods=['POST'])
@token_required
def add_project_phase(current_user, project_id):
    project = db.session.get(Project, project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404
        
    data = request.json or {}
    name = data.get('name', '').strip()
    description = data.get('description', '')
    role_access = data.get('role_access', '').strip() or None
    
    if not name:
        return jsonify({'error': 'Phase name is required'}), 400
        
    # Determine phase order (append to end)
    max_order = db.session.query(db.func.max(ProjectPhase.phase_order)).filter_by(project_id=project_id).scalar()
    next_order = 0 if max_order is None else max_order + 1
    
    phase = ProjectPhase(
        project_id=project_id,
        name=name,
        description=description,
        phase_order=next_order,
        role_access=role_access
    )
    db.session.add(phase)
    db.session.commit()
    
    # Audit log
    audit = AuditLog(
        project_id=project_id,
        user_id=current_user.id,
        username=current_user.email,
        action="PHASE_CREATE",
        description=f"Added custom phase '{name}' at order index {next_order}."
    )
    db.session.add(audit)
    db.session.commit()
    
    return jsonify(phase.to_dict()), 201

# Delete Custom Phase
@app.route('/api/projects/<int:project_id>/phases/<int:phase_id>', methods=['DELETE'])
@token_required
def delete_project_phase(current_user, project_id, phase_id):
    phase = ProjectPhase.query.filter_by(project_id=project_id, id=phase_id).first()
    if not phase:
        return jsonify({'error': 'Phase not found'}), 404
        
    phase_name = phase.name
    
    # Remove phase (cascade will delete or we can shift tasks to another phase first)
    # The requirement indicates cascading deletion or task reset. Since cascade deletes tasks:
    db.session.delete(phase)
    db.session.commit()
    
    # Re-normalize order integers
    remaining_phases = ProjectPhase.query.filter_by(project_id=project_id).order_by(ProjectPhase.phase_order).all()
    for idx, rp in enumerate(remaining_phases):
        rp.phase_order = idx
    db.session.commit()
    
    # Audit log
    audit = AuditLog(
        project_id=project_id,
        user_id=current_user.id,
        username=current_user.email,
        action="PHASE_DELETE",
        description=f"Deleted phase '{phase_name}'. Reordered remaining stages."
    )
    db.session.add(audit)
    db.session.commit()
    
    return jsonify({'message': f"Phase '{phase_name}' deleted successfully."})

# ----------------- TASKS (CRUD & SHIFTING) -----------------

@app.route('/api/projects/<int:project_id>/tasks', methods=['POST'])
@token_required
def create_project_task(current_user, project_id):
    project = db.session.get(Project, project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404
        
    data = request.json or {}
    title = data.get('title', '').strip()
    description = data.get('description', '')
    priority = data.get('priority', 'Medium')
    assignee_id = data.get('assignee_id')
    phase_id = data.get('phase_id')
    
    if not title:
        return jsonify({'error': 'Task title is required'}), 400
    if not phase_id:
        return jsonify({'error': 'Phase assignment is required'}), 400
        
    # Verify phase belongs to this project
    phase = ProjectPhase.query.filter_by(project_id=project_id, id=phase_id).first()
    if not phase:
        return jsonify({'error': 'Selected phase does not belong to this project'}), 400
        
    # Enforce strict department-based stage ownership
    if not can_modify_stage_task(current_user, phase):
        return jsonify({"error": "Forbidden: You have view-only access to stages outside your department."}), 403
        
    due_date = data.get('due_date')
    status = data.get('status', 'To Do')
    
    # Verify assignee is approved and belongs to the stage's governing department
    if assignee_id:
        assignee = db.session.get(User, assignee_id)
        if not assignee or assignee.status != 'APPROVED':
            return jsonify({'error': 'Assignee is invalid or not approved'}), 400
            
        stage_dept = (phase.governing_department or phase.role_access or '').strip().lower()
        ass_dept = (assignee.department or '').strip().lower()
        if assignee.role not in ['SUPER_ADMIN', 'Admin'] and ass_dept != stage_dept:
            return jsonify({'error': f"Task delegation error: Assignee must belong to the stage's governing department ('{phase.governing_department or phase.role_access}')."}), 400
            
    task = Task(
        project_id=project_id,
        phase_id=phase_id,
        title=title,
        description=description,
        priority=priority,
        assignee_id=assignee_id or None,
        status=status,
        due_date=due_date
    )
    db.session.add(task)
    db.session.commit()
    
    # Audit
    assignee_name = task.assignee.name if task.assignee else 'Unassigned'
    audit = AuditLog(
        project_id=project_id,
        user_id=current_user.id,
        username=current_user.email,
        action="TASK_CREATE",
        description=f"Created task '{title}' under phase '{phase.name}' assigned to {assignee_name}."
    )
    db.session.add(audit)

    # Multi-user Activity Log
    activity = ActivityLog(
        project_id=project_id,
        task_id=task.id,
        user_id=current_user.id,
        user_name=current_user.name,
        user_email=current_user.email,
        user_role=current_user.role,
        action_type="CREATE_TASK",
        task_title=task.title,
        details=f"{current_user.name} created task '{task.title}' under phase '{phase.name}'.",
        previous_state=None,
        new_state=status
    )
    db.session.add(activity)
    db.session.commit()
    
    return jsonify(task.to_dict()), 201

@app.route('/api/projects/<int:project_id>/tasks/<int:task_id>', methods=['PUT'])
@token_required
def update_project_task(current_user, project_id, task_id):
    task = Task.query.filter_by(project_id=project_id, id=task_id).first()
    if not task:
        return jsonify({'error': 'Task not found'}), 404
        
    # Enforce department-based stage ownership on the current phase of the task
    current_phase = db.session.get(ProjectPhase, task.phase_id)
    if not can_modify_stage_task(current_user, current_phase):
        return jsonify({"error": "Forbidden: You have view-only access to stages outside your department."}), 403
        
    data = request.json or {}
    
    # Capture snapshot of old state for tracking
    old_title = task.title
    old_desc = task.description
    old_priority = task.priority
    old_assignee_id = task.assignee_id
    old_assignee_name = task.assignee.name if task.assignee else 'Unassigned'
    old_status = task.status
    old_phase_id = task.phase_id
    old_phase = db.session.get(ProjectPhase, old_phase_id)
    
    # Update text fields
    if 'title' in data:
        task.title = data['title'].strip()
    if 'description' in data:
        task.description = data['description']
    if 'priority' in data:
        task.priority = data['priority']
    if 'assignee_id' in data:
        ass_id = data['assignee_id']
        if ass_id:
            assignee = db.session.get(User, ass_id)
            if not assignee or assignee.status != 'APPROVED':
                return jsonify({'error': 'Selected assignee is invalid'}), 400
            target_phase = ProjectPhase.query.filter_by(project_id=project_id, id=data.get('phase_id', task.phase_id)).first() or current_phase
            stage_dept = (target_phase.governing_department or target_phase.role_access or '').strip().lower()
            ass_dept = (assignee.department or '').strip().lower()
            if assignee.role not in ['SUPER_ADMIN', 'Admin'] and ass_dept != stage_dept:
                return jsonify({'error': f"Task delegation error: Assignee must belong to the stage's governing department ('{target_phase.governing_department or target_phase.role_access}')."}), 400
            task.assignee_id = ass_id
        else:
            task.assignee_id = None
            
    if 'status' in data:
        status = data['status'].strip()
        if status in ['To Do', 'In Progress', 'Completed']:
            task.status = status
            
    if 'checklist_json' in data:
        try:
            import json
            json.loads(data['checklist_json'])
            task.checklist_json = data['checklist_json']
        except Exception:
            return jsonify({'error': 'Invalid checklist JSON format'}), 400

    if 'due_date' in data:
        task.due_date = data['due_date'] or None
            
    # Handle phase shifting
    if 'phase_id' in data:
        new_phase_id = data['phase_id']
        if new_phase_id != old_phase_id:
            # Verify new phase
            new_phase = ProjectPhase.query.filter_by(project_id=project_id, id=new_phase_id).first()
            if not new_phase:
                return jsonify({'error': 'Selected target phase does not belong to this project'}), 400
            # External users cannot shift into or out of phases they do not govern
            if not can_modify_stage_task(current_user, new_phase):
                return jsonify({"error": "Forbidden: You have view-only access to stages outside your department."}), 403
            task.phase_id = new_phase_id
            
            # Log audit for movement
            old_phase_obj = db.session.get(ProjectPhase, old_phase_id)
            audit = AuditLog(
                project_id=project_id,
                user_id=current_user.id,
                username=current_user.email,
                action="TASK_SHIFT",
                description=f"Moved task '{task.title}' from '{old_phase_obj.name if old_phase_obj else 'Unknown'}' to '{new_phase.name}'."
            )
            db.session.add(audit)

    # Activity Tracking
    logged_action = False
    
    # 1. Status transition (e.g., "To Do" to "In Progress" or "Completed")
    if 'status' in data and task.status != old_status:
        activity = ActivityLog(
            project_id=project_id,
            task_id=task.id,
            user_id=current_user.id,
            user_name=current_user.name,
            user_email=current_user.email,
            user_role=current_user.role,
            action_type="STATUS_CHANGE",
            task_title=task.title,
            details=f"{current_user.name} moved '{task.title}' to {task.status}",
            previous_state=old_status,
            new_state=task.status
        )
        db.session.add(activity)
        logged_action = True

    # 2. Stage / Phase shift
    if 'phase_id' in data and task.phase_id != old_phase_id:
        target_phase = db.session.get(ProjectPhase, task.phase_id)
        activity = ActivityLog(
            project_id=project_id,
            task_id=task.id,
            user_id=current_user.id,
            user_name=current_user.name,
            user_email=current_user.email,
            user_role=current_user.role,
            action_type="STAGE_SHIFT",
            task_title=task.title,
            details=f"{current_user.name} moved '{task.title}' from '{old_phase.name if old_phase else 'Unknown'}' to '{target_phase.name if target_phase else 'Unknown'}'.",
            previous_state=old_phase.name if old_phase else 'Unknown',
            new_state=target_phase.name if target_phase else 'Unknown'
        )
        db.session.add(activity)
        logged_action = True

    # 3. Assignee changed
    if 'assignee_id' in data and task.assignee_id != old_assignee_id:
        new_assignee_name = task.assignee.name if task.assignee else 'Unassigned'
        activity = ActivityLog(
            project_id=project_id,
            task_id=task.id,
            user_id=current_user.id,
            user_name=current_user.name,
            user_email=current_user.email,
            user_role=current_user.role,
            action_type="REASSIGN_TASK",
            task_title=task.title,
            details=f"{current_user.name} reassigned '{task.title}' to {new_assignee_name}.",
            previous_state=old_assignee_name,
            new_state=new_assignee_name
        )
        db.session.add(activity)
        logged_action = True

    # 4. Priority changed
    if 'priority' in data and task.priority != old_priority:
        activity = ActivityLog(
            project_id=project_id,
            task_id=task.id,
            user_id=current_user.id,
            user_name=current_user.name,
            user_email=current_user.email,
            user_role=current_user.role,
            action_type="PRIORITY_CHANGE",
            task_title=task.title,
            details=f"{current_user.name} changed priority of '{task.title}' from {old_priority} to {task.priority}.",
            previous_state=old_priority,
            new_state=task.priority
        )
        db.session.add(activity)
        logged_action = True

    # 5. General detail updates (e.g. title, description, due date, checklist items)
    if not logged_action and (
        ('title' in data and task.title != old_title) or 
        ('description' in data and task.description != old_desc) or
        ('checklist_json' in data) or
        ('due_date' in data)
    ):
        activity = ActivityLog(
            project_id=project_id,
            task_id=task.id,
            user_id=current_user.id,
            user_name=current_user.name,
            user_email=current_user.email,
            user_role=current_user.role,
            action_type="UPDATE_TASK",
            task_title=task.title,
            details=f"{current_user.name} updated details of '{task.title}'.",
            previous_state=None,
            new_state=None
        )
        db.session.add(activity)
            
    db.session.commit()
    
    return jsonify(task.to_dict())

@app.route('/api/projects/<int:project_id>/tasks/<int:task_id>', methods=['DELETE'])
@token_required
def delete_project_task(current_user, project_id, task_id):
    task = Task.query.filter_by(project_id=project_id, id=task_id).first()
    if not task:
        return jsonify({'error': 'Task not found'}), 404
        
    # Enforce department-based stage ownership on the current phase of the task
    phase = db.session.get(ProjectPhase, task.phase_id)
    if not can_modify_stage_task(current_user, phase):
        return jsonify({"error": "Forbidden: You have view-only access to stages outside your department."}), 403
        
    task_title = task.title
    old_status = task.status
    db.session.delete(task)
    
    # Audit log
    audit = AuditLog(
        project_id=project_id,
        user_id=current_user.id,
        username=current_user.email,
        action="TASK_DELETE",
        description=f"Deleted task '{task_title}'."
    )
    db.session.add(audit)
    
    # Multi-user Activity Log
    activity = ActivityLog(
        project_id=project_id,
        task_id=None,
        user_id=current_user.id,
        user_name=current_user.name,
        user_email=current_user.email,
        user_role=current_user.role,
        action_type="DELETE_TASK",
        task_title=task_title,
        details=f"{current_user.name} deleted task '{task_title}'.",
        previous_state=old_status,
        new_state=None
    )
    db.session.add(activity)
    db.session.commit()
    
    return jsonify({'message': 'Task deleted successfully.'})

@app.route('/api/projects/<int:project_id>/activities', methods=['GET'])
@token_required
def get_project_activities(current_user, project_id):
    project = db.session.get(Project, project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404
        
    limit = request.args.get('limit', default=50, type=int)
    limit = min(max(limit, 1), 200)
    
    logs = ActivityLog.query.filter_by(project_id=project_id).order_by(ActivityLog.created_at.desc()).limit(limit).all()
    return jsonify([log.to_dict() for log in logs])

# ----------------- TASK COLLABORATIVE COMMENTS -----------------

@app.route('/api/tasks/<int:task_id>/comments', methods=['POST'])
@token_required
def create_task_comment(current_user, task_id):
    task = db.session.get(Task, task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
        
    data = request.json or {}
    body = data.get('body', '').strip()
    
    if not body:
        return jsonify({'error': 'Comment body cannot be blank'}), 400
        
    comment = Comment(
        task_id=task_id,
        author_id=current_user.id,
        author_name=current_user.name,
        body=body
    )
    db.session.add(comment)
    db.session.commit()
    
    # Write Audit entry for task comment activity
    audit = AuditLog(
        project_id=task.project_id,
        user_id=current_user.id,
        username=current_user.email,
        action="COMMENT_CREATE",
        description=f"Added comment on task '{task.title}': '{body[:50]}...'"
    )
    db.session.add(audit)
    db.session.commit()
    
    return jsonify(comment.to_dict()), 201

@app.route('/api/tasks/<int:task_id>/comments', methods=['GET'])
@token_required
def get_task_comments(current_user, task_id):
    task = db.session.get(Task, task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
        
    comments = Comment.query.filter_by(task_id=task_id).order_by(Comment.created_at.desc()).all()
    return jsonify([c.to_dict() for c in comments])

@app.route('/api/comments/<int:comment_id>', methods=['DELETE'])
@token_required
def delete_comment(current_user, comment_id):
    comment = db.session.get(Comment, comment_id)
    if not comment:
        return jsonify({'error': 'Comment not found'}), 404

    # Allow comment author or Admin to delete
    if current_user.role != 'Admin' and comment.author_id != current_user.id:
        return jsonify({'error': 'Access Denied: You can only delete your own comments.'}), 403

    task = db.session.get(Task, comment.task_id)
    proj_id = task.project_id if task else None

    db.session.delete(comment)
    
    if proj_id:
        audit = AuditLog(
            project_id=proj_id,
            user_id=current_user.id,
            username=current_user.email,
            action="COMMENT_DELETE",
            description=f"Deleted comment on task #{comment.task_id}."
        )
        db.session.add(audit)
    
    db.session.commit()
    return jsonify({'message': 'Comment deleted successfully.'}), 200

@app.route('/api/comments/<int:comment_id>', methods=['PUT'])
@token_required
def update_comment(current_user, comment_id):
    comment = db.session.get(Comment, comment_id)
    if not comment:
        return jsonify({'error': 'Comment not found'}), 404

    # Allow comment author or Admin to edit
    if current_user.role != 'Admin' and comment.author_id != current_user.id:
        return jsonify({'error': 'Access Denied: You can only edit your own comments.'}), 403

    data = request.get_json() or {}
    new_body = (data.get('body') or '').strip()
    if not new_body:
        return jsonify({'error': 'Comment body cannot be empty.'}), 400

    comment.body = new_body
    comment.updated_at = datetime.datetime.utcnow()

    task = db.session.get(Task, comment.task_id)
    proj_id = task.project_id if task else None

    if proj_id:
        audit = AuditLog(
            project_id=proj_id,
            user_id=current_user.id,
            username=current_user.email,
            action="COMMENT_EDIT",
            description=f"Edited comment #{comment.id} on task '{task.title if task else comment.task_id}'."
        )
        db.session.add(audit)

    db.session.commit()
    return jsonify(comment.to_dict()), 200

# ----------------- FILE & FOLDER INTEGRATION ENDPOINTS -----------------

def get_file_extension(filename):
    if '.' in filename:
        return filename.rsplit('.', 1)[1].lower()
    return 'file'

@app.route('/api/files', methods=['GET'])
@token_required
def get_files(current_user):
    project_id = request.args.get('project_id', type=int)
    phase_id = request.args.get('phase_id')
    task_id = request.args.get('task_id')
    parent_id = request.args.get('parent_id')

    query = FileItem.query
    if project_id:
        query = query.filter_by(project_id=project_id)

    if phase_id is not None:
        if phase_id == '' or phase_id == 'null':
            query = query.filter(FileItem.phase_id.is_(None))
        else:
            query = query.filter_by(phase_id=int(phase_id))

    if task_id is not None:
        if task_id == '' or task_id == 'null':
            query = query.filter(FileItem.task_id.is_(None))
        else:
            query = query.filter_by(task_id=int(task_id))

    if parent_id is not None:
        if parent_id == '' or parent_id == 'null' or parent_id == 'root':
            query = query.filter(FileItem.parent_id.is_(None))
        else:
            query = query.filter_by(parent_id=int(parent_id))

    # Sort folders first, then alphabetically by name
    items = query.order_by(FileItem.is_folder.desc(), FileItem.name.asc()).all()
    return jsonify([item.to_dict() for item in items]), 200

@app.route('/api/files/upload', methods=['POST'])
@token_required
def upload_file(current_user):
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected for upload'}), 400

    project_id = request.form.get('project_id', type=int)
    if not project_id:
        return jsonify({'error': 'project_id is required'}), 400

    phase_id_val = request.form.get('phase_id')
    phase_id = int(phase_id_val) if phase_id_val and phase_id_val != 'null' and phase_id_val != 'ALL' else None

    task_id_val = request.form.get('task_id')
    task_id = int(task_id_val) if task_id_val and task_id_val != 'null' else None

    parent_id_val = request.form.get('parent_id')
    parent_id = int(parent_id_val) if parent_id_val and parent_id_val != 'null' and parent_id_val != 'root' else None

    original_filename = secure_filename(file.filename) or 'unnamed_file'
    file_ext = get_file_extension(original_filename)
    unique_filename = f"{uuid.uuid4().hex[:12]}_{original_filename}"
    save_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)

    file.save(save_path)
    file_size = os.path.getsize(save_path)

    new_file = FileItem(
        project_id=project_id,
        phase_id=phase_id,
        task_id=task_id,
        parent_id=parent_id,
        name=original_filename,
        is_folder=False,
        file_path=unique_filename,
        file_size=file_size,
        file_type=file_ext,
        uploaded_by_id=current_user.id,
        uploaded_by_name=current_user.name
    )
    db.session.add(new_file)

    target_desc = f"Task #{task_id}" if task_id else (f"Stage #{phase_id}" if phase_id else f"Project #{project_id}")
    audit = AuditLog(
        project_id=project_id,
        user_id=current_user.id,
        username=current_user.name,
        action="FILE_UPLOAD",
        description=f"Uploaded file '{original_filename}' ({file_size} bytes) to {target_desc}."
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify(new_file.to_dict()), 201

@app.route('/api/files/folder', methods=['POST'])
@token_required
def create_folder(current_user):
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    project_id = data.get('project_id')
    if not name or not project_id:
        return jsonify({'error': 'name and project_id are required'}), 400

    phase_id_val = data.get('phase_id')
    phase_id = int(phase_id_val) if phase_id_val and phase_id_val != 'null' and phase_id_val != 'ALL' else None

    task_id_val = data.get('task_id')
    task_id = int(task_id_val) if task_id_val and task_id_val != 'null' else None

    parent_id_val = data.get('parent_id')
    parent_id = int(parent_id_val) if parent_id_val and parent_id_val != 'null' and parent_id_val != 'root' else None

    new_folder = FileItem(
        project_id=int(project_id),
        phase_id=phase_id,
        task_id=task_id,
        parent_id=parent_id,
        name=name,
        is_folder=True,
        file_size=0,
        file_type='folder',
        uploaded_by_id=current_user.id,
        uploaded_by_name=current_user.name
    )
    db.session.add(new_folder)

    target_desc = f"Task #{task_id}" if task_id else (f"Stage #{phase_id}" if phase_id else f"Project #{project_id}")
    audit = AuditLog(
        project_id=int(project_id),
        user_id=current_user.id,
        username=current_user.name,
        action="FOLDER_CREATE",
        description=f"Created folder '{name}' in {target_desc}."
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify(new_folder.to_dict()), 201

@app.route('/api/files/<int:file_id>/download', methods=['GET'])
def download_file(file_id):
    token = None
    if 'Authorization' in request.headers and request.headers['Authorization'].startswith("Bearer "):
        token = request.headers['Authorization'].split(" ")[1]
    elif 'token' in request.args:
        token = request.args.get('token')

    if not token:
        return jsonify({'error': 'Authentication required'}), 401
    try:
        jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
    except Exception:
        return jsonify({'error': 'Invalid or expired authentication token'}), 401

    item = db.session.get(FileItem, file_id)
    if not item or item.is_folder:
        return jsonify({'error': 'File not found'}), 404

    inline = request.args.get('inline', 'false').lower() == 'true'
    return send_from_directory(
        app.config['UPLOAD_FOLDER'],
        item.file_path,
        download_name=item.name,
        as_attachment=not inline
    )

@app.route('/api/files/<int:file_id>', methods=['DELETE'])
@token_required
def delete_file_item(current_user, file_id):
    item = db.session.get(FileItem, file_id)
    if not item:
        return jsonify({'error': 'Item not found'}), 404

    def delete_item_recursive(node):
        for child in list(node.children):
            delete_item_recursive(child)
        if not node.is_folder and node.file_path:
            disk_path = os.path.join(app.config['UPLOAD_FOLDER'], node.file_path)
            if os.path.exists(disk_path):
                try:
                    os.remove(disk_path)
                except Exception as e:
                    print(f"Error removing disk file {disk_path}: {e}")

    delete_item_recursive(item)
    name = item.name
    proj_id = item.project_id
    is_folder = item.is_folder
    db.session.delete(item)

    audit = AuditLog(
        project_id=proj_id,
        user_id=current_user.id,
        username=current_user.name,
        action="FILE_DELETE",
        description=f"Deleted {'folder' if is_folder else 'file'} '{name}'."
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify({'message': f"{'Folder' if is_folder else 'File'} deleted successfully."}), 200

# ----------------- SYSTEM DATABASE RESET -----------------

@app.route('/api/projects/reset', methods=['POST'])
@token_required
@admin_required
def reset_database(current_user):
    try:
        db.drop_all()
        seed_data()
        return jsonify({'message': 'Database re-created and seeded successfully.'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        seed_data()
    app.run(host='0.0.0.0', port=5000, debug=True)
