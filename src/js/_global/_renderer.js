/*
	Load Plugins / Functions
-------------------------------------------------- */
import {getViewport, beforeScroll, afterScroll} from "./helpers";
import {domStorage, globalStorage} from "./storage";
import {globalEntrance, pageEntrance} from "./anims";
import { gsap } from "gsap";
import {LazyLoadWorker} from "../_worker/LazyLoadWorker";
import {GlobalLazyLoadWorker} from "../_worker/GlobalLazyLoadWorker";
import {ScrollBasedAnims} from "../_classes/ScrollBasedAnims";
import {AddToCart} from "../_extensions/Shopify/AddToCart";
import {MobileMenu} from "../_classes/MobileMenu";
import {MiniCart} from "../_classes/MiniCart";


/* --- Scroll variable --- */
export let $scroll
export let ImageLoad = new LazyLoadWorker(window.worker);
export let ImageLoadSecondary = new GlobalLazyLoadWorker(window.worker);
export let prefetchArr = []
/* --- Global Events - Fire on Every Page --- */
const globalEvents = (namespace = null)=>{
	globalStorage.namespace = namespace;
	let criticalMedia = document.querySelectorAll('.preload-critical');
	globalEntrance(namespace);

	ImageLoad.break = false;

	ImageLoad.loadImages(criticalMedia, "nodeList", (returned)=>{
		// crit ready
	});
	const transitionFinishedInt = () => {
		let transitionFinished = setInterval(()=>{
			if(globalStorage.transitionFinished){
				clearInterval(transitionFinished);
				beforeScroll();
				$scroll = new ScrollBasedAnims({});
				afterScroll();
				new AddToCart();

				pageEntrance(namespace);
				globalStorage.imagesLoaded = false;
			}
		}, 20);
	}

	transitionFinishedInt()

	const criticalPrefetchEls = document.querySelectorAll(".prefetch-critical:not(.fetched)")
	prefetchArr = [];
	for (let i = 0; i < criticalPrefetchEls.length; i++) {
		const el = criticalPrefetchEls[i]
		el.classList.add('fetched')

		if (el.href === window.location.href) {
			if (!prefetchedArr.includes(el.href)) {
				prefetchedArr.push(el.href)
			}
		} else if (!prefetchedArr.includes(el.href)) {
			el.classList.add("fetched")
			prefetchedArr.push(el.href)
			prefetchArr.push(el.href)
		}
	}
};
export let $miniCart = false;
export let $megaNav = false;
export let $mobileMenu = false;
export const prefetchedArr = [];

/* --- DOMContentLoaded Function --- */
export const onReady = ()=>{
	let namespace = document.querySelector("[data-router-view]").dataset.routerView;
	globalStorage.windowHeight = getViewport().height;
	globalStorage.windowWidth = getViewport().width;

	let vh = getViewport().height * 0.01;

	globalStorage.isGreaterThan767 = (globalStorage.windowWidth > 767 && !document.body.classList.contains("force-mobile"));
	globalStorage.isGreaterThan1280 = (globalStorage.windowWidth > 1280 && !document.body.classList.contains("force-mobile"));
	let type = "mobile"
	if (globalStorage.isGreaterThan1280) {
		type = "desktop"
	}
	ImageLoad.size = globalStorage.isGreaterThan767 ? "desktop" : "mobile";
	ImageLoadSecondary.size = globalStorage.isGreaterThan767 ? "desktop" : "mobile";
	document.body.style.setProperty('--vh', `${vh}px`);
	document.body.style.setProperty('--vhu', `${vh}px`);
	if (globalStorage.noBlendList.includes(namespace)) {
		domStorage.header.classList.add('no-blend');
	}
	if (domStorage.pencilBar) {
		let closePencilTrigger = document.getElementById('close-pencil');
		if(closePencilTrigger) {
			const pencilBar = domStorage.pencilBar

			closePencilTrigger.addEventListener("click", (e) => {
				e.preventDefault()
				e.stopPropagation()
				gsap.to(domStorage.header, { duration: 0.35, y: -(globalStorage.windowWidth > 767 ? 48 : 60), ease: "sine.inOut" });
				globalStorage.pencilBarClosed = true;
			});

			pencilBar.addEventListener("click", () => {
				gsap.to(domStorage.header, { duration: 0.35, y: -(globalStorage.windowWidth > 767 ? 48 : 60), ease: "sine.inOut" });
				globalStorage.pencilBarClosed = true;
			});
		}

	}


	// if (namespace === "product") {
	// 	let color = document.getElementById("page-color").dataset.color
	// 	setPageColorVariable(color)
	// }

	if (window.location.href.indexOf("cart=true") > -1) {
		window.history.replaceState(
			"",
			"",
			"/"
		);
	}
	globalStorage.namespace = namespace;

	$mobileMenu = new MobileMenu()
	$miniCart = new MiniCart();

	// loadGlobalScopeImages(type)
	globalEvents(namespace);

	document.getElementById('main-logo').addEventListener('click', () => {
		if (globalStorage.namespace === 'home') {
			$scroll.scrollTo(0)
		}
	})

	if (!globalStorage.isMobile) {
		document.addEventListener('mouseleave', () => {
			if ($megaNav && $megaNav.isOpen) {
				$megaNav.close()
			}
		})
	}

	const form = document.getElementById('mobile-search')
	// new PredictiveSearch(form)
};


