const UPVOTED_ITEMS_KEY = "upvotedStoryIds";

// @ts-ignore
const IS_GOOGLE_SCRIPT = typeof google !== "undefined";

/**
 * Get upvoted story ids from localstorage
 *
 * @returns {number[]}
 */
function getUpvotedStoryIds() {
  return (
    localStorage
      .getItem(UPVOTED_ITEMS_KEY)
      ?.split(",")
      .map((x) => parseInt(x)) || []
  );
}

/**
 * Set the upvoted story ids in localstorage
 *
 * @param {number[]} upvotedStoryIds
 */
function setUpvotedStoryIds(upvotedStoryIds) {
  localStorage.setItem(
    UPVOTED_ITEMS_KEY,
    upvotedStoryIds.map((x) => `${x}`).join(","),
  );
}

/**
 * @typedef {Object} UpdatedPositiveFeedbackCount
 * @property {number} positiveFeedback
 */

/**
 * Handle clicking on an upvote If already upvoted, do nothing. There is no
 * downvoting or unvoting. Sends a request to the backend to increment the
 * score.
 *
 * @param {Event} event
 */
async function upvoteClick(event) {
  const clickedElement = /** @type {HTMLElement | null} */ (event.target);

  if (clickedElement === null) {
    console.log("No element");
    return;
  }

  // already upvoted
  if ([...clickedElement.classList].includes("upvoted")) {
    return;
  }

  const url = clickedElement.getAttribute("data-upvote-url");
  const id = parseInt(clickedElement.getAttribute("data-story-id") || "NaN");

  // shouldn't be possible
  if (!url) {
    return;
  }

  // shouldn't be possible
  if (!id || isNaN(id)) {
    return;
  }

  // add upvoted class if it's not there already
  clickedElement.classList.toggle("upvoted");

  if (IS_GOOGLE_SCRIPT) {
    // @ts-ignore
    const anyGoogle = /** @type {any} */ (google);
    anyGoogle.script.run
      .withSuccessHandler((/** @type {number} */ newCount) => {
        const maybePositiveFeedbackElement = document.getElementById(
          `story-positive-feedback-${id}`,
        );

        if (maybePositiveFeedbackElement === null) {
          console.log(
            "Positive feedback element was missing from the DOM for some reason",
          );
          return;
        }

        maybePositiveFeedbackElement.innerText = `${newCount}`;

        const upvotedStoryIds = getUpvotedStoryIds();
        upvotedStoryIds.push(id);
        setUpvotedStoryIds(upvotedStoryIds);
      })
      .upvoteStory(id, url);
  } else {
    const response = /** @type {UpdatedPositiveFeedbackCount} */ (
      await (
        await fetch(url, {
          method: "POST",
          mode: "no-cors",
          redirect: "follow",
        })
      ).json()
    );

    const maybePositiveFeedbackElement = document.getElementById(
      `story-positive-feedback-${id}`,
    );

    if (maybePositiveFeedbackElement === null) {
      console.log(
        "Positive feedback element was missing from the DOM for some reason",
      );
      return;
    }

    maybePositiveFeedbackElement.innerText = `${response.positiveFeedback}`;

    const upvotedStoryIds = getUpvotedStoryIds();
    upvotedStoryIds.push(id);
    setUpvotedStoryIds(upvotedStoryIds);
  }
}

/** Make sure previously upvoted stories by this user are still upvoted. */
function restoreUpvotedStoryIdsToDom() {
  const upvotedStoryIds = getUpvotedStoryIds();

  for (const id of upvotedStoryIds) {
    const maybePositiveFeedbackElement = document.getElementById(
      `story-upvote-${id}`,
    );

    if (!maybePositiveFeedbackElement) {
      continue;
    }

    maybePositiveFeedbackElement.classList.add("upvoted");
  }
}

document.addEventListener(
  "DOMContentLoaded",
  restoreUpvotedStoryIdsToDom,
  false,
);

[...document.getElementsByClassName("story-upvote")].forEach((element) =>
  element.addEventListener("click", upvoteClick),
);
