// src/utils/urlUtils.ts

export const encodeForUrl = (text: string): string => {
  const mappings: Record<string, string> = {
    " ": "%20",
    "!": "%21",
    "#": "%23",
    $: "%24",
    "%": "%25",
    "&": "%26",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "*": "%2A",
    "+": "%2B",
    ",": "%2C",
    "/": "%2F",
    ":": "%3A",
    ";": "%3B",
    "=": "%3D",
    "?": "%3F",
    "@": "%40",
    "[": "%5B",
    "]": "%5D",
  };
  return text
    .split("")
    .map((char) => mappings[char] || char)
    .join("");
};
