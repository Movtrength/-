#!/usr/bin/env bash
# Link this plugin into Cursor's local plugin directory.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
dest_parent="${CURSOR_PLUGIN_DIR:-${HOME}/.cursor/plugins/local}"
dest="${dest_parent}/jev-harness"

if [[ ! -f "${root}/.cursor-plugin/plugin.json" ]]; then
  echo "Expected ${root}/.cursor-plugin/plugin.json" >&2
  exit 1
fi

mkdir -p "${dest_parent}"

if [[ -e "${dest}" || -L "${dest}" ]]; then
  echo "Refusing to replace an existing path: ${dest}" >&2
  exit 1
fi

ln -s "${root}" "${dest}"
echo "Linked ${dest} -> ${root}"
echo "Start a new Cursor chat so the jev-harness plugin is discovered."
