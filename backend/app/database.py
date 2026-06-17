from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

# Ensure the async asyncpg driver is used regardless of the dialect prefix
# supplied in the DATABASE_URL environment variable (e.g. postgresql://,
# postgresql+psycopg2://, or postgres:// are all normalised here).
_db_url = settings.DATABASE_URL
for _sync_prefix in (
    "postgresql+psycopg2://",
    "postgresql://",
    "postgres://",
):
    if _db_url.startswith(_sync_prefix):
        _db_url = "postgresql+asyncpg://" + _db_url[len(_sync_prefix):]
        break

engine = create_async_engine(_db_url, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
