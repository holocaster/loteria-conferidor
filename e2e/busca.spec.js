import { test, expect } from "@playwright/test";

function drawPayload(overrides = {}) {
  return {
    concurso: 3057,
    dataApuracao: "13/09/2026",
    listaDezenas: ["01", "02", "03", "04", "05", "06"],
    acumulado: false,
    listaRateioPremio: [],
    ...overrides,
  };
}

async function mockConcurso(page, slug, concurso, body, status = 200) {
  await page.route(`**/portaldeloterias/api/${slug}/${concurso}`, (route) =>
    route.fulfill({ status, json: body ?? {} })
  );
}

async function pickNumbers(page, numbers) {
  for (const n of numbers) {
    await page.getByRole("button", { name: String(n).padStart(2, "0"), exact: true }).click();
  }
}

test("modo concurso específico busca e mostra o concurso pedido", async ({ page }) => {
  await mockConcurso(page, "megasena", 3050, drawPayload({ concurso: 3050 }));
  await page.goto("/");

  await page.getByRole("button", { name: "Concurso específico" }).click();
  await page.getByLabel("Número do concurso").fill("3050");
  await page.getByRole("button", { name: "Buscar concurso" }).click();

  await expect(page.locator(".ticket")).toContainText("Concurso 3050");
});

test("modo concurso específico mostra o erro quando a API responde 500", async ({ page }) => {
  await mockConcurso(page, "megasena", 9999, null, 500);
  await page.goto("/");

  await page.getByRole("button", { name: "Concurso específico" }).click();
  await page.getByLabel("Número do concurso").fill("9999");
  await page.getByRole("button", { name: "Buscar concurso" }).click();

  await expect(page.locator(".status-error")).toContainText(
    "Não foi possível buscar o resultado (status 500)."
  );
  await expect(page.locator(".ticket")).toHaveCount(0);
});

test("modo intervalo busca todos os concursos e isola a falha de um deles", async ({ page }) => {
  await mockConcurso(page, "megasena", 3090, drawPayload({ concurso: 3090 }));
  await mockConcurso(page, "megasena", 3091, null, 500);
  await mockConcurso(page, "megasena", 3092, drawPayload({ concurso: 3092 }));
  await page.goto("/");

  await page.getByRole("button", { name: "Intervalo", exact: true }).click();
  await page.getByLabel("Concurso inicial do intervalo").fill("3090");
  await page.getByLabel("Concurso final do intervalo").fill("3092");
  await page.getByRole("button", { name: "Buscar intervalo" }).click();

  await expect(page.locator(".interval-list .ticket")).toHaveCount(2);
  await expect(page.locator(".interval-list")).toContainText("Concurso 3090");
  await expect(page.locator(".interval-list")).toContainText("Concurso 3092");
  await expect(page.locator(".interval-list .status-error")).toContainText(
    "Concurso 3091 não disponível"
  );
});

test("intervalo inválido mostra o erro de validação e não dispara busca", async ({ page }) => {
  let requested = false;
  await page.route("**/portaldeloterias/api/megasena/**", (route) => {
    requested = true;
    route.fulfill({ json: drawPayload() });
  });
  await page.goto("/");

  await page.getByRole("button", { name: "Intervalo", exact: true }).click();
  await page.getByLabel("Concurso inicial do intervalo").fill("3095");
  await page.getByLabel("Concurso final do intervalo").fill("3090");
  await page.getByRole("button", { name: "Buscar intervalo" }).click();

  await expect(page.locator(".status-error")).toContainText(
    "O concurso final não pode ser menor que o inicial."
  );
  await expect(page.locator(".interval-list")).toHaveCount(0);
  expect(requested).toBe(false);
});

test("Dupla-Sena mostra o 1º e o 2º sorteio separados", async ({ page }) => {
  await page.route("**/portaldeloterias/api/duplasena", (route) =>
    route.fulfill({
      json: {
        concurso: 2500,
        dataApuracao: "01/01/2024",
        listaDezenas: ["01", "02", "03", "04", "05", "06"],
        listaDezenasSegundoSorteio: ["10", "20", "30", "40", "45", "50"],
        acumulado: false,
        listaRateioPremio: [],
      },
    })
  );
  await page.goto("/");

  await page.getByRole("button", { name: "Dupla-Sena" }).click();
  await page.getByRole("button", { name: "Ver último sorteio" }).click();

  await expect(page.getByText("1º sorteio")).toBeVisible();
  await expect(page.getByText("2º sorteio")).toBeVisible();
  const balls = page.locator(".balls");
  await expect(balls).toHaveCount(2);
  await expect(balls.nth(0)).toContainText("01");
  await expect(balls.nth(1)).toContainText("10");
});

