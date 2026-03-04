import { gsap } from "gsap";
import { globalStorage, domStorage } from "./storage";
import {H} from "../routing";
import {$megaNav, $scroll, ImageLoadSecondary, prefetchArr} from "./_renderer";
import Cookies from "js-cookie";
import {Prefetch} from "./helpers";
import EmblaCarousel from "embla-carousel";
import {ImageFollow} from "../_classes/ImageFollow";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger)

/*
	Global element animations
-------------------------------------------------- */
export let $slideShow;
export const pageEntrance = (namespace = null)=> {
	let timeline = new gsap.timeline({ paused: true });
	if (globalStorage.firstLoad) {
		gsap.set(domStorage.header, { zIndex: 9999 });
		timeline.fromTo(domStorage.header, { opacity: 0 }, { opacity: 1, ease: 'sine.inOut', duration: 0.2, force3D: true })
	}

	gsap.set(domStorage.globalMask, { autoAlpha: 0 });
	let homeImagesLoaded = false;

	/* ----- Setup cases for specific load-ins ----- */
	switch(namespace){
		case "home":
			let followWrapper = document.getElementById('hero-images');
			const urls = globalStorage.windowWidth > 767 ? followWrapper.dataset.urlsDesktop : followWrapper.dataset.urlsMobile
			let imgArr = urls.split( '|||');

			let returnedImages;
			ImageLoadSecondary.loadImages(imgArr, "array", (returned) => {
				returnedImages = returned;
				homeImagesLoaded = true;
			});
			// Header shift
			const header = document.getElementById('hero-header')
			const parts = header.querySelectorAll('span')
			const partOneBounds = parts[0].getBoundingClientRect()
			const partTwoBounds = parts[1].getBoundingClientRect()
			const padding = getComputedStyle(header.parentElement).paddingLeft;
			const paddingInt = Number(padding.replace('px', ''))
			const leftShift = Math.round(partOneBounds.left - paddingInt);
			const rightShift = Math.round(globalStorage.windowWidth - partTwoBounds.right - paddingInt);
			const splitDelay = globalStorage.firstLoad ? 0.8 : 0.45;

			// Image scale up
			const scaleImages = followWrapper.querySelectorAll('img.inner');
			const followParent = followWrapper.querySelector('.follow')

			timeline
				.set(followParent, { opacity: 1 })
				.fromTo(header, { opacity: 0 }, { opacity: 1, ease: 'sine.inOut', duration: 0.2, force3D: true }, 0)
				.to(parts[0], { x: -leftShift, duration: .85, ease: 'expo.inOut', force3D: true }, splitDelay)
				.to(parts[1], { x: rightShift, duration: .85, ease: 'expo.inOut', force3D: true }, splitDelay)

				.fromTo(scaleImages, { scale: 0 }, { scale: 1, stagger: 0.25, duration: 1, ease: 'expo.out' }, splitDelay + 0.4)
				.to(scaleImages, { scale: 0, duration: 0.5, stagger: -0.04, ease: 'expo.out', onComplete: () => {
						new ImageFollow(followWrapper, returnedImages);

						// const tl = gsap.timeline()
						// tl.to(followWrapper, { scale: 0, ease: 'none', duration: 1, force3D: true })
						//
						// ScrollTrigger.create({
						// 	trigger: "#st",
						// 	start: 'clamp(top bottom)',
						// 	end: 'clamp(bottom top)',
						// 	scrub: 0.6,
						// 	animation: tl
						// });
					} }, "+=.23")
			break;
		default:
			//
			break;

	}

	gsap.set(domStorage.eventMask, { pointerEvents: "none" });
	timeline.add(() => {
		if (prefetchArr.length > 0) {
			new Prefetch(prefetchArr)
		}
		if (globalStorage.pencilMarquee && !globalStorage.pencilMarquee.playing && $scroll.data.scrollY < 40) {
			globalStorage.pencilMarquee.tween.play();
			globalStorage.pencilMarquee.playing = true;
		}
	})

	let interval = setInterval(() => {
		if (homeImagesLoaded || globalStorage.namespace !== 'home') {
			clearInterval(interval);
			timeline.play();
		}
	}, 20);

	if (globalStorage.firstLoad) {
		globalStorage.firstLoad = false;
	}
};

export const globalEntrance = (namespace)=>{

	if(globalStorage.firstLoad !== true){
		return;
	}

	/* ----- Establish our timeline ----- */
	// gsap.set(domStorage.header, { y: -(globalStorage.windowWidth > 767 ? 42 : 36), autoAlpha: 1, force3D: true })

	if (globalStorage.windowWidth < 767) {
		new Marquees(true);
	}
	globalStorage.transitionFinished = true;

	const style = 'background-color: #4e586b !important; color: #f3f3ee; font-size: 12px;'
	console.log("%cDiseño: https://espina.studio", style);
	console.log(".");
	console.log("%cDesarollo y motion design: https://x.com/joshgkirk", style);
	console.log(".");
	console.log("%cInfinite slider motion first implemented on https://monolith.nyc by https://heycusp.com and https://nathan.cx", style);
};

