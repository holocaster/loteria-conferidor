import { test, expect } from "@playwright/test";

async function pickNumbers(page, numbers) {
  for (const n of numbers) {
    await page.getByRole("button", { name: String(n).padStart(2, "0"), exact: true }).click();
  }
}

test("salva um jogo fixo e ele aparece em Meus jogos", async ({ page }) => {
  await page.goto("/");

  await pickNumbers(page, [1, 2, 3, 4, 5, 6]);
  await page.getByPlaceholder("apelido do jogo (opcional, ex: pai)").fill("meu jogo");
  await page.getByRole("button", { name: "Salvar jogo" }).click();

  const item = page.locator(".game-item");
  await expect(item).toHaveCount(1);
  await expect(item).toContainText("meu jogo");
  await expect(item.locator(".chip")).toHaveText(["01", "02", "03", "04", "05", "06"]);
});

test("remove um jogo salvo e a lista volta a ficar vazia", async ({ page }) => {
  await page.goto("/");

  await pickNumbers(page, [1, 2, 3, 4, 5, 6]);
  await page.getByRole("button", { name: "Salvar jogo" }).click();
  await expect(page.locator(".game-item")).toHaveCount(1);

  await page.getByRole("button", { name: "Remover jogo" }).click();

  await expect(page.locator(".game-item")).toHaveCount(0);
  await expect(page.getByText("Nenhum jogo cadastrado ainda")).toBeVisible();
});

test("Aleatório escolhe a quantidade certa de números e habilita salvar", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("button", { name: "Salvar jogo" })).toBeDisabled();

  await page.getByRole("button", { name: "Aleatório" }).click();

  await expect(page.locator(".num-selected")).toHaveCount(6);
  await expect(page.getByText("(6/6)")).toBeVisible();
  await expect(page.getByRole("button", { name: "Salvar jogo" })).toBeEnabled();

  await page.getByRole("button", { name: "Limpar" }).click();

  await expect(page.locator(".num-selected")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Salvar jogo" })).toBeDisabled();
});

test("não deixa escolher mais números que o jogo permite", async ({ page }) => {
  await page.goto("/");

  await pickNumbers(page, [1, 2, 3, 4, 5, 6]);

  const seventh = page.getByRole("button", { name: "07", exact: true });
  await expect(seventh).toBeDisabled();

  await page.getByRole("button", { name: "01", exact: true }).click();
  await expect(seventh).toBeEnabled();
});

test("jogo salvo sobrevive a um reload da página (localStorage)", async ({ page }) => {
  await page.goto("/");

  await pickNumbers(page, [10, 11, 12, 13, 14, 15]);
  await page.getByRole("button", { name: "Salvar jogo" }).click();
  await expect(page.locator(".game-item")).toHaveCount(1);

  await page.reload();

  const item = page.locator(".game-item");
  await expect(item).toHaveCount(1);
  await expect(item.locator(".chip")).toHaveText(["10", "11", "12", "13", "14", "15"]);
});
