import XRegExp from "xregexp";

// n — Explicit capture
// x — Free-spacing and line comments (aka extended mode)
const regex = XRegExp.tag("nx");

const captureHeader = regex`
  (?<header>
    "sdk"\s*:\s*{
      [^}]*               # match everything except the closing }
      "version"\s*:\s*"   # match the version property
  )
`;

const captureFooter = regex`
  (?<footer>
    "                     # match the closing "
    .*                    # match everything after the closing "
  )
`;

export function replaceVersion(source: string, match: string, replacement: string): string {
  const matcher = regex`
    ${captureHeader}
    (${match})             # match the exact version
    ${captureFooter}
  `;

  return XRegExp.replace(source, matcher, `$<header>${replacement}$<footer>`);
}