export const prepSliders = () => {
	if (globalStorage.windowWidth < 768) {
		const blankSlides = document.querySelectorAll(".empty-slide")
		blankSlides.forEach((slide) => {
			slide.parentElement.removeChild(slide)
		});
	}
	let prepControls = (slider, dots, prev, next, secondaryDots) => {
		if (prev) {
			prev.addEventListener('click', () => {
				slider.scrollPrev();
			});
		}
		if (next) {
			next.addEventListener('click', () => {
				slider.scrollNext();
			});
		}
		if (dots) {
			for (let j = 0; j < dots.length; j++) {
				dots[j].addEventListener('click', () => {
					if (dots[j].classList.contains("active")) { return; }
					slider.scrollTo(j);
				});
			}
			slider.on("select", () => {
				dots[slider.previousScrollSnap()].classList.remove('active');
				dots[slider.selectedScrollSnap()].classList.add('active');
			});
		}

		if (secondaryDots) {
			globalStorage.featuresSlider = slider
			for (let j = 0; j < secondaryDots.length; j++) {
				secondaryDots[j].addEventListener('click', () => {
					if (secondaryDots[j].classList.contains("active")) { return; }
					slider.scrollTo(j);
				});
			}
			slider.on("select", () => {
				secondaryDots[slider.previousScrollSnap()].classList.remove('active');
				secondaryDots[slider.selectedScrollSnap()].classList.add('active');
			});
		}
	};

	let sliders = document.querySelectorAll('.slider:not(.prepped):not(.wait)');

	for (let i = 0; i < sliders.length; i++) {
		const el = sliders[i];

		if (el.dataset.at) {
			let width = parseInt(el.dataset.at);
			if (globalStorage.windowWidth > width) {
				continue;
			}
		}
		if (el.dataset.above) {
			let width = parseInt(el.dataset.above);
			if (globalStorage.windowWidth <= width) {
				continue;
			}
		}

		const slideWrapper = el.querySelector('.slides');
		const slides = el.querySelectorAll('.slide');
		const prev = el.querySelector('.prev');
		const next = el.querySelector('.next');
		const dotsWrapper = el.querySelector('.dots');
		let dots = false;

		if (dotsWrapper) {
			dots = dotsWrapper.querySelectorAll('.dot');
		}

		let slideAlignment = el.dataset.align ? el.dataset.align : 'center';
		let loop = !el.classList.contains("no-loop");
		let vertical = el.classList.contains("vertical") ? "y" : "x";
		let extraFunctionality = el.classList.contains("extra-functionality");
		let changeEls = [];
		let secondaryDots = false;

		if (el.classList.contains("links-inside")) {
			let links = el.querySelectorAll("a");
			H.detach(links)
			links.forEach((link) => {
				link.addEventListener("click", (e) => {
					e.preventDefault();
					e.stopPropagation();
					if (slider.clickAllowed()) {
						let url;
						if (!e.target.href) {
							url = e.target.closest("a").href;
						} else {
							url = e.target.href;
						}
						H.redirect(url);
					} else { return }
				});
			});
		}

		const options = { loop: loop, axis: vertical, inViewThreshold: 0.3, startIndex: 0, containScroll: globalStorage.windowWidth > 767 ? "trimSnaps" : "", align: slideAlignment };

		const slider = EmblaCarousel(slideWrapper, options);

		let button;
		if (el.classList.contains("modal-slider")) {
			button = el.parentElement.nextElementSibling
		}

		prepControls(slider, dots, prev, next, secondaryDots);
		el.classList.add("prepped");

		const onSelect = () => {
			let activeIdx = slider.selectedScrollSnap();
			if (activeIdx !== 0) {
				prev.classList.remove('disabled')
			} else {
				prev.classList.add('disabled')
			}

			if (activeIdx === slides.length - 1) {
				next.classList.add('disabled')
			} else {
				next.classList.remove('disabled')
			}
		};

		// const changeOtherEls = (prevIdx, activeIdx) => {
		// 	let outEls = [],
		// 		inEls = [];
		//
		// 	for (let i = 0; i < changeEls.length; i++) {
		// 		outEls.push(changeEls[i][prevIdx]);
		// 		inEls.push(changeEls[i][activeIdx]);
		// 	}
		//
		// 	gsap.to(outEls, { duration: 0.25, autoAlpha: 0, stagger: 0.05, ease: "sine.out", force3D: true });
		// 	gsap.to(inEls, { duration: 0.25, autoAlpha: 1, stagger: 0.05, ease: "sine.inOut", force3D: true });
		// };

		slider.on('select', onSelect)
	}

};

export const prepButtonHovers = () => {
	const btns = document.querySelectorAll('.square-btn:not(.prepped)')
	const startEvent = globalStorage.isMobile ? 'touchstart' : 'mouseenter'
	const endEvent = globalStorage.isMobile ? 'touchend' : 'mouseleave'
	for (let i = 0; i < btns.length; i++) {
		const btn = btns[i]
		btn.classList.add('prepped')
		const leftTop = btn.querySelectorAll('.svg__left.svg__top')
		const leftBottom = btn.querySelectorAll('.svg__left.svg__bottom')
		const rightTop = btn.querySelectorAll('.svg__right.svg__top')
		const rightBottom = btn.querySelectorAll('.svg__right.svg__bottom')
		const tl = new gsap.timeline()
		let entered = false
		btn.addEventListener(startEvent, () => {
			if (entered) { return }
			entered = true
			tl.clear()
			tl.progress(0)
			tl
				.to(leftTop, { duration: 1, "--z": '-10px', "--x": 1, "--y": 1, "--angle": "720deg", transformOrigin: "0 0", ease: "expo.out" })
				.to(leftBottom, { duration: 1, "--z": '-10px', "--x": 1, "--y": -1, "--angle": "-720deg", transformOrigin: "0 100%", ease: "expo.out" }, 0)
				.to(rightTop, { duration: 1, "--z": '-10px', "--x": 1, "--y": -1, "--angle": "-720deg", transformOrigin: "100% 0", ease: "expo.out" }, 0)
				.to(rightBottom, { duration: 1, "--z": '-10px', "--x": 1, "--y": 1, "--angle": "720deg", transformOrigin: "100% 100%", ease: "expo.out" }, 0)
		})
		btn.addEventListener(endEvent, () => {
			tl.clear()
			tl.progress(0)
			tl
				.to([leftTop, leftBottom, rightBottom, rightTop], { duration: 1.2, "--z": '0px', "--x": 0, "--y": 0, "--angle": "0deg", ease: "expo.out" })
			entered = false
		})
		if (!globalStorage.isMobile) {
			btn.addEventListener('mousemove', () => {
				if (entered) { return }
				entered = true
				tl.clear()
				tl.progress(0)
				tl
					.to(leftTop, { duration: 0.6, rotationX: -180, yPercent: 100, y: -1, force3D: true, ease: "expo.out" })
			})
		}
	}
}

