import * as fs from "fs/promises";

export type Story = {
  kind: "Story";
  id: number;
  date: Date;
  link: string;
  title: string;
  topic: string[];
  summary: string;
  relevance: string;
  positiveFeedback: number;
};

export function Story(
  id: number,
  date: Date,
  link: string,
  title: string,
  topic: string[],
  summary: string,
  relevance: string,
  positiveFeedback: number
): Story {
  return {
    kind: "Story",
    id,
    date,
    link,
    title,
    topic,
    summary,
    relevance,
    positiveFeedback,
  };
}

function renderTopic(topic: string, topicUrl: string): string {
  return `<a class="story-topic" href="${topicUrl}/${topic}">${topic}</a>`;
}

function renderStory(
  story: Story,
  upvoteUrl: string,
  topicUrl: string,
  domainUrl: string
): string {
  const url = new URL(story.link);

  return `
<div class="story">
    <div class="story-header">
        <div class="story-voting">
            <div id="story-upvote-${story.id}" class="story-upvote" data-upvote-url="${upvoteUrl}/${story.id}" data-story-id="${story.id}">🔺</div>
            <div id="story-positive-feedback-${story.id}" class="story-positive-feedback">${story.positiveFeedback}</div>
        </div>
        <a href="${story.link}" class="story-title">${story.title}</a>
    </div>
    <div class="story-meta">
      <div class="story-date">${story.date.toLocaleDateString("gb")}</div>
      <a href="${domainUrl}/${url.hostname}" class="story-domain">${url.hostname}</a>
      <div class="story-topics">${story.topic.map((topic) => renderTopic(topic, topicUrl)).join("\n")}</div>
    </div>
    <div class="story-description">
        <div class="story-summary">${story.summary}</div>
        <div class="story-relevancy-title">Why is this relevant to us?</div>
        <div class="story-relevancy">${story.relevance}</div>
    </div>
</div>
    `.trim();
}

async function renderJavaScript(): Promise<string> {
  return `<script type="text/javascript">${(await fs.readFile(__dirname + "/client/story.js")).toString("utf-8")}</script>`;
}

async function renderCss(): Promise<string> {
  return `<style>${(await fs.readFile(__dirname + "/client/story.css")).toString("utf-8")}</style>`;
}

export type StorySort = "top" | "new" | "default";

function sort(stories: Story[], storySort: StorySort): Story[] {
  switch (storySort) {
    case "new": {
      return [...stories].sort((a, b) => b.date.getDate() - a.date.getDate());
    }
    case "default": {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const storiesFromTheLastSevenDays = stories.filter(
        (story) => story.date >= sevenDaysAgo
      );
      const storiesFromBefore = stories.filter(
        (story) => story.date < sevenDaysAgo
      );
      return [
        ...sort(storiesFromTheLastSevenDays, "top"),
        ...sort(storiesFromBefore, "new"),
      ];
    }
    case "top": {
      return [...stories].sort(
        (a, b) => b.positiveFeedback - a.positiveFeedback
      );
    }
  }
}

/**
 *
 * @param stories the stories to render
 * @param upvoteUrl the upvote url, it should look like https://example.com/upvote/${story.id}
 * @param topicUrl the url for seeing specific topics, it should look like https://example.com/topic/${story.id}
 * @param domainUrl the url for seeing specific topics, it should look like https://example.com/domain/${story.id}
 * @returns
 */
export async function renderStories(
  stories: Story[],
  storySort: StorySort,
  upvoteUrl: string,
  topicUrl: string,
  domainUrl: string
): Promise<string> {
  return `
${await renderCss()}
<div class="stories">
    ${sort(stories, storySort)
      .map((story) => renderStory(story, upvoteUrl, topicUrl, domainUrl))
      .join("\n")}
</div>
${await renderJavaScript()}
`.trim();
}
