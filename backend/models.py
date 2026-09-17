from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    department = db.Column(db.String(100), nullable=False, default='Software Engineering')  # Business Analysis, Architecture & Design, Software Engineering, QA, Compliance, etc.
    role = db.Column(db.String(50), nullable=False, default='TEAM_MEMBER')  # SUPER_ADMIN, DEPT_HEAD, TEAM_MEMBER (Admin treated as SUPER_ADMIN)
    status = db.Column(db.String(20), default='PENDING')  # PENDING, APPROVED, REJECTED
    avatar_url = db.Column(db.String(300), nullable=True)
    phone = db.Column(db.String(30), nullable=True)
    bio = db.Column(db.String(250), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    tasks = db.relationship('Task', backref='assignee', foreign_keys='Task.assignee_id')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'department': self.department or 'Software Engineering',
            'role': self.role,
            'status': self.status,
            'avatar_url': self.avatar_url,
            'phone': self.phone or '',
            'bio': self.bio or '',
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Project(db.Model):
    __tablename__ = 'projects'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    phases = db.relationship('ProjectPhase', backref='project', cascade='all, delete-orphan', order_by='ProjectPhase.phase_order')
    tasks = db.relationship('Task', backref='project', cascade='all, delete-orphan')
    files = db.relationship('FileItem', backref='project', cascade='all, delete-orphan')
    activities = db.relationship('ActivityLog', backref='project', cascade='all, delete-orphan', order_by='ActivityLog.created_at.desc()')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'phase_count': len(self.phases),
            'task_count': len(self.tasks)
        }

