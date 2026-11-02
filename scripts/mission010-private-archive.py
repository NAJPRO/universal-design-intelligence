"""Manage the private Mission 010 evidence and separate public derivatives offline.

No Git mutations, downloads, extraction of untrusted tar paths, or file overwrites.
The repository manifest is the trust anchor; archive sidecars are informational.
"""

import argparse
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import stat
import subprocess
import tarfile
import tempfile

REPO = Path(__file__).resolve().parent.parent
ARCHIVE_NAME = "mission010-originals.tar"
PRIVATE_CLASS = "PRIVATE ARCHIVE / PUBLIC DERIVATIVE"


def sha(data):
    return hashlib.sha256(data).hexdigest()


def json_bytes(value):
    return (json.dumps(value, indent=2, ensure_ascii=False) + "\n").encode()


def manifest():
    value = json.loads((REPO / "docs/mission010-archive-manifest.json").read_text())
    rows = [r for r in value["files"]
            if r["classification"] in ("MANUAL REVIEW", PRIVATE_CLASS)]
    if len(rows) != 8 or len({r["path"] for r in rows}) != 8:
        raise ValueError("Expected exactly eight private original paths")
    for row in rows:
        path = PurePosixPath(row["path"])
        if (path.is_absolute() or ".." in path.parts
                or str(path) != row["path"]
                or not row["path"].startswith("tests/mission010/")):
            raise ValueError("Invalid private-original path in trust manifest")
    return value, rows


def directory(path, create=False, private=False, require_private=False):
    """Walk directory FDs without following symlinks, including at the root."""
    path = Path(os.path.abspath(path))
    fd = os.open(path.anchor, os.O_RDONLY | os.O_DIRECTORY)
    try:
        for part in path.parts[1:]:
            if create:
                try:
                    os.mkdir(part, 0o700 if private else 0o755, dir_fd=fd)
                except FileExistsError:
                    pass
            child = os.open(part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW,
                            dir_fd=fd)
            os.close(fd)
            fd = child
        if require_private:
            info = os.fstat(fd)
            if info.st_uid != os.getuid() or stat.S_IMODE(info.st_mode) != 0o700:
                raise ValueError("Private archive directory must be owned by you with mode 0700")
        return fd
    except BaseException:
        os.close(fd)
        raise


def regular_bytes(path, limit=1_048_576):
    parent = directory(Path(path).parent)
    try:
        fd = os.open(Path(path).name, os.O_RDONLY | os.O_NOFOLLOW, dir_fd=parent)
        with os.fdopen(fd, "rb") as stream:
            info = os.fstat(stream.fileno())
            if not stat.S_ISREG(info.st_mode) or info.st_size > limit:
                raise ValueError("Expected a bounded regular file")
            data = stream.read(limit + 1)
            if len(data) > limit:
                raise ValueError("File exceeds size limit")
            return data
    finally:
        os.close(parent)


def validate_destinations(root, outputs):
    """Validate the entire plan before creating any missing file or directory."""
    root = Path(os.path.abspath(root))
    # Validate all existing parents even when an earlier component is absent.
    for relative, expected in outputs.items():
        path = PurePosixPath(relative)
        if path.is_absolute() or ".." in path.parts or str(path) != relative:
            raise ValueError("Unsafe destination path")
        target = root / relative
        for parent in reversed(target.parents):
            if os.path.lexists(parent) and (parent.is_symlink() or not parent.is_dir()):
                raise ValueError("Destination parent is a symlink or not a directory")
        if os.path.lexists(target):
            if regular_bytes(target) != expected:
                raise ValueError(f"Refusing to overwrite a different file: {relative}")


def write_missing(root, outputs, private=False, check=False):
    validate_destinations(root, outputs)
    missing = [name for name in outputs if not os.path.lexists(Path(root) / name)]
    if check and missing:
        raise ValueError(f"{len(missing)} required files are missing")
    for name in missing:
        target = Path(root) / name
        parent = directory(target.parent, create=True, private=private)
        try:
            fd = os.open(target.name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW,
                         0o600 if private else 0o644, dir_fd=parent)
            with os.fdopen(fd, "wb") as stream:
                stream.write(outputs[name])
                stream.flush()
                os.fsync(stream.fileno())
            os.fsync(parent)
        finally:
            os.close(parent)
    return len(missing)


