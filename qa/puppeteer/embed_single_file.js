#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PLAYER_DIR = path.join(ROOT, "player");
const SHOTS_DIR = path.join(PLAYER_DIR, "screenshots");
const TEMPLATE = path.join(PLAYER_DIR, "index_single.html");
const OUTPUT = path.join(PLAYER_DIR, "index_single_embedded.html");

const MAP = [
  ["01_login.png", { title: "כניסה", stepId: "01_login" }],
  ["02_profile.png", { title: "פרופיל", stepId: "02_profile" }],
  [
    "02_profile_slider.png",
    { title: "פרופיל — סליידר", stepId: "02_profile_slider" },
  ],
  ["03_courses.png", { title: "קורסים", stepId: "03_courses" }],
  ["04_course_detail.png", { title: "פרטי קורס", stepId: "04_course_detail" }],
  ["05_lesson.png", { title: "שיעור", stepId: "05_lesson" }],
  ["06_grades.png", { title: "ציונים", stepId: "06_grades" }],
  [
    "07_tickets_history.png",
    { title: "כרטיסים", stepId: "07_tickets_history" },
  ],
  ["08_placement.png", { title: "שיבוץ", stepId: "08_placement" }],
  ["09_reviews.png", { title: "ביקורות", stepId: "09_reviews" }],
  ["10_support.png", { title: "תמיכה", stepId: "10_support" }],
  ["11_logged_out.png", { title: "יציאה", stepId: "11_logged_out" }],
];

function buildImagesArray() {
  const items = [];
  for (const [fileName, meta] of MAP) {
    const full = path.join(SHOTS_DIR, fileName);
    if (!fs.existsSync(full)) continue;
    const b64 = fs.readFileSync(full).toString("base64");
    const dataUri = `data:image/png;base64,${b64}`;
    items.push(
      `        { src: '${dataUri}', meta: { title: '${meta.title}', stepId: '${meta.stepId}' } }`
    );
  }
  if (items.length === 0) {
    throw new Error("No screenshots found in player/screenshots");
  }
  return "let images = [\n" + items.join(",\n") + "\n      ];";
}

function main() {
  const html = fs.readFileSync(TEMPLATE, "utf8");
  const imagesBlock = buildImagesArray();
  const replaced = html.replace(
    /let\s+images\s*=\s*\[[\s\S]*?\];/,
    imagesBlock
  );
  fs.writeFileSync(OUTPUT, replaced);
  console.log(`[embed] Wrote embedded single file: ${OUTPUT}`);
}

try {
  main();
} catch (err) {
  console.error("[embed] Error:", err.message);
  process.exit(1);
}