export class Modal {
	constructor(modal, timeout = false, cookied = false) {
		if ( cookied && Cookies.get('seenPopup')) { return; }
		this.modal = modal;
		this.cookied = cookied;
		this.imageOuter = this.modal.querySelector(".right")
		this.imageInner = this.modal.querySelector(".right-inner")
		this.leftBg = this.modal.querySelector(".color-bg")
		this.leftItems = this.modal.querySelectorAll(".s-el")
		this.modalBackdrop = document.getElementById("modal-backdrop");
		this.closeTrigger = this.modal.querySelector(".nav-close");
		this.isOpen = false;
		this.timeline = new gsap.timeline();

		this.prepDom();
		this.bindEvents();
		if (timeout) {
			this.startTimeout();
		}
	}
	prepDom() {
		gsap.set(this.leftBg, { scaleY: 0 })
		gsap.set(this.closeTrigger, { scale: 0, rotation: -360 })
		gsap.set(this.leftItems, { y: -10, autoAlpha: 0 })
		gsap.set(this.imageOuter, { yPercent: -100.5 })
		gsap.set(this.imageInner, { yPercent: 100.5 })
		gsap.set(this.modal, { autoAlpha: 1, pointerEvents: "none" })
	}

	bindEvents() {
		this.closeTrigger.addEventListener("click", () => { this.close(); });
		this.modalBackdrop.addEventListener("click", () => {
			if (this.isOpen) {
				this.close();
			}
		});
	}
	startTimeout() {
		gsap.delayedCall(parseFloat(this.modal.dataset.popupDelay), () => {
			// if ($promoModal.isOpen) {
			// 	gsap.delayedCall(3, () => {
			// 		this.startTimeout()
			// 	})
			// } else {
			// 	if ( !Cookies.get('seenPopup')) {
			// 		if (window.location.pathname === "/") {
			// 			this.open();
			// 		} else if (!document.getElementById("main").dataset.nopopup.includes(window.location.pathname.substring(1))) {
			// 			this.open();
			// 		}
			// 	}
			// }
		});
	}
	open() {
		if (!this.isOpen) {
			this.isOpen = true;
			this.timeline.clear()
			this.timeline.progress(0)

			gsap.to(this.modalBackdrop, { autoAlpha: 1, ease: "sine.inOut", duration: 0.3, force3D: true });

			this.timeline
				.set(this.modal, { pointerEvents: "all" })
				.to(this.leftBg, { scaleY: 1, duration: 1.2, ease: "expo.inOut", force3D: true }, 0.2)
				.to(this.leftItems, { y: 0, autoAlpha: 1, stagger: 0.05, duration: 0.4, ease: "sine.out", force3D: true }, 0.8)

				.to(this.imageOuter, { duration: 1.2, yPercent: 0, ease: "expo.inOut", force3D: true }, 0)
				.to(this.imageInner, { duration: 1.2, yPercent: 0, ease: "expo.inOut", force3D: true }, 0)
				.to(this.closeTrigger, { scale: 1, duration: 1.1, rotation: 0, ease: "expo.inOut" }, "-=.7")
		}
	}
	close() {
		if (this.isOpen) {
			this.isOpen = false;
			this.timeline.clear()
			this.timeline.progress(0)

			if ( this.cookied && !Cookies.get('seenPopup') ) {
				Cookies.set('seenPopup', 'true', { expires: Number(this.modal.dataset.cookieDur) });
			}

			gsap.to(this.modalBackdrop, { autoAlpha: 0, ease: "sine.out", duration: 0.3, force3D: true });

			this.timeline
				.set(this.modal, { pointerEvents: "none" })
				.to(this.leftBg, { scaleY: 0, duration: 0.8, ease: "expo.inOut", force3D: true }, 0)
				.to(this.leftItems, { y: -8, autoAlpha: 0, duration: 0.3, ease: "sine.out", force3D: true }, 0)

				.to(this.imageOuter, { duration: 0.8, yPercent: -100.5, ease: "expo.inOut", force3D: true }, 0.2)
				.to(this.imageInner, { duration: 0.8, yPercent: 100.5, ease: "expo.inOut", force3D: true }, 0.2)
				.to(this.closeTrigger, { scale: 0, rotation: -360, ease: "expo.inOut", duration: 0.8 }, 0)
		}
	}
}

export const prepDrawers = () => {
	const drawers = document.querySelectorAll(".drawer:not(.bound)")

	for (let i = 0; i < drawers.length; i++) {
		const thisDrawer = drawers[i]
		let width = parseInt(thisDrawer.dataset.at);
		if (globalStorage.windowWidth > width) {
			continue;
		}
		thisDrawer.classList.add("bound")
		const childrenWrapper = thisDrawer.querySelector(".drawer-items");
		const childrenWrapperItems = childrenWrapper.querySelectorAll("*");
		const childrenWrapperHeight = childrenWrapper.offsetHeight;
		const childrenItems = thisDrawer.querySelectorAll(".drawer-items > *");
		const bg = drawers[i].querySelector(".drawer-bg");
		const noItemFade = thisDrawer.classList.contains("no-item-fade")
		if (thisDrawer.classList.contains("replace-label")) {
			let label = thisDrawer.querySelector(".current-label");
			childrenItems.forEach((item) => {
				item.addEventListener("click", () => {
					label.innerHTML = item.innerHTML;
				});
			});
		}

		if (thisDrawer.classList.contains("allow-click")) {
			childrenWrapper.addEventListener("click", (event) => {
				event.stopPropagation();
			});
		}

		thisDrawer.addEventListener("click", event => {
			if (!thisDrawer.classList.contains("open")) {
				const openDrawers = document.querySelectorAll(".drawer.open")
				for (let i = 0; i < openDrawers.length; i++) {
					openDrawers[i].classList.remove("open")
					if (globalStorage.isMobile && thisDrawer.classList.contains("faq-drawer")) {
						gsap.set(openDrawers[i].querySelector(".drawer-items"), { height: 0, force3D: true })
					} else {
						gsap.to(openDrawers[i].querySelector(".drawer-items"), 0.3, { height: 0, force3D: true, ease: "sine.out" })
					}
					if (!noItemFade) {
						gsap.to(openDrawers[i].querySelectorAll(".drawer-items > *"), 0.3, { opacity: 0, force3D: true, ease: "sine.inOut" })
					}
				}
				thisDrawer.classList.add("open")

				gsap.to(childrenWrapper, 0.3, { height: childrenWrapperHeight, force3D: true, ease: "sine.out" })

				if (!noItemFade) {
					gsap.fromTo(childrenWrapperItems, 0.3, { opacity: 0 }, { opacity: 1, force3D: true, ease: "sine.inOut" })
				}

				// if (thisDrawer.classList.contains("replace-label")) {
				// 	gsap.to(bg, { borderRadius: "13", force3D: true, ease: "sine.out", duration: 0.3, delay: .1 });
				// }
			} else {

				thisDrawer.classList.remove("open")

				if (globalStorage.isMobile && thisDrawer.classList.contains("faq-drawer")) {
					gsap.set(childrenWrapper, { height: 0, force3D: true })
					if ($scroll) {
						$scroll.resize();
					}
				} else {
					gsap.to(childrenWrapper, 0.3, { height: 0, force3D: true, ease: "sine.inOut", onComplete: () => {
							if ($scroll) {
								$scroll.resize();
							}
						} })
				}
				if (!noItemFade) {
					gsap.to(childrenWrapperItems, 0.3, { opacity: 0, force3D: true, ease: "sine.inOut" })
				}

				if (thisDrawer.classList.contains("replace-label")) {
					gsap.to(bg, { force3D: true, ease: "sine.out", duration: 0.3, delay: .1 });
				}
			}
		})
		gsap.set(childrenWrapper, { height: 0 })
	}
};

