const { chromium } = require('playwright');

const WP_SITE_URL = 'https://masiniinratebaiamare.ro';
const WP_USER = 'masiniinratebaiamare@gmail.com';
const WP_PASSWORD = 'Z*ulokl4Xg@k756J';

const TEMPLATE_ID = 248;
const CONSENT_TEXT = 'Prin trimiterea formularului, ești de acord să fii contactat(ă) privind această solicitare. Detalii în Politica de confidențialitate.';

const PHP_FIX_CODE = `add_action('init', function () {
  if (get_option('mirt_fix_form_248_v4')) return;

  global $wpdb;
  $raw = get_post_meta(${TEMPLATE_ID}, '_elementor_data', true);
  if (!$raw) { update_option('mirt_fix_form_248_v4', 'no_data'); return; }

  $data = json_decode($raw, true);
  if (!is_array($data)) { update_option('mirt_fix_form_248_v4', 'bad_json'); return; }

  $changes = 0;

  $walker = function (&$node) use (&$walker, &$changes) {
    if (!is_array($node)) return;

    if (isset($node['widgetType']) && $node['widgetType'] === 'form' && isset($node['settings'])) {
      $s = &$node['settings'];

      // 1) Remove dce_form_email from submit_actions
      if (isset($s['submit_actions']) && is_array($s['submit_actions'])) {
        $before = $s['submit_actions'];
        $s['submit_actions'] = array_values(array_filter($s['submit_actions'], function ($v) {
          return !in_array($v, array('dce_form_email', 'dynamic_email', 'dce_dynamic_email', 'dce_email'), true);
        }));
        if ($before !== $s['submit_actions']) $changes++;
      }

      // 2) Set Telefon (field_520ab23) as required
      if (isset($s['form_fields']) && is_array($s['form_fields'])) {
        foreach ($s['form_fields'] as &$field) {
          $cid = isset($field['custom_id']) ? $field['custom_id'] : (isset($field['_id']) ? $field['_id'] : '');
          $type = isset($field['field_type']) ? $field['field_type'] : '';
          $label = isset($field['field_label']) ? strtolower($field['field_label']) : '';

          // Make phone required
          if ($type === 'tel' || $cid === 'field_520ab23' || strpos($label, 'telefon') !== false) {
            if (!isset($field['required']) || $field['required'] !== 'true') {
              $field['required'] = 'true';
              $changes++;
            }
          }

          // Remove acceptance/consent checkbox field
          if ($type === 'acceptance' || $cid === 'field_a2d4d3c') {
            $field['field_type'] = 'hidden';
            $field['field_label'] = '';
            $field['field_value'] = 'on';
            $field['required'] = '';
            $field['css_classes'] = 'mirt-hidden-field';
            $changes++;
          }
        }
      }

      // 3) Add consent text as HTML widget after form - we do this via custom_messages or additional_text
      // Actually, better: add it as a custom success/error message area text
      // The safest approach: inject via a new field of type "html" before the submit button
      // Find submit button position and insert html field before it
      if (isset($s['form_fields']) && is_array($s['form_fields'])) {
        $hasConsentText = false;
        foreach ($s['form_fields'] as $ff) {
          if (isset($ff['custom_id']) && $ff['custom_id'] === 'mirt_consent_text') {
            $hasConsentText = true;
            break;
          }
        }
        if (!$hasConsentText) {
          $consentField = array(
            '_id' => 'mirt_ct',
            'custom_id' => 'mirt_consent_text',
            'field_type' => 'html',
            'field_html' => '<p style="font-size:12px;line-height:1.4;margin:10px 0;opacity:0.85;">${CONSENT_TEXT}</p>',
            'field_label' => '',
            'width' => '100',
          );
          // Insert before the last field (honeypot) or at the end
          array_splice($s['form_fields'], -1, 0, array($consentField));
          $changes++;
        }
      }
    }

    if (isset($node['elements']) && is_array($node['elements'])) {
      foreach ($node['elements'] as &$child) {
        $walker($child);
      }
    }
  };

  foreach ($data as &$root) {
    $walker($root);
  }

  if ($changes > 0) {
    $new_json = wp_json_encode($data);
    update_post_meta(${TEMPLATE_ID}, '_elementor_data', wp_slash($new_json));

    // Clear Elementor CSS cache for this template
    delete_post_meta(${TEMPLATE_ID}, '_elementor_css');
    delete_option('_elementor_global_css');
  }

  update_option('mirt_fix_form_248_v4', array('changes' => $changes, 'ts' => current_time('mysql')));
}, 1);`;

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

  // Load snippets
  const listResp = await page.evaluate(async ({ base, n }) => {
    const r = await fetch(base + '/wp-json/code-snippets/v1/snippets?per_page=100', {
      headers: { 'X-WP-Nonce': n },
    });
    return { status: r.status, data: await r.json() };
  }, { base: WP_SITE_URL, n: nonce });

  const snippetName = 'Fix Form Template 248: All Changes';
  const existing = listResp.data.find((s) => (s.name || '').trim() === snippetName);
  if (existing) {
    await page.evaluate(async ({ base, n, id, name, code }) => {
      await fetch(base + '/wp-json/code-snippets/v1/snippets/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': n },
        body: JSON.stringify({ name, code, scope: 'global', active: true }),
      });
    }, { base: WP_SITE_URL, n: nonce, id: existing.id, name: snippetName, code: PHP_FIX_CODE });
    console.log('Snippet updated:', existing.id);
  } else {
    const created = await page.evaluate(async ({ base, n, name, code }) => {
      const r = await fetch(base + '/wp-json/code-snippets/v1/snippets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': n },
        body: JSON.stringify({ name, code, scope: 'global', active: true }),
      });
      return { status: r.status, data: await r.json() };
    }, { base: WP_SITE_URL, n: nonce, name: snippetName, code: PHP_FIX_CODE });
    console.log('Snippet created:', created.status, 'id', created.data && created.data.id);
  }

  // Trigger init
  console.log('Trigger fix...');
  await page.goto(WP_SITE_URL + '/?v=' + Date.now(), { waitUntil: 'domcontentloaded' });

  // Verify: re-read form data
  console.log('\n=== VERIFICARE ===');
  const formData = await page.evaluate(async ({ base }) => {
    const r = await fetch(base + '/wp-admin/admin-ajax.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'action=mirt_read_elementor_form_data&template_id=248',
    });
    return await r.json();
  }, { base: WP_SITE_URL });

  if (formData.success && formData.data && formData.data.forms.length > 0) {
    const f = formData.data.forms[0];
    console.log('submit_actions:', JSON.stringify(f.submit_actions));
    console.log('fields:');
    f.form_fields.forEach((ff) => {
      console.log(`  - "${ff.field_label || ''}" | type: ${ff.field_type || '?'} | required: ${ff.required || 'no'} | id: ${ff.custom_id || ff._id || '?'}`);
    });

    const hasDynamicEmail = Array.isArray(f.submit_actions) && f.submit_actions.some((a) =>
      ['dce_form_email', 'dynamic_email', 'dce_dynamic_email', 'dce_email'].includes(a)
    );
    const phoneRequired = f.form_fields.some((ff) =>
      (ff.field_type === 'tel' || ff.custom_id === 'field_520ab23') && ff.required === 'true'
    );
    const acceptanceGone = !f.form_fields.some((ff) => ff.field_type === 'acceptance');
    const hasConsentHtml = f.form_fields.some((ff) => ff.custom_id === 'mirt_consent_text');

    console.log('\n--- Rezultat ---');
    console.log('Dynamic Email scos:', !hasDynamicEmail ? '✅' : '❌');
    console.log('Telefon obligatoriu:', phoneRequired ? '✅' : '❌');
    console.log('Checkbox acceptance scos:', acceptanceGone ? '✅' : '❌');
    console.log('Text acord sub buton:', hasConsentHtml ? '✅' : '❌');
  } else {
    console.log('Eroare la verificare:', JSON.stringify(formData));
  }

  await browser.close();
})();
