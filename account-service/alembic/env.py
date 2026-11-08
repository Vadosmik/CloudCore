import asyncio
import sys
from logging.config import fileConfig
from pathlib import Path
 
from alembic import context
from sqlalchemy import pool, text
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))
 
import src.models.users
from core.config import settings
from core.database import Base

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

SCHEMA = settings.db_schema


def include_name(name, type_, parent_names):
    if type_ == "schema":
        return name == SCHEMA
    return True


COMMON_OPTIONS = {
    "target_metadata": target_metadata,
    "include_schemas": True,
    "include_name": include_name,
    "version_table_schema": SCHEMA,
}


def run_migrations_offline() -> None:
    context.configure(
        url=settings.database_url.render_as_string(hide_password=False),
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        **COMMON_OPTIONS,
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
  connection.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{SCHEMA}"'))
  connection.commit()

  context.configure(connection=connection, **COMMON_OPTIONS)
  with context.begin_transaction():
    context.run_migrations()


async def run_async_migrations() -> None:
    engine = create_async_engine(settings.database_url, poolclass=pool.NullPool)
    async with engine.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await engine.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_async_migrations())