export const stickyPdpDrawer = () => {
	const drawer = document.querySelector(".sticky-pdp-drawer:not(.sticky-bound)")
	if (!drawer) { return }
	const thisDrawer = drawer
	let width = parseInt(thisDrawer.dataset.at);
	if (globalStorage.windowWidth > width) {
		return;
	}
	thisDrawer.classList.add("sticky-bound")
	const childrenWrapper = thisDrawer.querySelector(".sticky-drawer-items");
	const childrenWrapperItems = childrenWrapper.querySelectorAll("*");
	const childrenWrapperHeight = childrenWrapper.offsetHeight;
	const childrenItems = thisDrawer.querySelectorAll(".sticky-drawer-items > *");
	const bg = thisDrawer.querySelector(".drawer-bg");
	const noItemFade = thisDrawer.classList.contains("no-item-fade")
	if (thisDrawer.classList.contains("replace-label")) {
		let label = thisDrawer.querySelector(".current-label");
		childrenItems.forEach((item) => {
			item.addEventListener("click", () => {
				label.innerHTML = item.innerHTML;
			});
		});
	}

	if (thisDrawer.classList.contains("allow-click")) {
		childrenWrapper.addEventListener("click", (event) => {
			event.stopPropagation();
		});
	}

	const innerDrawers = thisDrawer.querySelectorAll('.drawer')
	for (let i = 0; i < innerDrawers.length; i++) {
		innerDrawers[i].addEventListener('click', (e) => {
			e.stopPropagation()
		})
	}

	thisDrawer.addEventListener("click", event => {
		if (!thisDrawer.classList.contains("open")) {
			const openDrawers = document.querySelectorAll(".sticky-pdp-drawer.open")
			for (let i = 0; i < openDrawers.length; i++) {
				openDrawers[i].classList.remove("open")
				if (globalStorage.isMobile && thisDrawer.classList.contains("faq-drawer")) {
					gsap.set(openDrawers[i].querySelector(".sticky-drawer-items"), { height: 0, force3D: true })
				} else {
					const itemsWrapper = openDrawers[i].querySelector(".sticky-drawer-items")
					gsap.to(itemsWrapper, { height: 0, duration: 0.3, force3D: true, ease: "sine.out", onComplete: () => { gsap.set(itemsWrapper, { overflow: 'hidden' }) } })
				}
				if (!noItemFade) {
					gsap.to(openDrawers[i].querySelectorAll(".sticky-drawer-items > *"), { opacity: 0, duration: 0.3, force3D: true, ease: "sine.inOut" })
				}
			}
			thisDrawer.classList.add("open")

			gsap.to(childrenWrapper, { height: childrenWrapperHeight, duration: 0.3, force3D: true, ease: "sine.out", onComplete: () => { gsap.set(childrenWrapper, { overflow: 'visible' }) } })

			if (!noItemFade) {
				gsap.fromTo(childrenWrapperItems, { opacity: 0 }, { opacity: 1, duration: 0.3, force3D: true, ease: "sine.inOut" })
			}
		} else {
			thisDrawer.classList.remove("open")

			if (globalStorage.isMobile && thisDrawer.classList.contains("faq-drawer")) {
				gsap.set(childrenWrapper, { height: 0, force3D: true })
				if ($scroll) {
					$scroll.resize();
				}
			} else {
				gsap.to(childrenWrapper, { height: 0, duration: 0.3, force3D: true, ease: "sine.inOut", onComplete: () => { gsap.set(childrenWrapper, { overflow: 'hidden' }) } })
			}
			if (!noItemFade) {
				gsap.to(childrenWrapperItems, { opacity: 0, duration: 0.3, force3D: true, ease: "sine.inOut" })
			}

			if (thisDrawer.classList.contains("replace-label")) {
				gsap.to(bg, { force3D: true, ease: "sine.out", duration: 0.3, delay: .1 });
			}
		}
	})
	gsap.set(childrenWrapper, { height: 0 })
};

document.addEventListener('click', (e) => {
	if (!e.target.closest('.drawer')) {
		const opendrawer = document.querySelector('.drawer.open')
		if (opendrawer) {
			opendrawer.click()
		}
	}
	if (!e.target.closest('.sticky-pdp-drawer')) {
		const opendrawer = document.querySelector('.sticky-pdp-drawer.open')
		if (opendrawer) {
			opendrawer.click()
		}
	}
})

export const playButtonFade = () => {
	const playTrigger = document.getElementById('play-trigger');
	const videoEl = document.getElementById('video-el');
	const videoGradient = playTrigger.querySelectorAll('button');
	let isPlaying = false;


	if (!videoEl) {
		return;
	} else {
		videoEl.pause();
	}

	playTrigger.addEventListener("click", () => {
		if (isPlaying) {
			isPlaying = false;
			videoEl.pause();
			gsap.to(videoGradient, { duration: 0.2, autoAlpha: 1, force3D: true, ease: "sine.inOut" });
		} else {
			isPlaying = true;
			videoEl.play();
			gsap.to(videoGradient, { duration: 0.2, autoAlpha: 0, force3D: true, ease: "sine.inOut" });
		}
	});

	// playTrigger.addEventListener("mouseenter", () => {
	// 	gsap.to(videoGradient, { duration: 0.2, autoAlpha: 1, force3D: true, ease: "sine.inOut" });
	// });
	// playTrigger.addEventListener("mouseleave", () => {
	// 	gsap.to(videoGradient, { duration: 0.2, autoAlpha: 0, force3D: true, ease: "sine.inOut" });
	// });


};

