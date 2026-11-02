"""Restore redundant run copies offline, without overwriting existing files.

--check verifies existing copies without writing. --destination-root permits
validating restoration in an empty directory. The pilot's original Chrome
symlink is recreated as metadata; it is never executed.
"""

import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def safe_path(root, relative):
    path = Path(relative)
    if path.is_absolute() or ".." in path.parts:
        raise ValueError(f"Unsafe manifest path: {relative}")
    target = root / path
    for parent in target.parents:
        if parent == root:
            break
        if parent.is_symlink():
            raise ValueError(f"Symlink path parent: {parent}")
    return target


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--destination-root", type=Path)
    args = parser.parse_args()
    repo = Path(__file__).resolve().parent.parent
    destination = (args.destination_root or repo).resolve()
    manifest = json.loads((repo / "scripts/benchmark-run-copies.json").read_text())
    pending = []
    # Preflight every source and destination before writing anything.
    for entry in manifest["files"]:
        source = safe_path(repo, entry["source"])
        target = safe_path(destination, entry["path"])
        if source.is_symlink() or not source.is_file() or digest(source) != entry["sha256"]:
            raise ValueError(f"Retained source missing or changed: {entry['source']}")
        if os.path.lexists(target):
            if "symlink" in entry:
                valid = target.is_symlink() and os.readlink(target) == entry["symlink"]
            else:
                valid = (not target.is_symlink() and target.is_file()
                         and digest(target) == entry["sha256"]
                         and bool(target.stat().st_mode & 0o111) == (entry["mode"] == "100755"))
            if not valid:
                raise ValueError(f"Existing run file differs; refusing overwrite: {entry['path']}")
        else:
            pending.append((entry, source, target))
    if args.check and pending:
        raise ValueError(f"{len(pending)} run copies missing; run without --check to restore")
    for entry, source, target in pending:
        target.parent.mkdir(parents=True, exist_ok=True)
        if "symlink" in entry:
            target.symlink_to(entry["symlink"])
        else:
            with source.open("rb") as src, target.open("xb") as dst:
                shutil.copyfileobj(src, dst)
            target.chmod(0o755 if entry["mode"] == "100755" else 0o644)
    print(f"Verified {len(manifest['files'])} run copies; restored {len(pending)}.")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError) as error:
        raise SystemExit(str(error)) from error
