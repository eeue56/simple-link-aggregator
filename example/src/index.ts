import * as express from "express";
import * as fs from "fs/promises";
import { Story, renderStories } from "../../src/story";

const stories = [
  Story(
    1,
    new Date(),
    "https://github.com/eeue56/jump-to/",
    "Click on links without needing to leave the keyboard",
    ["Workflow"],
    "A Vimium inspired keyboard shortcut script for browsers. Highlights all clickable elements on a page, then provides shortcuts to click them so you never have to leave your keyboard again!",
    "A handy way to learn about making Chrome extensions, testing them with Playwright, and using JSDoc",
    1
  ),
  Story(
    2,
    new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    "https://github.com/eeue56/gwem",
    "A ML-friendly language for targeting WebAssembly",
    ["Languages"],
    "A language for making WebAssembly easier as a target for ML family languages. Gwe is written in Rust, and targets WebAssembly. The language is intended to be a friendly layer between ML-languages and WebAssembly.",
    "Making it easier to target WebAssembly makes it easier for developers to create fast, web-compatiable, code.",
    125
  ),
  Story(
    3,
    new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    "https://github.com/eeue56/gwem",
    "A totally different language for compiling to WebAssembly",
    ["Languages"],
    "A language for making WebAssembly easier as a target for ML family languages. Gwe is written in Rust, and targets WebAssembly. The language is intended to be a friendly layer between ML-languages and WebAssembly.",
    "Making it easier to target WebAssembly makes it easier for developers to create fast, web-compatiable, code.",
    113
  ),
];

function main() {
  const app = express.default();

  app.get(
    "/",
    async (
      request: express.Request,
      response: express.Response
    ): Promise<void> => {
      const index = (await fs.readFile("index.html")).toString("utf-8");

      response.send(
        index.replace(
          "{contents}",
          await renderStories(
            stories,
            "default",
            "/upvote",
            "/topic",
            "/domain"
          )
        )
      );
    }
  );

  app.get(
    "/topic/:name",
    async (
      request: express.Request,
      response: express.Response
    ): Promise<void> => {
      const index = (await fs.readFile("index.html")).toString("utf-8");

      response.send(
        index.replace(
          "{contents}",
          await renderStories(
            stories.filter((story) =>
              story.topic.includes(request.params.name)
            ),
            "default",
            "/upvote",
            "/topic",
            "/domain"
          )
        )
      );
    }
  );

  app.get(
    "/domain/:name",
    async (
      request: express.Request,
      response: express.Response
    ): Promise<void> => {
      const index = (await fs.readFile("index.html")).toString("utf-8");

      response.send(
        index.replace(
          "{contents}",
          await renderStories(
            stories.filter((story) => {
              const url = new URL(story.link);
              return url.hostname === request.params.name;
            }),
            "default",
            "/upvote",
            "/topic",
            "/domain"
          )
        )
      );
    }
  );

  app.get(
    "/new",
    async (
      request: express.Request,
      response: express.Response
    ): Promise<void> => {
      const index = (await fs.readFile("index.html")).toString("utf-8");

      response.send(
        index.replace(
          "{contents}",
          await renderStories(stories, "new", "/upvote", "/topic", "/domain")
        )
      );
    }
  );

  app.get(
    "/top",
    async (
      request: express.Request,
      response: express.Response
    ): Promise<void> => {
      const index = (await fs.readFile("index.html")).toString("utf-8");

      response.send(
        index.replace(
          "{contents}",
          await renderStories(stories, "top", "/upvote", "/topic", "/domain")
        )
      );
    }
  );

  app.get(
    "/upvote/:id",
    async (
      request: express.Request,
      response: express.Response
    ): Promise<void> => {
      const id = parseInt(request.params.id);

      if (isNaN(id) || id < 0 || id > stories.length) {
        response.sendStatus(503);
        response.end();
        return;
      }

      const story = stories.filter((story) => story.id === id)[0];

      if (!story) {
        console.log("Couldn't find story with id", id);
        response.sendStatus(503);
        response.end();
        return;
      }

      console.log(`Upvoted ${id}, title: ${story.title}`);
      story.positiveFeedback++;
      response.send({
        positiveFeedback: story.positiveFeedback,
      });
    }
  );

  app.listen(3000, () => {
    console.log(`Example app listening on port 3000`);
  });
}

main();
