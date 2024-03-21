export type ReadingText = "ReadingText";
export type ReadingLinkText = "ReadingLinkText";
export type ReadingLinkUrl = "ReadingLinkUrl";
export type ReadingBold = "ReadingBold";
export type ReadingItalic = "ReadingItalic";

export type State =
  | ReadingText
  | ReadingLinkText
  | ReadingLinkUrl
  | ReadingBold
  | ReadingItalic;

export type Text = {
  kind: "Text";
  text: string;
};

export type Bold = {
  kind: "Bold";
  text: string;
};

export type Italic = {
  kind: "Italic";
  text: string;
};

export type Link = {
  kind: "Link";
  text: string;
  url: string;
};

export type Ast = Text | Link | Bold | Italic;

export function astToHtml(astList: Ast[]): string {
  let text = "";

  for (const ast of astList) {
    switch (ast.kind) {
      case "Link": {
        text += `<a href="${ast.url}">${ast.text}</a>`;
        break;
      }
      case "Bold": {
        text += `<strong>${ast.text}</strong>`;
        break;
      }
      case "Italic": {
        text += `<em>${ast.text}</em>`;
        break;
      }
      case "Text": {
        text += ast.text;
        break;
      }
    }
  }
  return text;
}

export function astToMarkdown(astList: Ast[]): string {
  let text = "";

  for (const ast of astList) {
    switch (ast.kind) {
      case "Link": {
        text += `[${ast.text}](${ast.url})`;
        break;
      }
      case "Bold": {
        text += `*${ast.text}*`;
        break;
      }
      case "Italic": {
        text += `_${ast.text}_`;
        break;
      }
      case "Text": {
        text += ast.text;
        break;
      }
    }
  }
  return text;
}

export function parseTextBlock(str: string): Ast[] {
  const ast: Ast[] = [];

  let state: State = "ReadingText";
  let buffer = [];
  let currentAst: null | Ast = null;

  let offset = 0;

  for (const char of str) {
    switch (char) {
      case "[": {
        if (state === "ReadingText") {
          const joinedBuffer = buffer.join("");
          if (joinedBuffer.length > 0) {
            ast.push({
              kind: "Text",
              text: joinedBuffer,
            });
          }
          buffer = [];
        }

        state = "ReadingLinkText";
        currentAst = {
          kind: "Link",
          text: "",
          url: "",
        };
        break;
      }
      case "]": {
        if (currentAst !== null && currentAst.kind === "Link") {
          currentAst.text = buffer.join("");
          buffer = [];
          state = "ReadingLinkUrl";
        } else {
          buffer.push(char);
          offset++;
        }
        break;
      }
      case "(": {
        if (state === "ReadingLinkUrl") {
          state = "ReadingLinkUrl";
        } else {
          buffer.push(char);
          offset++;
        }
        break;
      }
      case ")": {
        if (state === "ReadingLinkUrl") {
          if (currentAst !== null && currentAst.kind === "Link") {
            currentAst.url = buffer.join("");
            ast.push(currentAst);
            currentAst = null;
            buffer = [];
          }
          state = "ReadingText";
        } else {
          buffer.push(char);
          offset++;
        }
        break;
      }
      case "*": {
        const joinedBuffer = buffer.join("");
        if (state === "ReadingBold") {
          ast.push({
            kind: "Bold",
            text: joinedBuffer,
          });
          buffer = [];
        } else {
          if (joinedBuffer.length > 0) {
            ast.push({
              kind: "Text",
              text: joinedBuffer,
            });
          }
          buffer = [];
          state = "ReadingBold";
        }
        break;
      }
      case "_": {
        if (state === "ReadingLinkUrl" || state === "ReadingLinkText") {
          buffer.push(char);
          if (state !== "ReadingLinkUrl") {
            offset++;
          }
          break;
        }
        const joinedBuffer = buffer.join("");
        if (state === "ReadingItalic") {
          ast.push({
            kind: "Italic",
            text: joinedBuffer,
          });
          buffer = [];
        } else {
          if (joinedBuffer.length > 0) {
            ast.push({
              kind: "Text",
              text: joinedBuffer,
            });
          }
          buffer = [];
          state = "ReadingItalic";
        }
        break;
      }
      default: {
        buffer.push(char);
        if (state !== "ReadingLinkUrl") {
          offset++;
        }
      }
    }
  }

  if (buffer.length > 0) {
    const joinedBuffer = buffer.join("");
    ast.push({
      kind: "Text",
      text: joinedBuffer,
    });
  }

  return ast;
}

/*
Opens a file, reads it, converts it from markdown to html.
*/
export function markdownConverter(contents: string): string {
  const items: string[] = [];

  let isInList = false;
  let listItems: string[] = [];

  for (let line of contents.split("\n")) {
    line = line.trim();
    if (line.trim().length === 0) continue;
    if (line.startsWith("-")) {
      if (!isInList) {
        isInList = true;
      }
      listItems.push(
        `<li>${astToHtml(parseTextBlock(line.replace("-", "")))}</li>`
      );
    } else {
      if (isInList) {
        items.push(`<ul>${listItems.join("\n")}</ul>`);
        listItems = [];
        isInList = false;
      }
      const parsed = parseTextBlock(line);
      const item = astToHtml(parsed);
      items.push(item);
    }
  }

  if (isInList) {
    items.push(`<ul>${listItems.join("\n")}</ul>`);
    listItems = [];
    isInList = false;
  }

  return items.map((item) => `<p>${item}</p>`).join("\n");
}
