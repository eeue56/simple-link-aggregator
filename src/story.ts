import { markdownConverter } from "./markdown";

const CLIENT_CSS = `{CLIENT_CSS_REPLACE_ME}`;
const CLIENT_JS = `{CLIENT_JS_REPLACE_ME}`;

/**
 * A story is composed of:
 * - a unique id
 * - the date submitted
 * - the link
 * - the title
 * - the topics (or tags), as an array
 * - a short summary
 * - an explaination on why it's relevant
 * - the amount of positive feedback (or upvotes) it got
 */
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

/**
 * Constructor for @type {Story}
 * @param id a unique id
 * @param date the date submitted
 * @param link the link
 * @param title the title
 * @param topic the topics (or tags), as an array
 * @param summary a short summary
 * @param relevance an explaination on why it's relevant
 * @param positiveFeedback the amount of positive feedback (or upvotes) it got
 * @returns a @type {Story}
 */
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

type UrlPieces = {
  hostname: string;
};

/**
 * AppsScript doesn't support URL, so manually grab the hostname
 * @param href a full url
 * @returns the hostname in an object
 */
function url_shim(href: string): UrlPieces {
  var match = href.match(
    /^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/
  );

  if (match) {
    return (
      match && {
        hostname: match[3],
      }
    );
  }
  return {
    hostname: "",
  };
}

/**
 * Remove the first emojis from a string (e.g in a title)
 * @param str a string possibly with :emojis:
 * @returns a string without the first
 */
function stripEmojis(str: string): string {
  return str.replace(/:.+:/g, "");
}

function renderTopic(topic: string, topicUrl: string): string {
  return `<a class="story-topic" href="${topicUrl}/${topic}">${topic}</a>`;
}

/**
 * Render an individual story - note, does not contain css or js.
 *
 * Note: you probably want @function renderStories which contains the css and js.
 * @param story the story to render
 * @param upvoteUrl the upvote url, it should look like https://example.com/upvote/${story.id} (POST)
 * @param topicUrl the url for seeing specific topics, it should look like https://example.com/topic/${story.id} (GET)
 * @param domainUrl the url for seeing specific topics, it should look like https://example.com/domain/${story.id} (GET)
 * @returns
 */
export function renderStory(
  story: Story,
  upvoteUrl: string,
  topicUrl: string,
  domainUrl: string
): string {
  const { hostname } = url_shim(story.link);
  const title = stripEmojis(story.title);
  const summary = stripEmojis(markdownConverter(story.summary));
  const relevance = stripEmojis(markdownConverter(story.relevance));

  return `
<div class="story" data-story-id="${story.id}">
    <div class="story-header">
        <div class="story-voting">
            <div id="story-upvote-${story.id}" class="story-upvote" data-upvote-url="${upvoteUrl}/${story.id}" data-story-id="${story.id}">🔺</div>
            <div id="story-positive-feedback-${story.id}" class="story-positive-feedback">${story.positiveFeedback}</div>
        </div>
        <a href="${story.link}" class="story-title">${title}</a>
    </div>
    <div class="story-meta">
      <div class="story-date">${story.date.toLocaleDateString("en-GB")}</div>
      <a href="${domainUrl}/${hostname}" class="story-domain">${hostname}</a>
      <div class="story-topics">${story.topic.map((topic) => renderTopic(topic, topicUrl)).join("\n")}</div>
    </div>
    <div class="story-description">
        <div class="story-summary">${summary}</div>
        <div class="story-relevancy-title">Why is this relevant to us?</div>
        <div class="story-relevancy">${relevance}</div>
    </div>
</div>
    `.trim();
}

/**
 * Render the client-side JS
 *
 * Note: you probably want to use @function renderStories instead which already includes this.
 * @returns the client-side JS wrapped in a script tag
 */
export function renderJavaScript(): string {
  return `<script type="text/javascript">${CLIENT_JS}</script>`;
}

/**
 * Render the client-side CSS
 *
 * Note: you probably want to use @function renderStories instead which already includes this.
 * @returns the client-side CSS wrapped in a style tag
 */
export function renderCss(): string {
  return `<style>${CLIENT_CSS}</style>`;
}

/**
 * default: sort last 7 days by top, the rest by new
 * new: sort all articles by age (newest first)
 * top: sort all articles by score (highest first)
 */
export type StorySort = "default" | "new" | "top";

/**
 *
 * @param stories the stories to sort
 * @param storySort the sort method to use
 * @returns
 */
function sort(stories: Story[], storySort: StorySort): Story[] {
  switch (storySort) {
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
    case "new": {
      return [...stories].sort((a, b) => b.date.getDate() - a.date.getDate());
    }
    case "top": {
      return [...stories].sort(
        (a, b) => b.positiveFeedback - a.positiveFeedback
      );
    }
  }
}

/**
 * Takes a bunch of stories, sorts them, then renders them with css and provides js for handling upvotes
 *
 * @param stories the stories to render
 * @param storyStory the sorting method to use - default, new, or top
 * @param upvoteUrl the upvote url, it should look like https://example.com/upvote/${story.id}
 * @param topicUrl the url for seeing specific topics, it should look like https://example.com/topic/${story.id}
 * @param domainUrl the url for seeing specific topics, it should look like https://example.com/domain/${story.id}
 * @returns html as a string, containing the html, css and js needed
 */
export function renderStories(
  stories: Story[],
  storySort: StorySort,
  upvoteUrl: string,
  topicUrl: string,
  domainUrl: string
): string {
  return `
${renderCss()}
<div class="stories">
    ${sort(stories, storySort)
      .map((story) => renderStory(story, upvoteUrl, topicUrl, domainUrl))
      .join("\n")}
</div>
${renderJavaScript()}
`.trim();
}
