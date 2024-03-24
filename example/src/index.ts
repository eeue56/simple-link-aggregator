import * as express from "express";
import * as fs from "fs";
import { Story, renderStories } from "../../dist/story";

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
    "https://github.com/eeue56/gwe",
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
  Story(
    4,
    new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    "https://visualstudiomagazine.com/articles/2024/01/25/copilot-research.aspx",
    "Github Copilot reduces quality of code committed",
    ["AI", "Code Quality"],
    `A code analysis company has published a new study on the effect of Github Copilot on code quality. Github themselves did a study last year, showing that Copilot results in more code being written, in less time, with higher developer fulfillment.

The new paper demonstrates that the number of removed or changed lines within two weeks (churn) after being committed has raised considerably year-on-year since Copilot became prevalent. There was also a significant raise in the amount of copy/pasted or repeated code. They imply that Copilot has lead to an increase in broken or poor quality code committed, along with a raise in code that breaks the [Don't Repeat Yourself](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) rule.`,
    "Copilot and other AI code assistant tools are here to stay, getting more popular as time goes on. Developers must ensure that code written with the aid of these tools are as of high quality as their hand-written code, be it during writing or during code review.",
    150
  ),
  Story(
    5,
    new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
    "https://archive.jlongster.com/How-I-Became-Better-Programmer",
    ":teacher: Becoming a better programmer",
    ["Practices"],
    `The author of Prettier, the most popular JavaScript auto-formatter, wrote this blog post about how he developed his programming skills. He talks about facing imposter syndrome, and concrete steps on what he did to learn more.

Some highlights:
- Find people who inspire you, but don't idolize them.
- Don't devalue your work.
- Don't feel pressure to work all the time.
- Ignore fluff.
- Dig into research papers.
- Take on big projects and get uncomfortable.`,
    "Continual growth and personal development is an ambition we all probably have, but figuring out how to do so can be difficult. Ever got to your development talk session and not really been sure what to put as your goals? This article lists a few that could help guide you.",
    150
  ),
];

const originalStories = stories.map((story) => {
  return { ...story };
});

function main() {
  const withGoogleShim = !!process.env.WITH_GOOGLE_SHIM;
  console.log(
    withGoogleShim ? "Using Google shim..." : "Using regular JavaScript..."
  );
  const index = fs
    .readFileSync(withGoogleShim ? "index_with_google.html" : "index.html")
    .toString("utf-8");
  const app = express.default();

  app.get(
    "/",
    async (
      request: express.Request,
      response: express.Response
    ): Promise<void> => {
      response.send(
        index.replace(
          "{contents}",
          renderStories(stories, "default", "/upvote", "/topic", "/domain")
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
      response.send(
        index.replace(
          "{contents}",
          renderStories(
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
      response.send(
        index.replace(
          "{contents}",
          renderStories(
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
      response.send(
        index.replace(
          "{contents}",
          renderStories(stories, "new", "/upvote", "/topic", "/domain")
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
      response.send(
        index.replace(
          "{contents}",
          renderStories(stories, "top", "/upvote", "/topic", "/domain")
        )
      );
    }
  );

  app.post(
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

  app.post("/reset", (request, response) => {
    for (const story of stories) {
      for (const originalStory of originalStories) {
        if (story.id === originalStory.id) {
          story.positiveFeedback = originalStory.positiveFeedback;
        }
      }
    }
    response.sendStatus(200);
    response.end();
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

main();
