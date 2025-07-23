"""
Platform settings models
"""

from sqlmodel import SQLModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
import uuid


class PlatformSettings(SQLModel, table=True):
    """Platform configuration settings"""
    __tablename__ = "platform_settings"
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    
    # Setting details
    key: str = Field(unique=True, index=True)
    value: str
    description: Optional[str] = Field(default=None)
    category: str = Field(index=True)  # trading, security, notification, ui, etc.
    
    # Data type and validation
    data_type: str = Field(default="string")  # string, int, float, bool, json
    is_public: bool = Field(default=False)  # Can be accessed by frontend
    is_editable: bool = Field(default=True)  # Can be modified via admin panel
    
    # Validation rules
    min_value: Optional[float] = Field(default=None)
    max_value: Optional[float] = Field(default=None)
    allowed_values: Optional[str] = Field(default=None)  # JSON array of allowed values
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    updated_by: Optional[str] = Field(default=None)  # admin user id


class MaintenanceMode(SQLModel, table=True):
    """Maintenance mode configuration"""
    __tablename__ = "maintenance_mode"
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    
    # Maintenance details
    is_enabled: bool = Field(default=False)
    title: str = Field(default="Maintenance Mode")
    message: str = Field(default="The platform is temporarily unavailable for maintenance.")
    
    # Localized messages
    messages: Optional[Dict[str, str]] = Field(default=None, sa_column_kwargs={"type_": "JSON"})
    
    # Schedule
    scheduled_start: Optional[datetime] = Field(default=None)
    scheduled_end: Optional[datetime] = Field(default=None)
    estimated_duration: Optional[int] = Field(default=None)  # minutes
    
    # Access control
    allow_admin_access: bool = Field(default=True)
    allowed_ips: Optional[str] = Field(default=None)  # Comma-separated IPs
    
    # Status
    started_at: Optional[datetime] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)
    
    # Additional info
    maintenance_type: str = Field(default="general")  # general, security, upgrade, emergency
    affected_services: Optional[str] = Field(default=None)  # JSON array
    progress_percentage: int = Field(default=0)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = Field(default=None)  # admin user id


class AuditLog(SQLModel, table=True):
    """Audit log for admin actions"""
    __tablename__ = "audit_logs"
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    
    # Actor information
    user_id: Optional[str] = Field(default=None, index=True)
    user_role: Optional[str] = Field(default=None)
    ip_address: str
    user_agent: Optional[str] = Field(default=None)
    
    # Action details
    action: str = Field(index=True)  # login, logout, create_user, update_settings, etc.
    resource_type: Optional[str] = Field(default=None)  # user, transaction, asset, etc.
    resource_id: Optional[str] = Field(default=None)
    
    # Changes
    old_values: Optional[Dict[str, Any]] = Field(default=None, sa_column_kwargs={"type_": "JSON"})
    new_values: Optional[Dict[str, Any]] = Field(default=None, sa_column_kwargs={"type_": "JSON"})
    
    # Context
    description: Optional[str] = Field(default=None)
    metadata: Optional[Dict[str, Any]] = Field(default=None, sa_column_kwargs={"type_": "JSON"})
    
    # Status
    success: bool = Field(default=True)
    error_message: Optional[str] = Field(default=None)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SystemMetrics(SQLModel, table=True):
    """System performance and usage metrics"""
    __tablename__ = "system_metrics"
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    
    # Metric details
    metric_name: str = Field(index=True)
    metric_value: float
    metric_unit: Optional[str] = Field(default=None)
    
    # Context
    category: str = Field(index=True)  # system, trading, users, api, etc.
    subcategory: Optional[str] = Field(default=None)
    
    # Additional data
    tags: Optional[Dict[str, str]] = Field(default=None, sa_column_kwargs={"type_": "JSON"})
    metadata: Optional[Dict[str, Any]] = Field(default=None, sa_column_kwargs={"type_": "JSON"})
    
    # Timestamp
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    collected_at: datetime = Field(default_factory=datetime.utcnow)


class ApiKey(SQLModel, table=True):
    """API keys for external integrations"""
    __tablename__ = "api_keys"
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    
    # Key details
    name: str
    description: Optional[str] = Field(default=None)
    api_key: str = Field(unique=True, index=True)
    api_secret: Optional[str] = Field(default=None)
    
    # Permissions and limits
    permissions: str = Field(sa_column_kwargs={"type_": "JSON"})  # List of allowed actions
    rate_limit: int = Field(default=1000)  # Requests per hour
    ip_whitelist: Optional[str] = Field(default=None)  # Comma-separated IPs
    
    # Status
    is_active: bool = Field(default=True)
    last_used: Optional[datetime] = Field(default=None)
    usage_count: int = Field(default=0)
    
    # Expiration
    expires_at: Optional[datetime] = Field(default=None)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = Field(default=None)  # admin user id


class FeatureFlag(SQLModel, table=True):
    """Feature flags for gradual rollouts"""
    __tablename__ = "feature_flags"
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    
    # Flag details
    name: str = Field(unique=True, index=True)
    description: Optional[str] = Field(default=None)
    is_enabled: bool = Field(default=False)
    
    # Rollout configuration
    rollout_percentage: int = Field(default=0)  # 0-100
    target_users: Optional[str] = Field(default=None)  # JSON array of user IDs
    target_roles: Optional[str] = Field(default=None)  # JSON array of roles
    
    # Environment
    environments: str = Field(default='["development"]', sa_column_kwargs={"type_": "JSON"})
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = Field(default=None)  # admin user id
