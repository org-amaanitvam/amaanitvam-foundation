# Import all models here so Alembic autogenerate can discover them.
# Order matters: parent tables before tables with FKs pointing to them.
from app.models.conversation import Conversation  # noqa: F401
from app.models.message import Message  # noqa: F401
from app.models.ai_log import AILog  # noqa: F401
from app.models.ai_notification import AINotification  # noqa: F401
