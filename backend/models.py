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

class ActivityLog(db.Model):
    __tablename__ = 'activity_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, index=True)
    task_id = db.Column(db.Integer, db.ForeignKey('project_tasks.id', ondelete='SET NULL'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    user_name = db.Column(db.String(100), nullable=False)
    user_email = db.Column(db.String(120), nullable=False)
    user_role = db.Column(db.String(50), nullable=False)
    action_type = db.Column(db.String(50), nullable=False)  # CREATE_TASK, STATUS_CHANGE, STAGE_SHIFT, UPDATE_TASK, REASSIGN_TASK, DELETE_TASK
    task_title = db.Column(db.String(150), nullable=True)
    details = db.Column(db.Text, nullable=False)
    previous_state = db.Column(db.Text, nullable=True)
    new_state = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'task_id': self.task_id,
            'user_id': self.user_id,
            'user_name': self.user_name,
            'user_email': self.user_email,
            'user_role': self.user_role,
            'action_type': self.action_type,
            'task_title': self.task_title,
            'details': self.details,
            'previous_state': self.previous_state,
            'new_state': self.new_state,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
