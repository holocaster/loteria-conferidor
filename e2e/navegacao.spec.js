import { test, expect } from "@playwright/test";

function drawPayload(concurso) {
  return {
    concurso,
    dataApuracao: "13/09/2026",
    listaDezenas: ["01", "02", "03", "04", "05", "06"],
    acumulado: false,
    listaRateioPremio: [],
  };
}

async function pickNumbers(page, numbers) {
  for (const n of numbers) {
    await page.getByRole("button", { name: String(n).padStart(2, "0"), exact: true }).click();
  }
}

test("trocar de loteria reseta a busca e mostra só os jogos daquela loteria", async ({ page }) => {
  await page.route("**/portaldeloterias/api/megasena", (route) =>
    route.fulfill({ json: drawPayload(3057) })
  );
  await page.goto("/");

  await pickNumbers(page, [1, 2, 3, 4, 5, 6]);
  await page.getByRole("button", { name: "Salvar jogo" }).click();
  await page.getByRole("button", { name: "Ver último sorteio" }).click();
  await expect(page.locator(".ticket")).toHaveCount(1);

  await page.getByRole("button", { name: "Lotofácil" }).click();

  await expect(page.locator(".ticket")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Ver último sorteio" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Jogos fixos em Lotofácil" })).toBeVisible();
  await expect(page.locator(".game-item")).toHaveCount(0);

  await page.getByRole("button", { name: "Mega-Sena" }).click();
  await expect(page.locator(".game-item")).toHaveCount(1);
});

test("trocar de loteria no meio de uma busca de intervalo descarta os resultados que chegam depois", async ({ page }) => {
  await page.route("**/portaldeloterias/api/megasena/**", async (route) => {
    const concurso = Number(route.request().url().split("/").pop());
    await new Promise((resolve) => setTimeout(resolve, 600));
    await route.fulfill({ json: drawPayload(concurso) });
  });
  await page.goto("/");

  await page.getByRole("button", { name: "Intervalo", exact: true }).click();
  await page.getByLabel("Concurso inicial do intervalo").fill("3090");
  await page.getByLabel("Concurso final do intervalo").fill("3092");
  await page.getByRole("button", { name: "Buscar intervalo" }).click();

  await page.getByRole("button", { name: "Lotofácil" }).click();
  await expect(page.getByRole("heading", { name: "Jogos fixos em Lotofácil" })).toBeVisible();

  // As respostas do megasena (mockadas com atraso de 600ms) chegam depois da
  // troca de aba — não podem "vazar" pro estado da Lotofácil.
  await page.waitForTimeout(1000);

  await expect(page.locator(".interval-list")).toHaveCount(0);
  await expect(page.locator(".ticket")).toHaveCount(0);
});

test("no mobile, a troca entre Conferir e Meus jogos mostra uma seção de cada vez", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/");

  await expect(page.locator(".check-section")).toBeVisible();
  await expect(page.locator(".sidebar")).not.toBeVisible();

  await page.getByRole("button", { name: /Meus jogos/ }).click();

  await expect(page.locator(".sidebar")).toBeVisible();
  await expect(page.locator(".check-section")).not.toBeVisible();

  await page.getByRole("button", { name: "Conferir" }).click();

  await expect(page.locator(".check-section")).toBeVisible();
  await expect(page.locator(".sidebar")).not.toBeVisible();
});
