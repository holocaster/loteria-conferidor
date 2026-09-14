import { test, expect } from "@playwright/test";

// Mocka a resposta da API da Caixa pra ter um sorteio e um rateio de
// prêmio fixos — sem isso o teste dependeria da rede e do concurso do dia.
const DRAW_RESPONSE = {
  concurso: 3057,
  dataApuracao: "13/09/2026",
  listaDezenas: ["01", "02", "03", "04", "05", "06"],
  acumulado: false,
  listaRateioPremio: [
    { descricaoFaixa: "6 acertos", faixa: 1, numeroDeGanhadores: 1, valorPremio: 999999.99 },
    { descricaoFaixa: "5 acertos", faixa: 2, numeroDeGanhadores: 86, valorPremio: 31872.72 },
    { descricaoFaixa: "4 acertos", faixa: 3, numeroDeGanhadores: 5234, valorPremio: 863.24 },
  ],
};

async function mockMegaSenaDraw(page) {
  await page.route("**/portaldeloterias/api/megasena", (route) =>
    route.fulfill({ json: DRAW_RESPONSE })
  );
}

async function pickNumbers(page, numbers) {
  for (const n of numbers) {
    await page.getByRole("button", { name: String(n).padStart(2, "0"), exact: true }).click();
  }
}

test("jogo premiado mostra o valor do prêmio", async ({ page }) => {
  await mockMegaSenaDraw(page);
  await page.goto("/");

  await pickNumbers(page, [1, 2, 3, 4, 5, 6]);
  await page.getByRole("button", { name: "Salvar jogo" }).click();
  await page.getByRole("button", { name: "Ver último sorteio" }).click();

  const resultRow = page.locator(".result-row");
  await expect(resultRow).toContainText("premiado!");
  await expect(resultRow).toContainText("R$ 999.999,99");
});

test("jogo sem faixa premiada não mostra premiado nem valor", async ({ page }) => {
  await mockMegaSenaDraw(page);
  await page.goto("/");

  await pickNumbers(page, [1, 2, 3, 10, 11, 12]);
  await page.getByRole("button", { name: "Salvar jogo" }).click();
  await page.getByRole("button", { name: "Ver último sorteio" }).click();

  const resultRow = page.locator(".result-row");
  await expect(resultRow).toContainText("3 acertos");
  await expect(resultRow).not.toContainText("premiado!");
});