export const filterTabs = () => {
	if(globalStorage.namespace !== "collection") { return; }
	let tabParent = document.querySelector(".collection-wrapper");
	const triggers = tabParent.querySelectorAll('.collection-filters-buttons');
	const tabsWrapper = tabParent.querySelector('.collection-inner');
	const tiles = tabsWrapper.querySelectorAll('.product-tile:not(.dummy)');

	for (let i = 0; i < triggers.length; i++) {
		let trigger = triggers[i],
			triggerData = trigger.dataset.trigger,
			animating = false;

		trigger.addEventListener("click", () => {
			if (animating || trigger.classList.contains("is-selected")) { return; }

			animating = true;

			gsap.delayedCall(.19, () => { animating = false; });

			document.querySelector(".blue-selected.is-selected").classList.remove("is-selected");

			trigger.classList.add("is-selected");

			gsap.to(tabsWrapper, { autoAlpha: 0, ease: "sine.inOut", force3D: true, duration: .18, onComplete: () => {
				for (let j = 0; j < tiles.length; j++) {
					const tile = tiles[j];

					if (triggerData === 'all') {
						gsap.set(tile, { display: "flex" });
					} else if (tile.classList.contains(triggerData)) {
						gsap.set(tile, { display: "flex" });
					} else {
						gsap.set(tile, { display: "none" });
					}
				}

				gsap.to(tabsWrapper, { autoAlpha: 1, ease: "sine.inOut", duration: 0.3, force3D: true });
			} })

		});

	}

}

export const prepTabs = () => {
	let tabWrappers = document.querySelectorAll(".tab-set");
	for (let i = 0; i < tabWrappers.length; i++) {
		let el = tabWrappers[i],
			tabs = el.querySelectorAll('[data-tab="'+ el.dataset.tabs +'"]'),
			triggers = el.querySelectorAll('[data-trigger="'+ el.dataset.triggers +'"]'),
			activeIdx = 0,
			animating = false;

		for (let j = 0; j < triggers.length; j++) {
			let trigger = triggers[j],
				tab = tabs[j];

			trigger.addEventListener("click", () => {
				if (trigger.classList.contains("active") || animating) { return; }
				animating = true;
				let currentTab = tabs[activeIdx];
				el.querySelector(".trigger.active").classList.remove("active");
				trigger.classList.add("active");
				activeIdx = j;

				gsap.to(currentTab, { autoAlpha: 0, ease: "sine.inOut", duration: 0.2, onComplete: () => {
						gsap.set(currentTab, { position: "absolute" });
						gsap.set(tab, { position: "relative" });
						gsap.to(tab, { autoAlpha: 1, ease: "sine.inOut", duration: 0.25 } );
					}
				});

				gsap.delayedCall(.205, () => { animating = false; });
			});
		}
	}
};

export class StyleSlider {
	constructor() {
		this.slider = document.getElementById('style-slider')
		if (!this.slider) { return }

		this.bindMethods();

		this.slides = this.slider.querySelectorAll('.slide')
		this.links = this.slider.dataset.links.split('||')
		this.cta = this.slider.querySelector('.pink-btn')
		this.prevTrigger = this.slider.querySelector('.prev')
		this.nextTrigger = this.slider.querySelector('.next')
		this.prevTriggerOval = this.slider.querySelector('.portrait-frames path:last-child')
		this.nextTriggerOval = this.slider.querySelector('.portrait-frames path:first-child')
		this.topTexts = this.slider.querySelectorAll('.top-text p')
		this.bottomTexts = this.slider.querySelectorAll('.bottom-text p')
		this.animating = false
		this.timeline = new gsap.timeline({ onComplete: () => { this.animating = false } })
		this.getCache()
	}
	bindMethods() {
		['prev', 'next', 'resize']
			.forEach(fn => this[fn] = this[fn].bind(this));
	}
	getCache() {
		this.slideData = []
		this.currIdx = 0;
		this.prevIdx = 0;
		for (let i = 0; i < this.slides.length; i++) {
			const bounds = this.slides[i].getBoundingClientRect()
			const thisData = {
				left: bounds.left,
				right: bounds.right,
				width: bounds.width,
				currPos: i,
				el: this.slides[i]
			}
			this.slideData.push(thisData)
		}
		this.oneShiftDist = this.slideData[2].left - this.slideData[1].left;
		this.twoShiftDist = this.oneShiftDist * 2;
		gsap.set([this.topTexts[1], this.topTexts[2], this.bottomTexts[1], this.bottomTexts[2]], { yPercent: -100 })
		this.bindEvents()
	}
	bindEvents() {
		this.prevTrigger.addEventListener('click', () => {
			if (this.animating) { return }
			this.prev()
			this.prevTexts()
		})
		this.prevTriggerOval.addEventListener('click', () => {
			if (this.animating) { return }
			console.log('prev path clicked')
			this.prev()
			this.prevTexts()
		})

		this.nextTrigger.addEventListener('click', () => {
			if (this.animating) { return }
			this.next()
			this.nextTexts()
		})
		this.nextTriggerOval.addEventListener('click', () => {
			if (this.animating) { return }
			this.next()
			this.nextTexts()
		})
	}

