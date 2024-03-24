import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test("/ (frontpage) => Upvote", async ({ page, baseURL, request }) => {
  const reset = await request.post(`${baseURL}/reset`);
  expect(reset.status()).toEqual(200);

  await page.goto(`${baseURL}/`);
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  const stories = await page.locator(".story").all();
  expect(stories).toHaveLength(5);

  const firstStory = stories[0];

  const scoreBeforeClicking = parseInt(
    await firstStory.locator(".story-positive-feedback").first().innerText()
  );

  let storyUpvote = firstStory.locator(".story-upvote").first();

  await expect(storyUpvote).not.toHaveClass(/upvoted/);

  await storyUpvote.click();

  await expect(storyUpvote).toHaveClass(/upvoted/);

  await expect(
    firstStory.locator(".story-positive-feedback").first()
  ).toHaveText(`${scoreBeforeClicking + 1}`);

  // const scoreAfterClicking = parseInt(
  //   await firstStory.locator(".story-positive-feedback").first().innerText()
  // );

  // expect(scoreAfterClicking).toEqual(scoreBeforeClicking + 1);

  await expect(storyUpvote).toHaveClass(/upvoted/);

  await storyUpvote.click();

  // const scoreAfterClickingTwice = parseInt(
  //   await firstStory.locator(".story-positive-feedback").first().innerText()
  // );

  // upvoting should only work once
  // expect(scoreAfterClickingTwice).toEqual(scoreBeforeClicking + 1);

  await expect(
    firstStory.locator(".story-positive-feedback").first()
  ).toHaveText(`${scoreBeforeClicking + 1}`);

  await expect(storyUpvote).toHaveClass(/upvoted/);
});

test("/top => Upvote => /top", async ({ request, page, baseURL }) => {
  const reset = await request.post(`${baseURL}/reset`);
  expect(reset.status()).toEqual(200);

  await page.goto(`${baseURL}/top`);
  await page.evaluate(() => window.localStorage.clear());

  let stories = await page.locator(".story").all();
  expect(stories).toHaveLength(5);

  const secondPlaceStory = stories[1];

  const secondPlaceStoryScoreBeforeClicking = parseInt(
    await secondPlaceStory
      .locator(".story-positive-feedback")
      .first()
      .innerText()
  );

  const secondPlaceStoryId =
    await secondPlaceStory.getAttribute("data-story-id");

  let storyUpvote = secondPlaceStory.locator(".story-upvote").first();
  await expect(storyUpvote).not.toHaveClass(/upvoted/);

  await storyUpvote.click();
  await expect(storyUpvote).toHaveClass(/upvoted/);

  const secondPlaceStoryScoreAfterClicking = parseInt(
    await secondPlaceStory
      .locator(".story-positive-feedback")
      .first()
      .innerText()
  );

  expect(secondPlaceStoryScoreAfterClicking).toEqual(
    secondPlaceStoryScoreBeforeClicking + 1
  );
  await expect(storyUpvote).toHaveClass(/upvoted/);

  await page.goto(`${baseURL}/top`);
  stories = await page.locator(".story").all();
  expect(stories).toHaveLength(5);

  const firstPlaceStory = stories[0];

  const firstPlaceStoryScore = parseInt(
    await firstPlaceStory
      .locator(".story-positive-feedback")
      .first()
      .innerText()
  );

  expect(firstPlaceStoryScore).toEqual(secondPlaceStoryScoreAfterClicking);

  const firstPlaceStoryId = await firstPlaceStory.getAttribute("data-story-id");
  expect(firstPlaceStoryId).toEqual(secondPlaceStoryId);

  storyUpvote = firstPlaceStory.locator(".story-upvote").first();
  await expect(storyUpvote).toHaveClass(/upvoted/);
});