/* --- window.onload Function --- */
export const onLoad = ()=>{

};

/* --- window.onresize Function --- */
export const onResize = ()=>{
	let newWidth = getViewport().width;
	let omnibar = false;
	if (globalStorage.windowWidth === newWidth && globalStorage.isMobile) {
		omnibar = true;
	}

	globalStorage.windowHeight = getViewport().height;
	globalStorage.windowWidth = newWidth;

	let vh = globalStorage.windowHeight * 0.01;
	if (!omnibar) {
		document.body.style.setProperty('--vh', `${vh}px`);
		if ($scroll) {
			$scroll.resize();
		}
	}

	document.body.style.setProperty('--vhu', `${vh}px`);

};

/*
 *	Highway NAVIGATE_OUT callback
 *
 *	onLeave is fired when a highway transition has been
 *	initiated. This callback is primarily used to unbind
 *	events, or modify global settings that might be called
 *	in onEnter/onEnterCompleted functions.
 */
export const onLeave = (from, trigger, location)=>{
	if (ImageLoad.loadingImages) {
		ImageLoad.break = true;
		ImageLoad.loadingImages = false;
	} else {
		ImageLoad.loadingImages = false;
	}
	if (ImageLoadSecondary.loadingImages) {
		ImageLoadSecondary.break = true;
		ImageLoadSecondary.loadingImages = false;
	} else {
		ImageLoadSecondary.loadingImages = false;
	}
	if ($scroll) {
		$scroll.destroy()
		$scroll = false;
	}

	/* --- Flag transition for load in animations --- */
	globalStorage.transitionFinished = false;
	globalStorage.imagesLoaded = false;

	if (domStorage.pencilBar && !globalStorage.pencilBarClosed) {
		if (!globalStorage.transitionedOnce) {
			globalStorage.transitionedOnce = true
		} else {
			// document.getElementById('close-pencil').click()
		}
	}
};

/*
 *	Highway NAVIGATE_IN callback
 *
 *	onEnter should only contain event bindings and non-
 *	DOM related event measurements. Both view containers
 *	are still loaded into the DOM during this callback.
 */
export const onEnter = (to, trigger, location)=>{

	/* --- This needs to stay here --- */
	globalEvents(to.view.dataset.routerView);
};

/*
 *	Highway NAVIGATE_END callback
 *
 *	onEnterCompleted should be your primary event callback.
 *	The previous view's DOM node has been removed when this
 *	event fires.
 */
export const onEnterCompleted = (from, to, trigger, location)=>{

	/* --- Track Page Views through Ajax --- */
	// tracking("google", "set", "page", location.pathname);
	// tracking("google", "send", {
	// 	hitType: "pageview",
	// 	page: location.pathname,
	// 	title: to.page.title
	// });
};