	prev() {
		this.animating = true
		this.prevIdx = this.currIdx
		this.currIdx = this.currIdx === 0 ? (this.slides.length - 1) : this.currIdx - 1;
		this.cta.href = this.links[this.currIdx];
		this.timeline.clear()
		this.timeline.progress(0)
		for (let i = 0; i < this.slideData.length; i++) {
			const data = this.slideData[i];
			let left;
			if (data.currPos === 0) {
				const xPosOne = this.oneShiftDist * 0.5
				const shiftTo = globalStorage.windowWidth + Math.abs(this.slideData[0].left)
				const xPosTwo = this.twoShiftDist
				if (i === 0) {
					left = this.twoShiftDist
				} else if (i === 1) {
					left = this.oneShiftDist
				} else if (i === 2) {
					left = 0
				}
				this.timeline
					.to(data.el, { x: -xPosOne, duration: .8, ease: 'expo.inOut', force3D: true }, 0)
					.set(data.el, { x: shiftTo }, 0.5)
					.to(data.el, { x: xPosTwo, duration: .42, ease: 'expo.out', force3D: true }, 0.5)
					.set(data.el, { left: left, clearProps: 'x' })
			} else if (data.currPos === 1) {
				const xPos = -this.oneShiftDist
				if (i === 0) {
					left = 0
				} else if (i === 1) {
					left = -this.oneShiftDist;
				} else if (i === 2) {
					left = -this.twoShiftDist
				}
				this.timeline
					.to(data.el, { x: xPos, duration: 0.9, ease: 'expo.inOut', force3D: true }, 0)
					.set(data.el, { left: left, clearProps: 'x' })
			} else if (data.currPos === 2) {
				const xPos = -this.oneShiftDist
				if (i === 0) {
					left = this.oneShiftDist
				} else if (i === 1) {
					left = 0
				} else if (i === 2) {
					left = -this.oneShiftDist
				}
				this.timeline
					.to(data.el, { x: xPos, duration: 0.9, ease: 'expo.inOut', force3D: true }, 0)
					.set(data.el, { left: left, clearProps: 'x' })
			}

			data.currPos = data.currPos === 0 ? (this.slideData.length - 1) : data.currPos - 1;
		}
	}
	next() {
		this.animating = true
		this.prevIdx = this.currIdx
		this.currIdx = this.currIdx === (this.slides.length - 1) ? 0 : this.currIdx + 1;
		this.cta.href = this.links[this.currIdx];
		this.timeline.clear()
		this.timeline.progress(0)
		for (let i = 0; i < this.slideData.length; i++) {
			const data = this.slideData[i];
			let left;
			if (data.currPos === 0) {
				const xPos = this.oneShiftDist
				if (i === 0) {
					left = this.oneShiftDist
				} else if (i === 1) {
					left = 0
				} else if (i === 2) {
					left = -this.oneShiftDist
				}
				this.timeline
					.to(data.el, { x: xPos, duration: 0.9, ease: 'expo.inOut', force3D: true }, 0)
					.set(data.el, { left: left, clearProps: 'x' })
			} else if (data.currPos === 1) {
				const xPos = this.oneShiftDist
				if (i === 0) {
					left = this.twoShiftDist
				} else if (i === 1) {
					left = this.oneShiftDist
				} else if (i === 2) {
					left = 0
				}
				this.timeline
					.to(data.el, { x: xPos, duration: 0.9, ease: 'expo.inOut', force3D: true }, 0)
					.set(data.el, { left: left, clearProps: 'x' })
			} else if (data.currPos === 2) {
				const xPosOne = this.oneShiftDist * 0.5
				const shiftTo = -((this.slideData[2].right - globalStorage.windowWidth) + globalStorage.windowWidth)
				const xPosTwo = -this.twoShiftDist
				if (i === 0) {
					left = 0
				} else if (i === 1) {
					left = -this.oneShiftDist
				} else if (i === 2) {
					left = -this.twoShiftDist
				}
				this.timeline
					.to(data.el, { x: xPosOne, duration: .8, ease: 'expo.inOut', force3D: true }, 0)
					.set(data.el, { x: shiftTo }, 0.5)
					.to(data.el, { x: xPosTwo, duration: .42, ease: 'expo.out', force3D: true }, 0.5)
					.set(data.el, { left: left, clearProps: 'x' })

			}

			data.currPos = data.currPos === (this.slideData.length - 1) ? 0 : data.currPos + 1;
		}
	}

	nextTexts() {
		gsap.to([this.topTexts[this.prevIdx], this.bottomTexts[this.prevIdx]], { yPercent: 100, duration: 0.8, force3D: true, ease: 'expo.inOut' })
		gsap.fromTo([this.topTexts[this.currIdx], this.bottomTexts[this.currIdx]], { yPercent: -100 }, { yPercent: 0, duration: 0.8, force3D: true, ease: 'expo.inOut' })
	}

	prevTexts() {
		gsap.to([this.topTexts[this.prevIdx], this.bottomTexts[this.prevIdx]], { yPercent: -100, duration: 0.8, force3D: true, ease: 'expo.inOut' })
		gsap.fromTo([this.topTexts[this.currIdx], this.bottomTexts[this.currIdx]], { yPercent: 100 }, { yPercent: 0, duration: 0.8, force3D: true, ease: 'expo.inOut' })
	}

	resize() {

	}
}

export class Marquees {

	constructor(pencilBar = false) {
		this.pencilBar = pencilBar;
		if (pencilBar) {
			this.marquees = document.querySelectorAll('.pencil-marquee');
		} else {
			this.marquees = document.querySelectorAll('.marquee:not(.prepped)');
		}

		this.init();

	}

	init() {
		this.getCache();
	}

	getCache(resize = false) {
		this.window2x = globalStorage.windowWidth * 2;

		for (let i = 0; i < this.marquees.length; i++) {
			let inner = this.marquees[i].querySelector('.inner'),
				copyEl = this.marquees[i].querySelector('[aria-hidden]'),
				mousePause = this.marquees[i].classList.contains('mouse-enter-pause'),
				enter = globalStorage.isMobile ? 'mouseenter' : 'touchstart',
				leave = globalStorage.isMobile ? 'mouseleave' : 'touchend',
				copyWidth = copyEl.offsetWidth,
				multiplier,
				resetElCount = 2;

			if (copyWidth > globalStorage.windowWidth) {
				multiplier = 1;
			} else {
				multiplier = Math.ceil((globalStorage.windowWidth * 2) / copyWidth);
				resetElCount = Math.ceil(globalStorage.windowWidth / copyWidth);
			}

			let tween = this.prepMarkup(this.marquees[i], inner, multiplier, copyEl, resetElCount);

			if (!this.pencilBar) {
				globalStorage.marqueeData.push({
					el: this.marquees[i],
					tween: tween,
					playing: false
				});
			} else {
				globalStorage.pencilMarquee = {
					el: this.marquees[i],
					tween: tween,
					playing: false
				}
			}
		}
	}

