<?php
/**
 * Plugin Name: Masini – Filtru pe mobil (ascuns sau mutat jos)
 * Description: Pe pagina "Masini de vanzare", pe mobil: false = ascunde blocul de cautare/filtre; true = muta blocul sub lista. Fara Snippets – doar incarci acest fisier in wp-content/mu-plugins/
 * Version: 1.1
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// false = pe mobil blocul de cautare/filtre este ASCUNS. true = pe mobil cautarea se muta jos.
$GLOBALS['masini_cautare_jos_mobil_activ'] = false;

add_filter( 'body_class', 'masini_mobile_cautare_jos_body_class' );
add_action( 'wp_head', 'masini_mobile_cautare_jos_css', 20 );
add_action( 'wp_footer', 'masini_mobile_cautare_jos_js', 20 );

function masini_mobile_cautare_jos_body_class( $classes ) {
	if ( is_page( 'masini-de-vanzare' ) ) {
		$classes[] = 'masini-cautare-jos-mobil';
	}
	return $classes;
}

function masini_mobile_cautare_jos_css() {
	if ( ! is_page( 'masini-de-vanzare' ) ) {
		return;
	}
	$act = ! empty( $GLOBALS['masini_cautare_jos_mobil_activ'] );
	?>
<style id="masini-mobile-cautare-jos">
@media (max-width: 768px) {
	<?php if ( $act ) : ?>
	body.masini-cautare-jos-mobil main > div:has([id*="searchandfilter"]) {
		display: flex !important;
		flex-direction: column !important;
	}
	body.masini-cautare-jos-mobil main > div:has([id*="searchandfilter"]) > *:first-child {
		order: 2 !important;
	}
	body.masini-cautare-jos-mobil main > div:has([id*="searchandfilter"]) > *:last-child {
		order: 1 !important;
	}
	body.masini-cautare-jos-mobil main:has([id*="searchandfilter"]) {
		display: flex !important;
		flex-direction: column !important;
	}
	body.masini-cautare-jos-mobil main:has([id*="searchandfilter"]) > *:first-child {
		order: 2 !important;
	}
	body.masini-cautare-jos-mobil main:has([id*="searchandfilter"]) > *:last-child {
		order: 1 !important;
	}
	<?php else : ?>
	body.masini-cautare-jos-mobil .masini-filter-ascuns-mobil { display: none !important; }
	<?php endif; ?>
}
</style>
	<?php
}

function masini_mobile_cautare_jos_js() {
	if ( ! is_page( 'masini-de-vanzare' ) ) {
		return;
	}
	$act = ! empty( $GLOBALS['masini_cautare_jos_mobil_activ'] );
	?>
<script id="masini-mobile-cautare-jos-js">
(function() {
	var enableMobileReorder = <?php echo $act ? 'true' : 'false'; ?>;
	var hideClass = 'masini-filter-ascuns-mobil';
	function run() {
		if (window.innerWidth > 768) return;
		var main = document.querySelector('main') || document.querySelector('#content') || document.querySelector('.elementor-inner') || document.body;
		if (!main || !main.contains) return;
		var txt = function(s) { return (s || '').toLowerCase(); };
		var hasFilter = function(el) { var t = txt(el.textContent); return t.indexOf('terge filtrele') !== -1 || t.indexOf('sterge filtrele') !== -1 || t.indexOf('stergi filtrele') !== -1 || (t.indexOf('sorteaza') !== -1 && t.indexOf('marca') !== -1); };
		var marker = document.querySelector('[id*="searchandfilter"]') || document.querySelector('[class*="searchandfilter"]');
		if (!marker) {
			var withFilter = Array.from(main.querySelectorAll('*')).filter(hasFilter);
			marker = withFilter.reduce(function(best, el) { var len = (el.textContent || '').length; return (!best || len < (best.textContent || '').length) && len > 0 ? el : best; }, null);
		}
		if (!marker || !main.contains(marker)) return;
		var p = marker;
		while (p && p !== main) {
			var parent = p.parentElement;
			if (parent && parent.children.length > 1 && hasFilter(p)) {
				if (!enableMobileReorder) {
					p.classList.add(hideClass);
					return;
				}
				if (parent.lastElementChild !== p) {
					parent.appendChild(p);
				}
				return;
			}
			p = parent;
		}
	}
	function schedule() {
		run();
		setTimeout(run, 400);
		setTimeout(run, 1000);
		setTimeout(run, 2500);
		setTimeout(run, 5000);
	}
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', schedule);
	} else {
		schedule();
	}
	if (typeof jQuery !== 'undefined') {
		jQuery(document).on('sf:ajaxfinish', run);
		jQuery(document).on('searchandfilter:ajaxfinish', run);
	}
	setTimeout(function() {
		var el = document.querySelector('main') || document.querySelector('#content') || document.querySelector('.elementor-inner') || document.body;
		if (el) {
			var obs = new MutationObserver(function() { setTimeout(run, 400); });
			obs.observe(el, { childList: true, subtree: true });
		}
	}, 1000);
})();
</script>
	<?php
}
