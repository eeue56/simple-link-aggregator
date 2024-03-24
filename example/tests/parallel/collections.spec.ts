import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

test("/ (frontpage)", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/`);

  const stories = await page.locator(".story").all();
  expect(stories).toHaveLength(5);
});

test("/new", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/new`);

  const stories = await page.locator(".story").all();
  expect(stories).toHaveLength(5);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 5);
  let newestDate = tomorrow;

  for (const story of stories) {
    const storyDateString = await story
      .locator(".story-date")
      .first()
      .innerText();

    const parts = storyDateString.split("/");

    expect(parts).toHaveLength(3);

    const storyDate = new Date(
      parseInt(parts[2]),
      parseInt(parts[1]) - 1,
      parseInt(parts[0])
    );

    expect(storyDate <= newestDate).toBeTruthy();
    newestDate = storyDate;
  }
});

test("/top", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/top`);

  const stories = await page.locator(".story").all();
  expect(stories).toHaveLength(5);

  let topScore = 9001;

  for (const story of stories) {
    const storyPositiveFeedbackString = await story
      .locator(".story-positive-feedback")
      .first()
      .innerText();

    const score = parseInt(storyPositiveFeedbackString);

    expect(score).toBeLessThanOrEqual(topScore);
    topScore = score;
  }
});
