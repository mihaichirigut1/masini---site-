const { chromium } = require('playwright');

const WP_SITE_URL = 'https://masiniinratebaiamare.ro';
const WP_USER = 'masiniinratebaiamare@gmail.com';
const WP_PASSWORD = 'Z*ulokl4Xg@k756J';

// Step 1: Find the Elementor Theme Builder template for single Masini CPT
// Step 2: Read its _elementor_data
// Step 3: Modify form widget settings
// Step 4: Write back to DB
// Step 5: Verify

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext()).newPage();
  page.setDefaultTimeout(60000);

  // Login
  await page.goto(WP_SITE_URL + '/wp-login.php', { waitUntil: 'domcontentloaded' });
  await page.fill('#user_login', WP_USER);
  await page.fill('#user_pass', WP_PASSWORD);
  await page.click('#wp-submit');
  await page.waitForURL('**/wp-admin/**');
  console.log('Logat.');

  // Get nonce
  await page.goto(WP_SITE_URL + '/wp-admin/');
  const nonce = await page.evaluate(() => (window.wpApiSettings ? window.wpApiSettings.nonce : ''));
  if (!nonce) throw new Error('Missing REST nonce');

  // ====== STEP 1: Find ALL Elementor templates ======
  console.log('\n=== STEP 1: Cautare template Elementor ===');

  const findTemplateSnippet = `
add_action('init', function () {
  if (get_option('mirt_find_form_template_done_v3')) return;

  global $wpdb;

  // Find all Elementor templates (Theme Builder) and regular pages/posts that contain a form widget
  $rows = $wpdb->get_results("
    SELECT p.ID, p.post_title, p.post_type, p.post_status, LENGTH(pm.meta_value) as data_len
    FROM {$wpdb->posts} p
    JOIN {$wpdb->postmeta} pm ON pm.post_id = p.ID AND pm.meta_key = '_elementor_data'
    WHERE pm.meta_value LIKE '%widgetType%form%'
    AND p.post_status IN ('publish', 'draft', 'private')
    ORDER BY p.post_type, p.ID
  ");

  $results = array();
  foreach ($rows as $row) {
    $template_type = get_post_meta($row->ID, '_elementor_template_type', true);
    $conditions = get_post_meta($row->ID, '_elementor_conditions', true);
    $results[] = array(
      'id' => $row->ID,
      'title' => $row->post_title,
      'post_type' => $row->post_type,
      'status' => $row->post_status,
      'data_len' => $row->data_len,
      'template_type' => $template_type ?: '(none)',
      'conditions' => $conditions ?: '(none)',
    );
  }

  update_option('mirt_form_templates_list', $results);
  update_option('mirt_find_form_template_done_v3', 1);
}, 1);
`;

  // Create/update the finder snippet
  const listResp = await page.evaluate(async ({ base, n }) => {
    const r = await fetch(base + '/wp-json/code-snippets/v1/snippets?per_page=100', {
      headers: { 'X-WP-Nonce': n },
    });
    return { status: r.status, data: await r.json() };
  }, { base: WP_SITE_URL, n: nonce });

  const snippetName = 'Debug: Find Form Templates';
  const existing = listResp.data.find((s) => (s.name || '').trim() === snippetName);
  if (existing) {
    await page.evaluate(async ({ base, n, id, name, code }) => {
      await fetch(base + '/wp-json/code-snippets/v1/snippets/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': n },
        body: JSON.stringify({ name, code, scope: 'global', active: true }),
      });
    }, { base: WP_SITE_URL, n: nonce, id: existing.id, name: snippetName, code: findTemplateSnippet });
  } else {
    await page.evaluate(async ({ base, n, name, code }) => {
      await fetch(base + '/wp-json/code-snippets/v1/snippets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': n },
        body: JSON.stringify({ name, code, scope: 'global', active: true }),
      });
    }, { base: WP_SITE_URL, n: nonce, name: snippetName, code: findTemplateSnippet });
  }

  // Trigger init
  await page.goto(WP_SITE_URL + '/?v=' + Date.now(), { waitUntil: 'domcontentloaded' });

  // Read results via another snippet
  const readResultsSnippet = `
add_action('wp_ajax_mirt_get_form_templates', function () {
  $data = get_option('mirt_form_templates_list', array());
  wp_send_json_success($data);
});
`;
  const readSnippetName = 'Debug: Read Form Template Results';
  const existingRead = listResp.data.find((s) => (s.name || '').trim() === readSnippetName);
  if (existingRead) {
    await page.evaluate(async ({ base, n, id, name, code }) => {
      await fetch(base + '/wp-json/code-snippets/v1/snippets/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': n },
        body: JSON.stringify({ name, code, scope: 'global', active: true }),
      });
    }, { base: WP_SITE_URL, n: nonce, id: existingRead.id, name: readSnippetName, code: readResultsSnippet });
  } else {
    await page.evaluate(async ({ base, n, name, code }) => {
      await fetch(base + '/wp-json/code-snippets/v1/snippets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': n },
        body: JSON.stringify({ name, code, scope: 'global', active: true }),
      });
    }, { base: WP_SITE_URL, n: nonce, name: readSnippetName, code: readResultsSnippet });
  }

  // Call the AJAX action
  await page.goto(WP_SITE_URL + '/wp-admin/');
  const templates = await page.evaluate(async ({ base }) => {
    const r = await fetch(base + '/wp-admin/admin-ajax.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'action=mirt_get_form_templates',
    });
    return await r.json();
  }, { base: WP_SITE_URL });

  console.log('Templates cu form widget:');
  if (templates.success && Array.isArray(templates.data)) {
    templates.data.forEach((t) => {
      console.log(`  ID: ${t.id} | "${t.title}" | type: ${t.post_type} | template: ${t.template_type} | conditions: ${JSON.stringify(t.conditions)} | data: ${t.data_len} chars`);
    });
  } else {
    console.log('  Nu am gasit rezultate:', JSON.stringify(templates));
  }

  // ====== STEP 2: Read the _elementor_data for the template ======
  console.log('\n=== STEP 2: Citire _elementor_data ===');

  // We need to read _elementor_data for the right template
  // Create a snippet that reads it and stores it as an option
  const readDataSnippet = `
add_action('wp_ajax_mirt_read_elementor_form_data', function () {
  if (!isset($_POST['template_id'])) {
    wp_send_json_error('Missing template_id');
  }
  $id = intval($_POST['template_id']);
  $raw = get_post_meta($id, '_elementor_data', true);
  if (!$raw) {
    wp_send_json_error('No _elementor_data for post ' . $id);
  }

  $data = json_decode($raw, true);
  if (!is_array($data)) {
    wp_send_json_error('Invalid JSON in _elementor_data');
  }

  // Find form widgets
  $forms = array();
  $walker = function ($node, $path = '') use (&$walker, &$forms) {
    if (!is_array($node)) return;
    if (isset($node['widgetType']) && $node['widgetType'] === 'form') {
      $settings = isset($node['settings']) ? $node['settings'] : array();
      $forms[] = array(
        'path' => $path,
        'id' => isset($node['id']) ? $node['id'] : '?',
        'submit_actions' => isset($settings['submit_actions']) ? $settings['submit_actions'] : '(not set)',
        'form_fields' => isset($settings['form_fields']) ? $settings['form_fields'] : array(),
        'custom_messages' => isset($settings['custom_messages']) ? $settings['custom_messages'] : '',
      );
    }
    if (isset($node['elements']) && is_array($node['elements'])) {
      foreach ($node['elements'] as $i => $child) {
        $walker($child, $path . '.elements[' . $i . ']');
      }
    }
  };
  foreach ($data as $i => $root) {
    $walker($root, 'root[' . $i . ']');
  }

  wp_send_json_success(array(
    'post_id' => $id,
    'data_length' => strlen($raw),
    'forms_found' => count($forms),
    'forms' => $forms,
  ));
});
`;

  const readDataName = 'Debug: Read Elementor Form Data';
  const existingReadData = listResp.data.find((s) => (s.name || '').trim() === readDataName);
  if (existingReadData) {
    await page.evaluate(async ({ base, n, id, name, code }) => {
      await fetch(base + '/wp-json/code-snippets/v1/snippets/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': n },
        body: JSON.stringify({ name, code, scope: 'global', active: true }),
      });
    }, { base: WP_SITE_URL, n: nonce, id: existingReadData.id, name: readDataName, code: readDataSnippet });
  } else {
    await page.evaluate(async ({ base, n, name, code }) => {
      await fetch(base + '/wp-json/code-snippets/v1/snippets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': n },
        body: JSON.stringify({ name, code, scope: 'global', active: true }),
      });
    }, { base: WP_SITE_URL, n: nonce, name: readDataName, code: readDataSnippet });
  }

  // Read form data for each template found
  if (templates.success && Array.isArray(templates.data)) {
    for (const t of templates.data) {
      const formData = await page.evaluate(async ({ base, templateId }) => {
        const r = await fetch(base + '/wp-admin/admin-ajax.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'action=mirt_read_elementor_form_data&template_id=' + templateId,
        });
        return await r.json();
      }, { base: WP_SITE_URL, templateId: t.id });

      console.log(`\nTemplate ID ${t.id} ("${t.title}"):`);
      if (formData.success && formData.data) {
        console.log(`  Forms found: ${formData.data.forms_found}`);
        formData.data.forms.forEach((f, i) => {
          console.log(`\n  Form #${i} (widget id: ${f.id}):`);
          console.log(`    submit_actions: ${JSON.stringify(f.submit_actions)}`);
          console.log(`    fields (${f.form_fields.length}):`);
          f.form_fields.forEach((ff) => {
            console.log(`      - label: "${ff.field_label || ''}" | type: ${ff.field_type || '?'} | required: ${ff.required || 'no'} | custom_id: ${ff.custom_id || ff._id || '?'}`);
          });
        });
      } else {
        console.log('  Error:', JSON.stringify(formData));
      }
    }
  }

  await browser.close();
})();
