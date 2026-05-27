#!/usr/bin/env node
// days/*.md 를 읽어 docs/data.json 으로 합치는 빌드 스크립트.
// 의존성 없음 — Node 표준 모듈만 사용.
//
// 마크다운 형식 규칙:
//   각 할 일은 "## [ ] 제목" 또는 "## [x] 제목" 헤더로 시작.
//   제목 끝에 "(HH:MM)" 가 있으면 시간으로 파싱 (선택).
//   헤더 다음 줄부터 다음 "## " 헤더 전까지가 그 할 일의 상세 본문(마크다운).
//   파일명 "YYYY-MM-DD.md" 이 곧 날짜.

const fs = require('fs');
const path = require('path');

const DAYS_DIR = path.join(__dirname, '..', 'days');
const OUT_DIR = path.join(__dirname, '..', 'docs');
const OUT_FILE = path.join(OUT_DIR, 'data.json');

// "## [x] 제목 (10:00)" 한 줄을 파싱
function parseHeader(line) {
  // ^##\s+\[ (status) \]\s+ (rest)
  const m = line.match(/^##\s+\[([ xX])\]\s+(.*)$/);
  if (!m) return null;
  const done = m[1].toLowerCase() === 'x';
  let title = m[2].trim();
  let time = null;
  // 제목 끝의 (HH:MM) 추출
  const t = title.match(/\((\d{1,2}:\d{2})\)\s*$/);
  if (t) {
    time = t[1];
    title = title.slice(0, t.index).trim();
  }
  return { title, done, time };
}

function parseDay(content) {
  const lines = content.split(/\r?\n/);
  const tasks = [];
  let current = null;
  let buffer = [];

  const flush = () => {
    if (current) {
      current.detail = buffer.join('\n').trim();
      tasks.push(current);
    }
    buffer = [];
  };

  for (const line of lines) {
    const header = parseHeader(line);
    if (header) {
      flush();
      current = header;
    } else if (current) {
      buffer.push(line);
    }
  }
  flush();
  return tasks;
}

function build() {
  if (!fs.existsSync(DAYS_DIR)) {
    console.error('days/ 디렉터리가 없습니다.');
    process.exit(1);
  }
  const files = fs.readdirSync(DAYS_DIR)
    .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
    .sort();

  const data = {};
  for (const file of files) {
    const date = file.replace(/\.md$/, '');
    const content = fs.readFileSync(path.join(DAYS_DIR, file), 'utf8');
    data[date] = parseDay(content);
  }

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(data, null, 2), 'utf8');

  const dayCount = Object.keys(data).length;
  const taskCount = Object.values(data).reduce((n, t) => n + t.length, 0);
  console.log(`빌드 완료: ${dayCount}일, ${taskCount}개 할 일 → ${OUT_FILE}`);
}

build();