	prepMarkup(marquee, inner, multiplier, copyEl, resetElCount) {
		for (let i = 1; i < multiplier; i++){
			let elementCopy = copyEl.cloneNode(true);
			elementCopy.classList.add("duplicate");
			inner.appendChild(elementCopy);
		}
		this.duplicates = inner.querySelectorAll(".duplicate");

		let resetDist = marquee.querySelector(".group:nth-child("+resetElCount+")").getBoundingClientRect().left;

		let dur = globalStorage.windowWidth > 767 ? parseInt(inner.dataset.dur) : parseInt(inner.dataset.mobileDur);

		if (!dur) {
			dur = 25
		}

		let tween = gsap.fromTo(inner,{ x: 0 }, { duration: dur, repeat: -1, x: -resetDist, ease: "none", force3D: true }).pause();

		marquee.classList.add('prepped');

		return tween;
	}


	resize() {
		for (let i = 0; i < this.duplicates.length; i++) {
			this.duplicates[i].remove();
		}

		this.getCache(true);
	}
}

export const popoutMenu = () => {
	const popoutMenus = document.querySelectorAll(".popout-menu");

	for (let i = 0; i < popoutMenus.length; i++) {
		const menuWrapper = popoutMenus[i]
		const trigger = menuWrapper.querySelector('.popout-menu-label')
		const borderEl = menuWrapper.querySelector('.popout-menu-label-border')
		const initiallyHiddenEls = menuWrapper.querySelectorAll('.popout-menu-content, .menu-bg')
		const staggerEls = menuWrapper.querySelectorAll('.sort-buttons button')
		let isOpen = false;
		const tl = new gsap.timeline()


		gsap.set(staggerEls, { opacity: 0, y: 30 })
		gsap.set(initiallyHiddenEls, { opacity: 1, pointerEvents: 'none' })

		const close = () => {
			tl.clear()
			tl.progress(0)
			tl
				.set(initiallyHiddenEls[1], { pointerEvents: 'none' })
				.to(borderEl, { borderColor: '#1a1a1a', duration: 0.3, ease: 'ease.inOut' }, 0)
				.to(staggerEls, { duration: 0.1, opacity: 0, force3D: true, ease: "sine.inOut", onComplete: () => {
						gsap.set(staggerEls, { y: 30 })
					} }, 0)
		}

		const open = () => {
			tl.clear()
			tl.progress(0)
			tl
				.set(initiallyHiddenEls[1], { pointerEvents: 'all' })
				.to(borderEl, { borderColor: 'rgba(0,0,0,0)', duration: 0.15, ease: 'ease.out' }, 0)
				.to(staggerEls, { duration: .2, opacity: 1, stagger: 0.04, ease: "sine.inOut" }, 0.05)
				.to(staggerEls, { duration: 0.8, y: 0, stagger: 0.04, force3D: true, ease: "expo.out" }, 0)
		}

		// gsap.set(staggerEls, { autoAlpha: 0, y: -15 });
		// gsap.set(bgEl, { scaleY: 0.4, autoAlpha: 0 });

		if (globalStorage.isMobile) {
			trigger.addEventListener("click", () => {
				if (isOpen) {
					isOpen = false;
					close()
				} else {
					isOpen = true;
					open()
				}
			});
		} else {
			trigger.addEventListener("mouseenter", () => {
				if (isOpen) { return; }
				isOpen = true;
				open()
			});
			trigger.addEventListener("mousemove", (event) => {
				if (isOpen) { return; }
				isOpen = true;
				open()
			});
			menuWrapper.addEventListener("mouseleave", () => {
				if (!isOpen) { return; }
				isOpen = false;
				close()
			});
		}
	}
};

export const filtersMenu = () => {
	const trigger = document.getElementById("filtersTrigger");
	if(!trigger) { return }
	const menuOrig = document.getElementById("filterWrapper");
	const menu = menuOrig.cloneNode(true);
	domStorage.mainEl.insertBefore(menu, domStorage.routerWrapper);
	menuOrig.remove()
	const bg = menu.querySelector('.background')
	const closeBtn = menu.querySelector(".close-btn-wrapper");
	const productCountEl = menu.querySelector(".product-count-wrapper");
	const fadeItems = menu.querySelectorAll(".menu");
	const topBar = menu.querySelector(".top-bar");
	const innerEl = menu.querySelector(".inner");
	let isOpen = false;

	gsap.set([topBar, bg], { scaleX: .6, opacity: 0 });
	gsap.set(menu, { opacity: 1 });
	gsap.set(fadeItems, { opacity: 0, y: 30 });
	gsap.set([productCountEl, closeBtn], { opacity: 0, y: -25 });

	const tl = gsap.timeline()

	if (!trigger) {
		return;
	}

	const close = () => {
		tl.clear()
		tl.progress(0)
		trigger.classList.remove('trigger-active')
		tl
			.set(menu, { pointerEvents: 'none' })
			.to(fadeItems, { duration: .16, y: 15, opacity: 0, transformOrigin: 'center', force3D: true, ease: "sine.out", onComplete: () => {
				gsap.set(fadeItems, {y: 30})
				innerEl.scrollTop = 0
				} })
			.to([productCountEl, closeBtn], { duration: .16, y: -15, opacity: 0, transformOrigin: 'center', force3D: true, ease: "sine.out", onComplete: () => {
					gsap.set([productCountEl, closeBtn], {y: -25})
				} }, 0)
			.to(bg, { duration: .5, scaleX: .6, force3D: true, ease: "expo.inOut" }, 0)
			.to(bg, { duration: .33, opacity: 0, force3D: true, ease: "sine.inOut" }, 0)
			.to(topBar, { duration: .5, scaleX: 0.6, force3D: true, ease: "expo.inOut" }, 0)
			.to(topBar, { duration: .33, opacity: 0, force3D: true, ease: "sine.inOut" }, 0)
		if (globalStorage.windowWidth > 767) {
			tl
				.to(domStorage.globalBackdrop, { duration: 0.3, autoAlpha: 0, ease: "sine.inOut" }, 0.05);
		}
	}

	trigger.addEventListener("click", () => {
		if (isOpen) {
			isOpen = false;
			close()
		} else {
			isOpen = true;
			trigger.classList.add('trigger-active')
			tl.clear()
			tl.progress(0)
			tl
				.set(menu, { pointerEvents: 'all' })
				.to(bg, { duration: .7, scaleX: 1, force3D: true, ease: "expo.out" }, 0)
				.to(bg, { duration: .18, opacity: 1, force3D: true, ease: "sine.out" }, 0)
				.to(topBar, { duration: .7, pointerEvents: 'all', scaleX: 1, force3D: true, ease: "expo.out" }, 0)
				.to(topBar, { duration: .18, opacity: 1, force3D: true, ease: "sine.out" }, 0)
				.to(fadeItems, { duration: .7, opacity: 1, y: 0, stagger: 0.048, force3D: true, ease: "expo.out" }, 0.12)
				.to([productCountEl, closeBtn], { duration: .7, opacity: 1, y: 0, transformOrigin: 'center', force3D: true, ease: "expo.out" }, .12)
			if (globalStorage.windowWidth > 767) {
				tl
					.to(domStorage.globalBackdrop, { duration: 0.2, autoAlpha: 1, ease: "sine.out" }, 0)
			}
		}
	});

	closeBtn.addEventListener('click', () => {
		if (isOpen) {
			isOpen = false;
			close()
		}
	})

	domStorage.globalBackdrop.addEventListener('click', () => {
		if (isOpen) {
			isOpen = false;
			close()
		}
	})


	document.addEventListener('keyup', (event) => {
		const key = event.key;
		if ((key === 'Escape' || key === 'Esc') && isOpen) {
			isOpen = false;
			close()
		}
	});
};