class ProjectPhase(db.Model):
    __tablename__ = 'project_phases'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    phase_order = db.Column(db.Integer, nullable=False)
    governing_department = db.Column(db.String(100), nullable=True)  # Business Analysis, Architecture & Design, Software Engineering, QA, Compliance, Operations & Release
    role_access = db.Column(db.String(100), nullable=True)  # Legacy role access mapping
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    tasks = db.relationship('Task', backref='phase', cascade='all, delete-orphan')
    files = db.relationship('FileItem', backref='phase', cascade='all, delete-orphan')

    def to_dict(self):
        dept = self.governing_department or self.role_access
        return {
            'id': self.id,
            'project_id': self.project_id,
            'name': self.name,
            'description': self.description,
            'phase_order': self.phase_order,
            'governing_department': dept,
            'role_access': self.role_access or dept,
            'file_count': len([f for f in self.files if not f.is_folder]),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Task(db.Model):
    __tablename__ = 'project_tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    phase_id = db.Column(db.Integer, db.ForeignKey('project_phases.id'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    priority = db.Column(db.String(20), nullable=False)  # Low, Medium, High, Critical
    assignee_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    status = db.Column(db.String(50), default='To Do')  # To Do, In Progress, Completed
    checklist_json = db.Column(db.Text, default='[]')  # JSON array of checklist items
    due_date = db.Column(db.String(10), nullable=True)  # YYYY-MM-DD format
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    comments = db.relationship('Comment', backref='task', cascade='all, delete-orphan', order_by='Comment.created_at.desc()')
    files = db.relationship('FileItem', backref='task', cascade='all, delete-orphan')

    def to_dict(self):
        gov_dept = None
        if self.phase:
            gov_dept = self.phase.governing_department or self.phase.role_access
        return {
            'id': self.id,
            'project_id': self.project_id,
            'phase_id': self.phase_id,
            'stage_id': self.phase_id,
            'governing_department': gov_dept,
            'title': self.title,
            'description': self.description,
            'priority': self.priority,
            'assignee_id': self.assignee_id,
            'assigned_to': self.assignee_id,
            'assignee_name': self.assignee.name if self.assignee else 'Unassigned',
            'assignee_email': self.assignee.email if self.assignee else None,
            'assignee_department': self.assignee.department if self.assignee else None,
            'status': self.status,
            'checklist_json': self.checklist_json,
            'due_date': self.due_date,
            'comment_count': len(self.comments),
            'attachment_count': len([f for f in self.files if not f.is_folder]),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Comment(db.Model):
    __tablename__ = 'task_comments'
    
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('project_tasks.id'), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    author_name = db.Column(db.String(100), nullable=False)
    body = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'task_id': self.task_id,
            'author_id': self.author_id,
            'author_name': self.author_name,
            'body': self.body,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='SET NULL'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    username = db.Column(db.String(100), nullable=False)
    action = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'user_id': self.user_id,
            'username': self.username,
            'action': self.action,
            'description': self.description,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

class FileItem(db.Model):
    __tablename__ = 'file_items'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False)
    phase_id = db.Column(db.Integer, db.ForeignKey('project_phases.id', ondelete='CASCADE'), nullable=True)
    task_id = db.Column(db.Integer, db.ForeignKey('project_tasks.id', ondelete='CASCADE'), nullable=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('file_items.id', ondelete='CASCADE'), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    is_folder = db.Column(db.Boolean, default=False)
    file_path = db.Column(db.String(500), nullable=True)
    file_size = db.Column(db.Integer, default=0)
    file_type = db.Column(db.String(100), nullable=True)
    uploaded_by_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    uploaded_by_name = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Self-referencing relationship for subfolders
    children = db.relationship('FileItem', backref=db.backref('parent', remote_side=[id]), cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'phase_id': self.phase_id,
            'task_id': self.task_id,
            'parent_id': self.parent_id,
            'name': self.name,
            'is_folder': self.is_folder,
            'file_path': self.file_path,
            'file_size': self.file_size,
            'file_type': self.file_type,
            'uploaded_by_id': self.uploaded_by_id,
            'uploaded_by_name': self.uploaded_by_name,
            'item_count': len(self.children) if self.is_folder else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Bug(db.Model):
    __tablename__ = 'bugs'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, index=True)
    phase_id = db.Column(db.Integer, db.ForeignKey('project_phases.id', ondelete='CASCADE'), nullable=False, index=True)
    task_id = db.Column(db.Integer, db.ForeignKey('project_tasks.id', ondelete='SET NULL'), nullable=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    severity = db.Column(db.String(20), nullable=False, default='MEDIUM')  # CRITICAL, HIGH, MEDIUM, LOW
    status = db.Column(db.String(20), nullable=False, default='NEW')  # NEW, ASSIGNED, IN_PROGRESS, RESOLVED, VERIFIED, CLOSED, REOPENED
    reported_by_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    assigned_to_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Explicit relationships
    project = db.relationship('Project', backref=db.backref('bugs', cascade='all, delete-orphan'))
    phase = db.relationship('ProjectPhase', backref=db.backref('bugs', cascade='all, delete-orphan'))
    task = db.relationship('Task', backref=db.backref('bugs', cascade='all, delete-orphan'))
    reported_by = db.relationship('User', foreign_keys=[reported_by_id], backref='reported_bugs')
    assigned_to = db.relationship('User', foreign_keys=[assigned_to_id], backref='assigned_bugs')
    activities = db.relationship('ActivityLog', backref='bug', cascade='all, delete-orphan', order_by='ActivityLog.created_at.asc()')

    @property
    def bug_code(self):
        return f'BUG-{self.id:03d}' if self.id else 'BUG-NEW'

    def to_dict(self):
        phase_name = self.phase.name if self.phase else None
        gov_dept = None
        if self.phase:
            gov_dept = self.phase.governing_department or self.phase.role_access
        
        return {
            'id': self.id,
            'bug_code': f'BUG-{self.id:03d}',
            'project_id': self.project_id,
            'phase_id': self.phase_id,
            'phase_name': phase_name,
            'governing_department': gov_dept,
            'task_id': self.task_id,
            'task_title': self.task.title if self.task else None,
            'title': self.title,
            'description': self.description,
            'severity': self.severity,
            'status': self.status,
            'reported_by_id': self.reported_by_id,
            'reported_by_name': self.reported_by.name if self.reported_by else 'Unknown Reporter',
            'reported_by_email': self.reported_by.email if self.reported_by else None,
            'reported_by_dept': self.reported_by.department if self.reported_by else None,
            'assigned_to_id': self.assigned_to_id,
            'assigned_to_name': self.assigned_to.name if self.assigned_to else 'Unassigned',
            'assigned_to_email': self.assigned_to.email if self.assigned_to else None,
            'assigned_to_dept': self.assigned_to.department if self.assigned_to else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'history_count': len(self.activities)
        }

class ActivityLog(db.Model):
    __tablename__ = 'activity_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, index=True)
    task_id = db.Column(db.Integer, db.ForeignKey('project_tasks.id', ondelete='SET NULL'), nullable=True)
    bug_id = db.Column(db.Integer, db.ForeignKey('bugs.id', ondelete='CASCADE'), nullable=True, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    user_name = db.Column(db.String(100), nullable=False)
    user_email = db.Column(db.String(120), nullable=False)
    user_role = db.Column(db.String(50), nullable=False)
    action_type = db.Column(db.String(50), nullable=False)  # CREATE_TASK, STATUS_CHANGE, STAGE_SHIFT, UPDATE_TASK, REASSIGN_TASK, DELETE_TASK, BUG_REPORTED, BUG_STATUS_CHANGE, BUG_ASSIGNED, BUG_UPDATED
    task_title = db.Column(db.String(150), nullable=True)
    bug_title = db.Column(db.String(150), nullable=True)
    details = db.Column(db.Text, nullable=False)
    previous_state = db.Column(db.Text, nullable=True)
    new_state = db.Column(db.Text, nullable=True)
    is_archived = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'task_id': self.task_id,
            'bug_id': self.bug_id,
            'user_id': self.user_id,
            'user_name': self.user_name,
            'user_email': self.user_email,
            'user_role': self.user_role,
            'action_type': self.action_type,
            'task_title': self.task_title,
            'bug_title': self.bug_title,
            'details': self.details,
            'previous_state': self.previous_state,
            'new_state': self.new_state,
            'is_archived': self.is_archived,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class ApiEnvironment(db.Model):
    __tablename__ = 'api_environments'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    variables_json = db.Column(db.Text, default='[]')  # JSON array of {key, value}
    is_default = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = db.relationship('Project', backref=db.backref('api_environments', cascade='all, delete-orphan'))

    def to_dict(self):
        import json
        vars_list = []
        try:
            vars_list = json.loads(self.variables_json) if self.variables_json else []
        except Exception:
            vars_list = []
        return {
            'id': self.id,
            'project_id': self.project_id,
            'name': self.name,
            'variables': vars_list,
            'is_default': self.is_default,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class ApiPipeline(db.Model):
    __tablename__ = 'api_pipelines'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, unique=True, index=True)
    name = db.Column(db.String(100), default='Main Chained Pipeline')
    steps_json = db.Column(db.Text, default='[]')  # JSON array of step objects
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = db.relationship('Project', backref=db.backref('api_pipeline', uselist=False, cascade='all, delete-orphan'))

    def to_dict(self):
        import json
        steps_list = []
        try:
            steps_list = json.loads(self.steps_json) if self.steps_json else []
        except Exception:
            steps_list = []
        return {
            'id': self.id,
            'project_id': self.project_id,
            'name': self.name,
            'steps': steps_list,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class ApiSnippet(db.Model):
    __tablename__ = 'api_snippets'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, index=True)
    title = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(50), default='Custom')  # 'Authentication', 'Core Banking', 'Standard Headers', 'SDLC Tasks', 'Custom'
    target_scope = db.Column(db.String(50), default='body')  # 'body' or 'headers'
    content = db.Column(db.Text, nullable=False)
    created_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = db.relationship('Project', backref=db.backref('api_snippets', cascade='all, delete-orphan'))
    creator = db.relationship('User', foreign_keys=[created_by_id])

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'title': self.title,
            'category': self.category,
            'target_scope': self.target_scope,
            'content': self.content,
            'created_by': self.creator.name if self.creator else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Meeting(db.Model):
    __tablename__ = 'meetings'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, index=True)
    phase_id = db.Column(db.Integer, db.ForeignKey('project_phases.id', ondelete='SET NULL'), nullable=True)
    title = db.Column(db.String(200), nullable=False)
    agenda = db.Column(db.Text, nullable=True)
    room_name = db.Column(db.String(120), nullable=False)
    meeting_link = db.Column(db.String(350), nullable=False)
    scheduled_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    duration_minutes = db.Column(db.Integer, default=30)
    status = db.Column(db.String(30), default='SCHEDULED', nullable=False)  # 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
    created_by_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = db.relationship('Project', backref=db.backref('meetings', cascade='all, delete-orphan'))
    phase = db.relationship('ProjectPhase', backref=db.backref('meetings'))
    creator = db.relationship('User', foreign_keys=[created_by_id])
    attendees = db.relationship('MeetingAttendee', backref='meeting', cascade='all, delete-orphan', lazy=True)
    mom = db.relationship('MeetingMoM', backref='meeting', uselist=False, cascade='all, delete-orphan', lazy=True)

    def to_dict(self):
        phase_name = self.phase.name if self.phase else 'General / All Stages'
        return {
            'id': self.id,
            'project_id': self.project_id,
            'project_name': self.project.name if self.project else None,
            'phase_id': self.phase_id,
            'phase_name': phase_name,
            'title': self.title,
            'agenda': self.agenda or '',
            'room_name': self.room_name,
            'meeting_link': self.meeting_link,
            'scheduled_at': self.scheduled_at.isoformat() if self.scheduled_at else None,
            'duration_minutes': self.duration_minutes or 30,
            'status': self.status,
            'created_by_id': self.created_by_id,
            'created_by_name': self.creator.name if self.creator else 'System',
            'created_by_email': self.creator.email if self.creator else None,
            'attendees': [a.to_dict() for a in self.attendees],
            'mom': self.mom.to_dict() if self.mom else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class MeetingAttendee(db.Model):
    __tablename__ = 'meeting_attendees'

    id = db.Column(db.Integer, primary_key=True)
    meeting_id = db.Column(db.Integer, db.ForeignKey('meetings.id', ondelete='CASCADE'), nullable=False, index=True)
    email = db.Column(db.String(150), nullable=False)
    role_designation = db.Column(db.String(100), default='Participant')
    invitation_sent_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'meeting_id': self.meeting_id,
            'email': self.email,
            'role_designation': self.role_designation,
            'invitation_sent_at': self.invitation_sent_at.isoformat() if self.invitation_sent_at else None
        }


class MeetingMoM(db.Model):
    __tablename__ = 'meeting_moms'

    id = db.Column(db.Integer, primary_key=True)
    meeting_id = db.Column(db.Integer, db.ForeignKey('meetings.id', ondelete='CASCADE'), nullable=False, unique=True, index=True)
    content_markdown = db.Column(db.Text, nullable=True)
    decisions_json = db.Column(db.Text, default='[]')  # JSON array of strings
    action_items_json = db.Column(db.Text, default='[]')  # JSON array of {description, assignee, due_date, status}
    signoff_status = db.Column(db.String(30), default='PENDING', nullable=False)  # 'APPROVED', 'PENDING', 'REJECTED'
    recorded_by_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    recorder = db.relationship('User', foreign_keys=[recorded_by_id])

    def to_dict(self):
        import json
        decisions = []
        action_items = []
        try:
            decisions = json.loads(self.decisions_json) if self.decisions_json else []
        except Exception:
            decisions = []
        try:
            action_items = json.loads(self.action_items_json) if self.action_items_json else []
        except Exception:
            action_items = []

        return {
            'id': self.id,
            'meeting_id': self.meeting_id,
            'content_markdown': self.content_markdown or '',
            'decisions': decisions,
            'action_items': action_items,
            'signoff_status': self.signoff_status,
            'recorded_by_id': self.recorded_by_id,
            'recorded_by_name': self.recorder.name if self.recorder else 'Secretary',
            'recorded_at': self.recorded_at.isoformat() if self.recorded_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


