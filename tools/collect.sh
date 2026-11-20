#!/usr/bin/env bash
# 拉回所有孩子的最新版本（remote 名 kid-<id>，由 new-kid.sh 添加），列出各自最新提交。
# 想收某个改动：git log kid-xiaoming/main 找到提交，git cherry-pick <hash>
set -euo pipefail
cd "$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
for r in $(git remote | grep '^kid-'); do
  git fetch -q "$r"
  printf '%-16s %s\n' "$r" "$(git log -1 --format='%cr  %s' "$r/main")"
done