def original_bytes(rows):
    values = {}
    for row in rows:
        data = regular_bytes(REPO / row["path"])
        if len(data) != row["bytes"] or sha(data) != row["sha256"]:
            raise ValueError(f"Original missing or changed: {row['path']}")
        values[row["path"]] = data
    return values


def read_archive(archive, rows):
    data = regular_bytes(archive)
    expected = {r["path"]: r for r in rows}
    values = {}
    with tarfile.open(fileobj=io.BytesIO(data), mode="r:") as tar:
        members = tar.getmembers()
        if len(members) != len(rows):
            raise ValueError("Archive must contain exactly eight members")
        for member in members:
            if (member.name not in expected or member.name in values
                    or not member.isfile() or member.linkname
                    or member.size != expected[member.name]["bytes"]):
                raise ValueError("Unexpected, duplicate, linked or invalid archive member")
            stream = tar.extractfile(member)
            payload = stream.read(member.size + 1)
            if len(payload) != member.size or sha(payload) != expected[member.name]["sha256"]:
                raise ValueError("Archived original failed its trusted SHA-256 check")
            values[member.name] = payload
    return data, values


def create_archive(destination, rows):
    destination = Path(os.path.abspath(destination))
    if destination.is_relative_to(REPO):
        raise ValueError("The permanent private archive must be outside the repository")
    for ancestor in [destination, *destination.parents]:
        marker = ancestor / ".git"
        if marker.is_file() or (marker / "HEAD").is_file():
            raise ValueError("The archive directory must be outside every Git worktree")
    values = original_bytes(rows)
    buffer = io.BytesIO()
    with tarfile.open(fileobj=buffer, mode="w", format=tarfile.USTAR_FORMAT) as tar:
        for name, payload in sorted(values.items()):
            info = tarfile.TarInfo(name)
            info.size, info.mode, info.mtime = len(payload), 0o600, 0
            info.uid = info.gid = 0
            info.uname = info.gname = ""
            tar.addfile(info, io.BytesIO(payload))
    data = buffer.getvalue()
    inventory = {"schemaVersion": 1, "archive": ARCHIVE_NAME,
                 "archiveSha256": sha(data), "files": [
                     {k: r[k] for k in ("path", "bytes", "sha256")} for r in rows]}
    outputs = {ARCHIVE_NAME: data, "manifest.json": json_bytes(inventory),
               "SHA256SUMS": f"{sha(data)}  {ARCHIVE_NAME}\n".encode()}
    validate_destinations(destination, outputs)
    fd = directory(destination, create=True, private=True, require_private=True)
    os.close(fd)
    for name in outputs:
        path = destination / name
        if path.exists():
            info = path.stat()
            if info.st_uid != os.getuid() or stat.S_IMODE(info.st_mode) != 0o600:
                raise ValueError("Existing private archive files require owner-only mode 0600")
    write_missing(destination, outputs, private=True)
    read_archive(destination / ARCHIVE_NAME, rows)
    print(f"Private archive verified: eight originals; SHA-256 {sha(data)}")


def sanitize(text):
    text = text.replace(str(REPO), "<REPO>").replace(str(Path.home()), "<HOME>")
    text = re.sub(r"(?:/home/[^/\s\"']+|/Users/[^/\s\"']+)", "<HOME>", text)
    text = re.sub(r"ws://(?:127\.0\.0\.1|localhost):\d+/devtools/browser/[A-Za-z0-9-]+",
                  "<LOCAL_BROWSER_DEBUG_ENDPOINT>", text)
    return re.sub(r"(?i)\b[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\b",
                  "<SESSION_ID>", text)


def sanitize_json(value):
    if isinstance(value, dict):
        return {key: sanitize_json(item) for key, item in value.items()}
    if isinstance(value, list):
        return [sanitize_json(item) for item in value]
    return sanitize(value) if isinstance(value, str) else value


