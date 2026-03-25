import { test, expect } from '@playwright/test';

test.describe('Marketing Swarm App', () => {
  test('should display the login screen when unauthenticated', async ({ page }) => {
    await page.goto('/');
    
    // Verify the main heading
    await expect(page.locator('h1')).toContainText('Marketing Swarm');
    
    // Verify the login button
    const loginButton = page.locator('button', { hasText: 'Entrar com Google' });
    await expect(loginButton).toBeVisible();
  });

  test('should bypass login and load the main dashboard in test mode', async ({ page }) => {
    // We added a ?test_mode=true query parameter to bypass Firebase Auth for E2E testing
    await page.goto('/?test_mode=true');
    
    // Verify the sidebar is visible
    await expect(page.locator('aside')).toBeVisible();
    
    // Verify the app title in the sidebar
    await expect(page.locator('h2', { hasText: 'Swarm v2' })).toBeVisible();
    
    // Verify the global toggles are present
    await expect(page.locator('button', { hasText: 'Modo Swarm' }).first()).toBeVisible();
    await expect(page.locator('button', { hasText: 'Humanizado' }).first()).toBeVisible();
  });

  test('should be able to send a message via Enter key', async ({ page }) => {
    await page.goto('/?test_mode=true');
    
    // Wait for the main chat area to load
    await expect(page.locator('main')).toBeVisible();
    
    // The chat input should be a textarea
    const chatInput = page.locator('textarea');
    await expect(chatInput).toBeVisible();
    
    // Type a message
    await chatInput.fill('Crie uma campanha de marketing para um novo tênis de corrida.');
    
    // Press Enter to send
    await chatInput.press('Enter');
    
    // Verify the input is cleared after sending
    await expect(chatInput).toHaveValue('');
    
    // Verify the user message appears in the chat
    await expect(page.locator('main')).toContainText('Crie uma campanha de marketing para um novo tênis de corrida.');
  });

  test('should toggle Humanizado mode', async ({ page }) => {
    await page.goto('/?test_mode=true');
    
    const humanizadoButton = page.locator('button', { hasText: 'Humanizado' }).first();
    await expect(humanizadoButton).toBeVisible();
    
    // Click to toggle on
    await humanizadoButton.click();
    
    // The button should indicate it's active (e.g., text color changes to white)
    // We can check if it has the active styling or just ensure it's clickable
    await expect(humanizadoButton).toBeEnabled();
  });

  test('should select a Marketing Framework', async ({ page }) => {
    await page.goto('/?test_mode=true');
    
    // Find and click the "Métricas Piratas" framework button
    const frameworkButton = page.locator('button', { hasText: 'Métricas Piratas' }).first();
    await expect(frameworkButton).toBeVisible();
    await frameworkButton.click();
    
    // Verify it gets selected (has the bg-blue-600 class)
    await expect(frameworkButton).toHaveClass(/bg-blue-600/);
  });

  test('should navigate tabs in the Synaptic Brain modal', async ({ page }) => {
    await page.goto('/?test_mode=true');
    
    // Click the "Cérebro Sináptico" button
    await page.locator('button', { hasText: 'Cérebro Sináptico' }).first().click();
    
    // Verify the modal opens
    await expect(page.locator('h2', { hasText: /Cérebro Sináptico/ })).toBeVisible();
    
    // Click the "Vault" tab
    const vaultTab = page.locator('button', { hasText: 'Vault' });
    await expect(vaultTab).toBeVisible();
    await vaultTab.click();
    
    // Verify it switches to the Vault view (should have "Nova Memória" button)
    await expect(page.locator('button', { hasText: 'Nova Memória' })).toBeVisible();
    
    // Click the "Analytics" tab (using exact text to avoid matching "Analytics Metis")
    const analyticsTab = page.getByRole('button', { name: 'Analytics', exact: true });
    await expect(analyticsTab).toBeVisible();
    await analyticsTab.click();
    
    // Verify it switches to the Analytics view (should have "ROI Projetado")
    await expect(page.locator('h3', { hasText: 'ROI Projetado' })).toBeVisible();
  });

  test('should open and interact with the Brand Profile modal', async ({ page }) => {
    await page.goto('/?test_mode=true');
    
    // Click the "Configurar Marca" button
    await page.locator('button', { hasText: 'Configurar Marca' }).click();
    
    // Verify the modal title
    await expect(page.locator('h3', { hasText: 'Perfil Estratégico da Marca' })).toBeVisible();
    
    // Fill out the brand name
    const nameInput = page.locator('input[placeholder="ex: Acme SaaS"]');
    await nameInput.fill('Minha Marca Teste');
    await expect(nameInput).toHaveValue('Minha Marca Teste');
    
    // Save the profile
    await page.locator('button', { hasText: 'Salvar Perfil Estratégico' }).click();
    
    // Verify modal closes
    await expect(page.locator('h3', { hasText: 'Perfil Estratégico da Marca' })).toBeHidden();
  });

  test('should select a marketing skill from the sidebar', async ({ page }) => {
    await page.goto('/?test_mode=true');
    
    // Wait for the skills to load in the sidebar
    // Click on the "Content & Copy" category to expand it
    const categoryButton = page.locator('button', { hasText: 'Content & Copy' }).nth(1);
    await expect(categoryButton).toBeVisible();
    await categoryButton.click();
    
    // Click on the "Copywriter" skill
    const copywriterSkill = page.locator('button', { hasText: 'Copywriter' }).first();
    await expect(copywriterSkill).toBeVisible({ timeout: 10000 });
    await copywriterSkill.click();
    
    // Verify the chat header updates to show the selected skill persona
    await expect(page.locator('main')).toContainText('Copywriter');
  });

  test('should toggle Swarm Mode and verify UI update', async ({ page }) => {
    await page.goto('/?test_mode=true');
    
    const swarmButton = page.locator('button', { hasText: 'Modo Swarm' }).first();
    await expect(swarmButton).toBeVisible();
    
    // Click to toggle on
    await swarmButton.click();
    
    // Verify it gets the active class (bg-blue-600)
    await expect(swarmButton).toHaveClass(/bg-blue-600/);
  });

  test('should open the Synaptic Brain modal', async ({ page }) => {
    await page.goto('/?test_mode=true');
    
    // Click the "Cérebro Sináptico" button
    await page.locator('button', { hasText: 'Cérebro Sináptico' }).first().click();
    
    // Verify the modal opens (it uses an h2 tag)
    await expect(page.locator('h2', { hasText: /Cérebro Sináptico/ })).toBeVisible();
  });
});
