"""In-memory stand-in for the subset of the async PyMongo API the app uses, so tests need no MongoDB server."""

import copy
from types import SimpleNamespace
from typing import Any

_OPERATORS = {
    "$in": lambda value, arg: value in arg,
    "$ne": lambda value, arg: value != arg,
    "$gte": lambda value, arg: value is not None and value >= arg,
    "$lte": lambda value, arg: value is not None and value <= arg,
    "$gt": lambda value, arg: value is not None and value > arg,
    "$lt": lambda value, arg: value is not None and value < arg,
}


def _matches(doc: dict, query: dict) -> bool:
    for field, condition in query.items():
        value = doc.get(field)
        if isinstance(condition, dict) and condition and all(key.startswith("$") for key in condition):
            if not all(_OPERATORS[op](value, arg) for op, arg in condition.items()):
                return False
        elif value != condition:
            return False
    return True


def _project(doc: dict, projection: dict | None) -> dict:
    doc = copy.deepcopy(doc)
    if not projection:
        return doc
    for field, include in projection.items():
        if not include:
            doc.pop(field, None)
    return doc


class FakeCursor:
    def __init__(self, docs: list[dict]) -> None:
        self._docs = docs

    def sort(self, key: str, direction: int = 1) -> "FakeCursor":
        self._docs.sort(key=lambda d: d.get(key) or "", reverse=direction < 0)
        return self

    async def to_list(self, length: int | None = None) -> list[dict]:
        return self._docs if length is None else self._docs[:length]

    def __aiter__(self):
        async def generator():
            for doc in self._docs:
                yield doc

        return generator()


class FakeCollection:
    def __init__(self) -> None:
        self.docs: list[dict] = []
        self._next_id = 0

    def find(self, query: dict | None = None, projection: dict | None = None) -> FakeCursor:
        return FakeCursor([_project(d, projection) for d in self.docs if _matches(d, query or {})])

    async def find_one(self, query: dict | None = None, projection: dict | None = None) -> dict | None:
        for doc in self.docs:
            if _matches(doc, query or {}):
                return _project(doc, projection)
        return None

    async def insert_one(self, doc: dict) -> SimpleNamespace:
        self._next_id += 1
        doc["_id"] = self._next_id  # mimic PyMongo mutating the inserted dict
        self.docs.append(copy.deepcopy(doc))
        return SimpleNamespace(inserted_id=self._next_id)

    async def update_one(self, query: dict, update: dict[str, Any]) -> SimpleNamespace:
        for doc in self.docs:
            if _matches(doc, query):
                doc.update(update.get("$set", {}))
                return SimpleNamespace(matched_count=1, modified_count=1)
        return SimpleNamespace(matched_count=0, modified_count=0)

    async def delete_one(self, query: dict) -> SimpleNamespace:
        for index, doc in enumerate(self.docs):
            if _matches(doc, query):
                del self.docs[index]
                return SimpleNamespace(deleted_count=1)
        return SimpleNamespace(deleted_count=0)

    async def create_index(self, *args: Any, **kwargs: Any) -> None:
        return None


class FakeDatabase:
    def __init__(self) -> None:
        self._collections: dict[str, FakeCollection] = {}

    def __getitem__(self, name: str) -> FakeCollection:
        return self._collections.setdefault(name, FakeCollection())

    def __getattr__(self, name: str) -> FakeCollection:
        if name.startswith("_"):
            raise AttributeError(name)
        return self[name]
