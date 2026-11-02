"""Safety checks for private evidence restoration; standard library only."""

import contextlib
import importlib.util
import io
import json
from pathlib import Path
import stat
import tarfile
import tempfile
import unittest
from unittest.mock import patch

SCRIPT = Path(__file__).with_name("mission010-private-archive.py")
SPEC = importlib.util.spec_from_file_location("private_archive", SCRIPT)
ARCHIVE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(ARCHIVE)
REAL_REPO = SCRIPT.parent.parent


class ArchiveSafety(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="udi-archive-test-")
        self.addCleanup(self.temporary.cleanup)
        self.work = Path(self.temporary.name)
        self.source = self.work / "source"
        self.rows = ARCHIVE.manifest()[1]
        for row in self.rows:
            path = self.source / row["path"]
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes((REAL_REPO / row["path"]).read_bytes())
        self.addCleanup(patch.stopall)
        patch.object(ARCHIVE, "REPO", self.source).start()

    def test_roundtrip_permissions_and_repeat(self):
        target = self.work / "private"
        with contextlib.redirect_stdout(io.StringIO()):
            ARCHIVE.create_archive(target, self.rows)
            ARCHIVE.create_archive(target, self.rows)
        self.assertEqual(stat.S_IMODE(target.stat().st_mode), 0o700)
        for path in target.iterdir():
            self.assertEqual(stat.S_IMODE(path.stat().st_mode), 0o600)
        _, values = ARCHIVE.read_archive(target / ARCHIVE.ARCHIVE_NAME, self.rows)
        destination = self.work / "restored"
        self.assertEqual(ARCHIVE.write_missing(destination, values, private=True), 8)
        self.assertEqual(ARCHIVE.write_missing(destination, values, private=True, check=True), 0)
        for row in self.rows:
            path = destination / row["path"]
            self.assertEqual(ARCHIVE.sha(path.read_bytes()), row["sha256"])
            self.assertEqual(stat.S_IMODE(path.stat().st_mode), 0o600)

    def test_conflict_preflight_writes_nothing(self):
        target = self.work / "restore"
        target.mkdir()
        (target / "last").write_bytes(b"user data")
        with self.assertRaises(ValueError):
            ARCHIVE.write_missing(target, {"first": b"new", "last": b"replacement"})
        self.assertFalse((target / "first").exists())
        self.assertEqual((target / "last").read_bytes(), b"user data")

    def test_symlinks_and_traversal_rejected(self):
        target = self.work / "restore"
        target.mkdir()
        outside = self.work / "untouched"
        outside.mkdir()
        (target / "parent").symlink_to(outside, target_is_directory=True)
        (target / "leaf").symlink_to(outside / "absent")
        for name in ("parent/file", "leaf", "../escape", "/absolute"):
            with self.subTest(name=name), self.assertRaises((ValueError, OSError)):
                ARCHIVE.write_missing(target, {name: b"new"})
        self.assertEqual(list(outside.iterdir()), [])

    def test_corrupt_duplicate_traversal_and_link_members_rejected(self):
        for kind in ("corrupt", "duplicate", "traversal", "link"):
            with self.subTest(kind=kind):
                target = self.work / (kind + ".tar")
                with tarfile.open(target, "w") as tar:
                    for index, row in enumerate(self.rows):
                        data = (self.source / row["path"]).read_bytes()
                        name = row["path"]
                        if index == 0 and kind == "corrupt":
                            data = bytes([data[0] ^ 1]) + data[1:]
                        if index == 1 and kind == "duplicate":
                            name = self.rows[0]["path"]
                        if index == 0 and kind == "traversal":
                            name = "../escape"
                        info = tarfile.TarInfo(name)
                        info.size = len(data)
                        if index == 0 and kind == "link":
                            info.type, info.linkname, info.size = tarfile.SYMTYPE, "/etc/passwd", 0
                        tar.addfile(info, io.BytesIO(data))
                with self.assertRaises(ValueError):
                    ARCHIVE.read_archive(target, self.rows)

    def test_public_exports_preserve_data_and_provenance(self):
        values = ARCHIVE.original_bytes(self.rows)
        target = self.work / "public"
        with contextlib.redirect_stdout(io.StringIO()):
            ARCHIVE.export_public(values, target)
            ARCHIVE.export_public(values, target)
        provenance = json.loads((target / "provenance.json").read_text())
        self.assertEqual(len(provenance["files"]), 8)
        for row in provenance["files"]:
            public = (target / row["publicPath"]).read_bytes()
            self.assertEqual(ARCHIVE.sha(public), row["publicSha256"])
            self.assertEqual(ARCHIVE.sha(values[row["originalPath"]]), row["originalSha256"])
            self.assertNotEqual(row["originalSha256"], row["publicSha256"])
        with self.assertRaises(ValueError):
            ARCHIVE.export_public(values, self.source / "tests/mission010/public")
        with self.assertRaises(ValueError):
            ARCHIVE.create_archive(self.source / "private", self.rows)


if __name__ == "__main__":
    unittest.main()
