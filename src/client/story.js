const UPVOTED_ITEMS_KEY = "upvotedItems";

// @ts-ignore
const IS_GOOGLE_SCRIPT = typeof google !== "undefined";

/**
 *
 * @returns {number[]}
 */
function getUpvotedItems() {
  return (
    localStorage
      .getItem(UPVOTED_ITEMS_KEY)
      ?.split(",")
      .map((x) => parseInt(x)) || []
  );
}

/**
 *
 * @param {number[]} upvotedItems
 */
function setUpvotedItems(upvotedItems) {
  localStorage.setItem(
    UPVOTED_ITEMS_KEY,
    upvotedItems.map((x) => `${x}`).join(",")
  );
}

/**
 * @typedef {Object} UpdatedPositiveFeedbackCount
 * @property {number} positiveFeedback
 */

/**
 *
 * @param {Event} event
 */
async function upvoteClick(event) {
  const clickedElement = /** @type {HTMLElement | null} */ (event.target);

  if (clickedElement === null) {
    console.log("No element");
    return;
  }

  if ([...clickedElement.classList].includes("upvoted")) {
    return;
  }

  const url = clickedElement.getAttribute("data-upvote-url");
  const id = parseInt(clickedElement.getAttribute("data-story-id") || "NaN");

  if (!url) {
    return;
  }

  if (!id || isNaN(id)) {
    return;
  }

  clickedElement.classList.toggle("upvoted");

  if (IS_GOOGLE_SCRIPT) {
    // @ts-ignore
    const anyGoogle = /** @type {any} */ (google);
    anyGoogle.script.run
      .withSuccessHandler((/** @type {number} */ newCount) => {
        const maybePositiveFeedbackElement = document.getElementById(
          `story-positive-feedback-${id}`
        );

        if (maybePositiveFeedbackElement === null) {
          console.log(
            "Positive feedback element was missing from the DOM for some reason"
          );
          return;
        }

        maybePositiveFeedbackElement.innerText = `${newCount}`;

        const upvotedItems = getUpvotedItems();
        upvotedItems.push(id);
        setUpvotedItems(upvotedItems);
      })
      .upvoteStory(id);
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
      `story-positive-feedback-${id}`
    );

    if (maybePositiveFeedbackElement === null) {
      console.log(
        "Positive feedback element was missing from the DOM for some reason"
      );
      return;
    }

    maybePositiveFeedbackElement.innerText = `${response.positiveFeedback}`;

    const upvotedItems = getUpvotedItems();
    upvotedItems.push(id);
    setUpvotedItems(upvotedItems);
  }
}

function restoreUpvotedItemsToDom() {
  const upvotedItems = getUpvotedItems();

  for (const id of upvotedItems) {
    const maybePositiveFeedbackElement = document.getElementById(
      `story-upvote-${id}`
    );

    if (!maybePositiveFeedbackElement) {
      continue;
    }

    maybePositiveFeedbackElement.classList.add("upvoted");
  }
}

document.addEventListener("DOMContentLoaded", restoreUpvotedItemsToDom, false);

[...document.getElementsByClassName("story-upvote")].forEach((element) =>
  element.addEventListener("click", upvoteClick)
);