export const bindFavHearts = () => {
	const hearts = document.querySelectorAll('.fav-heart');
	if(!hearts) { return }

	for (let i = 0; i < hearts.length; i++) {
		const heart = hearts[i];
		let isGreen = false;
		heart.addEventListener("click", (e) => {
			if(isGreen) {
				isGreen = false;
				heart.classList.remove('filled')
			} else {
				isGreen = true;
				heart.classList.add('filled')
			}
			e.preventDefault();
			e.stopPropagation();
		})
	}
}


export const slugTabs = () => {
	const wrapperEl = document.querySelector('.slug-tabs')
	if(!wrapperEl) { return; }
	const triggers = wrapperEl.querySelectorAll('.tab-trigger');
	const fadeEls = wrapperEl.querySelectorAll('.drawer')
	const filtersTrigger = triggers[0].dataset.slug;

	for (let i = 0; i < fadeEls.length; i++) {
		gsap.set(fadeEls[i], { position: "absolute", autoAlpha: 0 });
		if(fadeEls[i].classList.contains(filtersTrigger)) {
			gsap.set(fadeEls[i], { position: "relative", autoAlpha: 1 });
		}
	}

	for (let i = 0; i < triggers.length; i++) {
		const el = triggers[i];
		const slug = el.dataset.slug;
		let animating = false;
		el.addEventListener('click', () => {
			if (el.classList.contains('active') || animating) { return; }
			animating = true;
			wrapperEl.querySelector('.tab-trigger.active').classList.remove('active');
			gsap.delayedCall(.19, () => { animating = false; });
			el.classList.add('active');
			const thisClass = `.drawer.${slug}`;
			const theseEls = wrapperEl.querySelectorAll(thisClass);
			gsap.to(fadeEls, { autoAlpha: 0, ease: "sine.inOut", duration: 0.2, onComplete: () => {
					gsap.set(fadeEls, { position: "absolute" });
					gsap.set(theseEls, { position: "relative" });
					gsap.to(theseEls, { autoAlpha: 1, ease: "sine.inOut", duration: 0.25 } );
				}
			});
		});
	}
}

export const prepModals = (modalTrigger) => {

	for (let i = 0; i < modalTrigger.length; i++) {
		const modalName = modalTrigger[i].dataset.modal;
		const modal = document.querySelector('.modal[data-modal="'+ modalName +'"]');
		if (!modal) {return}
		const modalWrapper = modal.parentElement;
		const closeTrigger = modal.querySelector('.close-modal');
		const fadeEls = modal.querySelectorAll(".fade-el");
		const bg = modal.querySelector(".modal-backdrop");
		const timeline = new gsap.timeline();

		gsap.set(modalWrapper, { opacity: 0 });
		gsap.set(bg, { scale: 0.8, opacity: 0, force3D: true });
		gsap.set(modal, { autoAlpha: 0, position: 'absolute' });
		gsap.set(fadeEls, { opacity: 0 });

		modalTrigger[i].addEventListener('click', () => {
			timeline.clear()
			timeline
				.to(modalWrapper, { duration: 0.2, autoAlpha: 1, ease: "sine.out", force3D: true })
				.to(modal, { autoAlpha: 1, position: 'relative', ease: "sine.inOut", duration: 0.2, force3D: true }, 0.12)
				.to(bg, { duration: .65, scale: 1, force3D: true, ease: "expo.out" }, 0)
				.to(bg, { duration: .135, opacity: 1, force3D: true, ease: "sine.out" }, 0)
				.to(fadeEls, { duration: .15, opacity: 1, force3D: true, ease: "sine.inOut" }, 0.2);
		});

		modal.addEventListener('click', (e) => {
			e.stopPropagation()
		});

		closeTrigger.addEventListener('click', () => {
			closeThisModal()
		});

		modalWrapper.addEventListener('click', () => {
			closeThisModal()
		});

		document.addEventListener('keyup', (event) => {
			let key = event.key;
			if (key === 'Escape' || key === 'Esc') {
				closeThisModal()
			}
		});

		const closeThisModal = () => {
			timeline.clear()
			timeline.progress(0)
			timeline
				.to(fadeEls, { duration: .16, opacity: 0, force3D: true, ease: "sine.out" })
				.to(modalWrapper, { duration: 0.3, autoAlpha: 0, ease: "sine.inOut", force3D: true }, 0.05)
				.to(modal, { autoAlpha: 0, position: 'absolute', ease: "sine.inOut", duration: 0.2, force3D: true }, 0.12)
				.to(bg, { duration: .5, scale: .8, force3D: true, ease: "expo.inOut" }, 0)
				.to(bg, { duration: .33, opacity: 0, force3D: true, ease: "sine.inOut" }, 0);
		}
	}
};