test("concurso acumulado mostra o valor estimado do próximo sorteio", async ({ page }) => {
  await page.route("**/portaldeloterias/api/megasena", (route) =>
    route.fulfill({
      json: drawPayload({
        acumulado: true,
        acumuladaProxConcurso: 45000000,
        dataProxConcurso: "20/09/2026",
      }),
    })
  );
  await page.goto("/");

  await page.getByRole("button", { name: "Ver último sorteio" }).click();

  await expect(page.locator(".ticket-note")).toContainText("Acumulou!");
  await expect(page.locator(".ticket-note")).toContainText("R$ 45.000.000,00");
  await expect(page.locator(".ticket-note")).toContainText("20/09/2026");
});

test("concurso buscado com sucesso aparece na lista de concursos salvos", async ({ page }) => {
  await mockConcurso(page, "megasena", 3050, drawPayload({ concurso: 3050 }));
  await page.goto("/");

  await page.getByRole("button", { name: "Concurso específico" }).click();
  await page.getByLabel("Número do concurso").fill("3050");
  await page.getByRole("button", { name: "Buscar concurso" }).click();
  await expect(page.locator(".ticket")).toContainText("Concurso 3050");

  await page.getByText("Concursos salvos (1)").click();
  await expect(page.locator(".saved-draw-open")).toContainText("Concurso 3050");
});

test("concurso que respondeu 500 não aparece na lista de concursos salvos", async ({ page }) => {
  await mockConcurso(page, "megasena", 9999, null, 500);
  await page.goto("/");

  await page.getByRole("button", { name: "Concurso específico" }).click();
  await page.getByLabel("Número do concurso").fill("9999");
  await page.getByRole("button", { name: "Buscar concurso" }).click();
  await expect(page.locator(".status-error")).toContainText("status 500");

  await expect(page.getByText(/Concursos salvos/)).toHaveCount(0);
});

test("clicar num concurso salvo reabre o ticket conferido contra um jogo cadastrado depois", async ({ page }) => {
  await mockConcurso(page, "megasena", 3050, drawPayload({ concurso: 3050, listaDezenas: ["01", "02", "03", "04", "05", "06"] }));
  await page.goto("/");

  await page.getByRole("button", { name: "Concurso específico" }).click();
  await page.getByLabel("Número do concurso").fill("3050");
  await page.getByRole("button", { name: "Buscar concurso" }).click();
  await expect(page.locator(".ticket")).toContainText("Concurso 3050");

  await pickNumbers(page, [1, 2, 3, 4, 5, 6]);
  await page.getByRole("button", { name: "Salvar jogo" }).click();
  await expect(page.locator(".sidebar .game-item")).toHaveCount(1);

  await page.getByText("Concursos salvos (1)").click();
  await page.locator(".saved-draw-open").click();

  await expect(page.locator(".ticket")).toContainText("Concurso 3050");
  await expect(page.locator(".ticket .result-row")).toHaveCount(1);
  await expect(page.locator(".ticket .hit-count")).toContainText("6 acertos");
});

test("apagar um concurso salvo remove só aquele item da lista", async ({ page }) => {
  await mockConcurso(page, "megasena", 3050, drawPayload({ concurso: 3050 }));
  await mockConcurso(page, "megasena", 3051, drawPayload({ concurso: 3051 }));
  await page.goto("/");

  await page.getByRole("button", { name: "Concurso específico" }).click();
  await page.getByLabel("Número do concurso").fill("3050");
  await page.getByRole("button", { name: "Buscar concurso" }).click();
  await expect(page.locator(".ticket")).toContainText("Concurso 3050");

  await page.getByLabel("Número do concurso").fill("3051");
  await page.getByRole("button", { name: "Buscar concurso" }).click();
  await expect(page.locator(".ticket")).toContainText("Concurso 3051");

  await page.getByText("Concursos salvos (2)").click();
  await page
    .getByRole("button", { name: "Apagar concurso 3050 salvo" })
    .click();

  await expect(page.locator(".saved-draw-open")).toHaveCount(1);
  await expect(page.locator(".saved-draw-open")).toContainText("Concurso 3051");
});
