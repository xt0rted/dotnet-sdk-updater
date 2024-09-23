import {
  readFile,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

await (async function () {
  const fileContents = await readFile(
    path.resolve("./action.yml"),
    { encoding: "utf8" },
  );

  let hasExamples = false;
  const lines = fileContents.split("\n");

  for (let index = 0; index < lines.length; index++) {
    let line = lines[index];

    if (/^\s*_example:/gi.test(line)) {
      hasExamples = true;
      line = "#" + line;
    }

    lines[index] = line;
  }

  if (!hasExamples) {
    console.info("✅ No examples found, skipping");

    return;
  }

  console.info("📝 Found examples, updating");

  await writeFile(
    "./action.yml",
    lines.join("\n"),
    { encoding: "utf8" },
  );
})();
