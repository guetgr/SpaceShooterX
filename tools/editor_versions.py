"""Historique local des missions : snapshots immuables, métadonnées légères, transactions SQLite."""
from contextlib import contextmanager, closing
from datetime import datetime, timezone
import hashlib
import json
import re
import sqlite3
import threading
import uuid
from pathlib import Path

LOCK = threading.RLock()
KINDS = {'manual', 'saved', 'initial', 'before-save', 'before-restore'}


def fingerprint(document):
    data = json.dumps(document, sort_keys=True, ensure_ascii=False, separators=(',', ':'), allow_nan=False)
    return hashlib.sha256(data.encode('utf-8')).hexdigest()


def database(root):
    return Path(root) / '.editor-history' / 'versions.sqlite3'


@contextmanager
def transaction(root):
    path = database(root)
    with LOCK:
        path.parent.mkdir(parents=True, exist_ok=True)
        connection = sqlite3.connect(path, timeout=10)
        connection.row_factory = sqlite3.Row
        try:
            connection.executescript('''
                CREATE TABLE IF NOT EXISTS versions (
                    seq INTEGER PRIMARY KEY AUTOINCREMENT,
                    id TEXT NOT NULL UNIQUE,
                    level_id TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    title TEXT NOT NULL,
                    kind TEXT NOT NULL,
                    fingerprint TEXT NOT NULL,
                    summary TEXT NOT NULL,
                    document TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS versions_level ON versions(level_id, seq DESC);
            ''')
            with connection:
                yield connection
        finally:
            connection.close()


def metadata(row):
    return dict(id=row['id'], levelId=row['level_id'], createdAt=row['created_at'], title=row['title'],
                kind=row['kind'], fingerprint=row['fingerprint'], summary=json.loads(row['summary']))


def record(connection, document, title, kind, deduplicate=False):
    if kind not in KINDS:
        raise ValueError('Type de version inconnu')
    if not isinstance(title, str) or not 1 <= len(title.strip()) <= 80:
        raise ValueError('Nom de version : 1 à 80 caractères requis')
    digest = fingerprint(document)
    if deduplicate:
        last = connection.execute('SELECT * FROM versions WHERE level_id=? ORDER BY seq DESC LIMIT 1', (document['id'],)).fetchone()
        if last and last['fingerprint'] == digest:
            return metadata(last)
    summary = {'name': document['name'], 'threat': document['threat'], 'waves': len(document['waves']),
               'creatures': sum(w['count'] for w in document['waves']), 'events': len(document['events'])}
    version_id = uuid.uuid4().hex
    connection.execute('''INSERT INTO versions (id, level_id, created_at, title, kind, fingerprint, summary, document)
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
                       (version_id, document['id'], datetime.now(timezone.utc).isoformat(timespec='milliseconds'),
                        title.strip(), kind, digest, json.dumps(summary, ensure_ascii=False),
                        json.dumps(document, ensure_ascii=False, allow_nan=False)))
    return metadata(connection.execute('SELECT * FROM versions WHERE id=?', (version_id,)).fetchone())


def list_versions(root, level_id, offset=0):
    if not database(root).exists():
        return {'versions': [], 'hasMore': False}
    with LOCK, closing(sqlite3.connect(database(root), timeout=10)) as connection:
        connection.row_factory = sqlite3.Row
        # Le contenu complet des missions n'est pas chargé pour parcourir la liste.
        rows = connection.execute('''SELECT id, level_id, created_at, title, kind, fingerprint, summary
                                     FROM versions WHERE level_id=? ORDER BY seq DESC LIMIT 41 OFFSET ?''',
                                  (level_id, offset)).fetchall()
        return {'versions': [metadata(row) for row in rows[:40]], 'hasMore': len(rows) > 40}


def get_version(root, level_id, version_id):
    if not re.fullmatch(r'[0-9a-f]{32}', version_id) or not database(root).exists():
        raise ValueError('Version introuvable')
    with LOCK, closing(sqlite3.connect(database(root), timeout=10)) as connection:
        connection.row_factory = sqlite3.Row
        row = connection.execute('SELECT * FROM versions WHERE level_id=? AND id=?', (level_id, version_id)).fetchone()
        if row is None:
            raise ValueError('Version introuvable')
        return dict(metadata(row), document=json.loads(row['document']))