def export_public(values, destination):
    destination = Path(os.path.abspath(destination))
    if any(destination.is_relative_to(REPO / p) for p in
           ("tests/mission010", "benchmarks/mission011")):
        raise ValueError("Public derivatives must stay outside frozen historical trees")
    outputs, provenance = {}, []
    for name, payload in sorted(values.items()):
        relative = str(PurePosixPath(name).relative_to("tests/mission010"))
        text = payload.decode()
        public = (json_bytes(sanitize_json(json.loads(text))) if name.endswith(".json")
                  else sanitize(text).encode())
        if public == payload:
            raise ValueError("Expected a sanitized derivative for each private original")
        outputs[relative] = public
        provenance.append({"originalPath": name, "originalSha256": sha(payload),
                           "originalBytes": len(payload), "publicPath": relative,
                           "publicSha256": sha(public), "publicBytes": len(public),
                           "status": "sanitized derivative; not a historical original"})
    outputs["provenance.json"] = json_bytes({
        "schemaVersion": 1,
        "policy": "Originals stay private; historical hashes apply only to raw originals.",
        "redactions": ["repository path -> <REPO>", "user home -> <HOME>",
                       "loopback browser endpoint -> <LOCAL_BROWSER_DEBUG_ENDPOINT>",
                       "session UUID -> <SESSION_ID>"],
        "files": provenance})
    count = write_missing(destination, outputs)
    print(f"Verified eight public derivatives and provenance; created {count} files.")


def verify_history(archive, rows, inventory):
    _, values = read_archive(archive, rows)
    with tempfile.TemporaryDirectory(prefix=".udi-history-check-", dir=REPO) as temporary:
        copy = Path(temporary)
        private = set(values)
        paths = {p.decode() for p in subprocess.check_output(
            ["git", "ls-files", "-z"], cwd=REPO).split(b"\0") if p}
        paths.difference_update(private)
        paths.update(r["path"] for r in inventory["files"] if r["path"] not in private)
        paths.update(("scripts/restore-benchmark-runs.py", "scripts/benchmark-run-copies.json"))
        for name in sorted(paths):
            data = regular_bytes(REPO / name, limit=4_194_304)
            write_missing(copy, {name: data})
        write_missing(copy, values, private=True)
        commands = [
            ["python3", "scripts/restore-benchmark-runs.py"],
            ["python3", "scripts/restore-benchmark-runs.py", "--check"],
            ["node", "tests/mission010/verify.mjs"],
            ["node", "benchmarks/mission011/verify.mjs"],
            ["python3", "benchmarks/mission012-pilot/verify.py"],
            ["python3", "benchmarks/mission012/verify.py"]]
        for command in commands:
            result = subprocess.run(command, cwd=copy, capture_output=True, text=True)
            if result.returncode:
                raise ValueError(f"Historical verification failed: {command[1]}")
            print(result.stdout.strip())
        for row in inventory["files"]:
            if sha(regular_bytes(copy / row["path"])) != row["sha256"]:
                raise ValueError("An original archive hash changed during verification")
        print("All 182 Mission 010 historical hashes verified in disposable copy.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    subs = parser.add_subparsers(dest="command", required=True)
    create = subs.add_parser("create")
    create.add_argument("--directory", type=Path, required=True)
    for name in ("check", "restore", "export", "verify-history"):
        sub = subs.add_parser(name)
        sub.add_argument("--archive", type=Path, required=True)
        if name == "restore":
            sub.add_argument("--destination-root", type=Path, required=True)
            sub.add_argument("--check", action="store_true")
        if name == "export":
            sub.add_argument("--destination", type=Path,
                             default=REPO / "public-exports/mission010")
    args = parser.parse_args()
    inventory, rows = manifest()
    if args.command == "create":
        create_archive(args.directory, rows)
        return
    data, values = read_archive(args.archive, rows)
    expected_archive = inventory.get("privateArchive", {}).get("archiveSha256")
    if expected_archive and sha(data) != expected_archive:
        raise ValueError("Archive SHA-256 differs from the trusted retention manifest")
    if args.command == "check":
        print(f"Eight original hashes verified; archive SHA-256 {sha(data)}")
    elif args.command == "restore":
        count = write_missing(args.destination_root, values, private=True, check=args.check)
        print(f"Eight originals verified; restored {count} missing files.")
    elif args.command == "export":
        export_public(values, args.destination)
    else:
        verify_history(args.archive, rows, inventory)


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, KeyError, tarfile.TarError) as error:
        raise SystemExit(str(error)) from error
