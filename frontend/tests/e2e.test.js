// frontend/tests/e2e.test.js
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const BASE_URL = "http://localhost:5173";
const TEST_USER = `testuser_${Date.now()}`;
const TEST_PASS = "123456";

function buildDriver() {
  const options = new chrome.Options();
  options.addArguments("--headless");
  options.addArguments("--no-sandbox");
  options.addArguments("--disable-dev-shm-usage");
  options.addArguments("--disable-gpu");
  return new Builder().forBrowser("chrome").setChromeOptions(options).build();
}

async function waitAndFind(driver, locator, timeout = 8000) {
  return driver.wait(until.elementLocated(locator), timeout);
}

async function typeInto(driver, locator, text) {
  const el = await waitAndFind(driver, locator);
  await el.clear();
  await el.sendKeys(text);
}

async function ensureAuthPage(driver) {
  await driver.get(BASE_URL);

  const dashboard = await driver.findElements(By.css(".dashboard-page"));
  if (dashboard.length > 0) {
    const logoutBtn = await waitAndFind(
      driver,
      By.xpath("//button[contains(text(),'Sair')]"),
    );
    await logoutBtn.click();
  }

  await waitAndFind(driver, By.css(".auth-page"), 10000);
}

async function loginWith(driver, username, password) {
  await ensureAuthPage(driver);
  await typeInto(driver, By.css('input[name="username"]'), username);
  await typeInto(driver, By.css('input[name="password"]'), password);

  const submitBtn = await waitAndFind(driver, By.css('button[type="submit"]'));
  await submitBtn.click();
  await waitAndFind(driver, By.css(".dashboard-page"), 10000);
}

describe("Dia Leve — E2E", () => {
  let driver;

  beforeAll(async () => {
    driver = await buildDriver();
  }, 30000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test("1. página de auth carrega", async () => {
    await ensureAuthPage(driver);
    await waitAndFind(driver, By.css(".auth-page"));
    const title = await driver.getTitle();
    expect(title).toContain("Dia Leve");
  }, 15000);

  test("2. cadastro de novo usuário", async () => {
    await ensureAuthPage(driver);

    // troca para modo cadastro
    const cadastroBtn = await waitAndFind(
      driver,
      By.xpath("//button[contains(text(),'Cadastro')]"),
    );
    await cadastroBtn.click();

    await typeInto(driver, By.css('input[name="username"]'), TEST_USER);
    await typeInto(
      driver,
      By.css('input[name="email"]'),
      `${TEST_USER}@test.com`,
    );
    await typeInto(driver, By.css('input[name="password"]'), TEST_PASS);

    const submitBtn = await waitAndFind(
      driver,
      By.css('button[type="submit"]'),
    );
    await submitBtn.click();

    // deve redirecionar para o dashboard
    await waitAndFind(driver, By.css(".dashboard-page"), 10000);
  }, 30000);

  test("3. logout", async () => {
    const logoutBtn = await waitAndFind(
      driver,
      By.xpath("//button[contains(text(),'Sair')]"),
    );
    await logoutBtn.click();
    await waitAndFind(driver, By.css(".auth-page"), 8000);
  }, 15000);

  test("4. login com credenciais válidas", async () => {
    await loginWith(driver, TEST_USER, TEST_PASS);
  }, 30000);

  test("5. login com credenciais inválidas mostra erro", async () => {
    await ensureAuthPage(driver);
    await typeInto(
      driver,
      By.css('input[name="username"]'),
      "usuario_invalido",
    );
    await typeInto(driver, By.css('input[name="password"]'), "senhaerrada");

    const submitBtn = await waitAndFind(
      driver,
      By.css('button[type="submit"]'),
    );
    await submitBtn.click();

    await waitAndFind(driver, By.css(".auth-error"), 8000);
  }, 15000);

  test("6. criar nova tarefa", async () => {
    await loginWith(driver, TEST_USER, TEST_PASS);

    const novaBtn = await waitAndFind(
      driver,
      By.xpath("//button[contains(text(),'Nova tarefa')]"),
    );
    await novaBtn.click();

    await typeInto(
      driver,
      By.css('input[placeholder="Título da tarefa"]'),
      "Tarefa Selenium",
    );

    const salvarBtn = await waitAndFind(
      driver,
      By.xpath("//button[contains(text(),'Salvar')]"),
    );
    await salvarBtn.click();

    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(),'Tarefa Selenium')]")),
      8000,
    );
  }, 30000);
});
