import { gsap } from "gsap";
import {domStorage, globalStorage} from "../_global/storage";
import {prefetchedArr} from "../_global/_renderer";
import {Prefetch} from "../_global/helpers";

export class MegaNav {
	// constructor() {
	// 	this.backdrop = domStorage.globalBackdrop;
	// 	this.trigger = document.getElementById("mega-nav-trigger");
	// 	this.otherNavItems = domStorage.header.querySelectorAll(".close-menu");
	// 	this.megaNav = document.getElementById("mega-nav")
	// 	this.megaNavOuter = this.megaNav.querySelector(".wrapper")
	// 	this.plusCross = this.trigger.querySelector("span")
	// 	this.megaNavInner = this.megaNav.querySelector(".inner")
	// 	this.imageWrapper = this.megaNav.querySelector(".image-wrapper .scale-inner")
	// 	this.fadeElsOne = this.megaNav.querySelectorAll(".link-column:nth-child(1) .title, .link-column:nth-child(1) a")
	// 	this.fadeElsTwo = this.megaNav.querySelectorAll(".link-column:nth-child(2) .title, .link-column:nth-child(2) a")
	// 	this.fadeElsThree = this.megaNav.querySelectorAll(".link-column:nth-child(3) .title, .link-column:nth-child(3) a")
	// 	this.fadeElsFour = this.megaNav.querySelectorAll(".link-column:nth-child(4) .title, .link-column:nth-child(4) a")
	// 	this.pretechEls = this.megaNav.querySelectorAll('.prefetch-open')
	// 	this.prefetchArr = [];
	// 	for (let i = 0; i < this.pretechEls.length; i++) {
	// 		const el = this.pretechEls[i]
	// 		el.classList.add('fetched')
	// 		if (el.href === window.location.href) {
	// 			if (!prefetchedArr.includes(el.href)) {
	// 				prefetchedArr.push(el.href)
	// 			}
	// 		} else if (!prefetchedArr.includes(el.href)) {
	// 			prefetchedArr.push(el.href)
	// 			this.prefetchArr.push(el.href)
	// 		}
	// 	}
	// 	this.isOpen = false;
	// 	this.linksPrefetched = false
	// 	this.timeline = new gsap.timeline();
	// 	this.bindListeners();
	// 	gsap.set(this.megaNav, { autoAlpha: 1 });
	// 	gsap.set(this.megaNavOuter, { yPercent: -100.5 });
	// 	gsap.set(this.megaNavInner, { yPercent: 100.5 })
	// 	gsap.set([this.fadeElsOne, this.fadeElsTwo, this.fadeElsThree, this.fadeElsFour], { opacity: 0, y: 30 })
	// 	gsap.set(this.imageWrapper, { scale: 1.15 })

	// }

	// bindListeners() {
	// 	if (globalStorage.isMobile) {
	// 		this.trigger.addEventListener("click", () => {
	// 			if (this.isOpen) {
	// 				this.close();
	// 			} else {
	// 				this.open();
	// 			}
	// 		});
	// 	} else {
	// 		const subMenuLinks = this.megaNav.querySelectorAll(".sub-menu-link")
	// 		for (let i = 0; i < subMenuLinks; i++) {
	// 			subMenuLinks[i].addEventListener("click", () => {
	// 				for (let i = 0; i < domStorage.headerLinks.length; i++) {
	// 					if (domStorage.headerLinks[i].classList.contains("router-link-active")) {
	// 						domStorage.headerLinks[i].classList.remove("router-link-active")
	// 					}
	// 				}
	// 			})
	// 		}
	// 		for (let i = 0; i < this.otherNavItems.length; i++) {
	// 			const trigger = this.otherNavItems[i];
	// 			trigger.addEventListener("mouseenter", () => {
	// 				if (this.isOpen) {
	// 					this.close();
	// 				}
	// 			});
	// 			trigger.addEventListener("click", () => {
	// 				for (let i = 0; i < domStorage.headerLinks.length; i++) {
	// 					if (domStorage.headerLinks[i].classList.contains("router-link-active")) {
	// 						domStorage.headerLinks[i].classList.remove("router-link-active")
	// 					}
	// 				}
	// 				trigger.classList.add("router-link-active")
	// 			})
	// 		}
	// 		document.addEventListener("click", (e) => {
	// 			if (this.isOpen) {
	// 				if (!e.target.closest("#mega-nav-trigger") && !e.target.closest("#mega-nav")) {
	// 					this.close();
	// 				}
	// 			}
	// 		});

	// 		this.trigger.addEventListener("mousemove", () => {
	// 			if (!this.isOpen) {
	// 				this.trigger.classList.add("is-active");
	// 				this.open();
	// 			}
	// 		});

	// 		this.trigger.addEventListener("mouseenter", () => {
	// 			if (!this.isOpen) {
	// 				this.trigger.classList.add("is-active");
	// 				this.open();
	// 			}
	// 		});
	// 	}

	// 	document.addEventListener('keyup', (event) => {
	// 		const key = event.key;
	// 		if (key === 'Escape' || key === 'Esc') {
	// 			this.close();
	// 		}
	// 	});

	// 	this.backdrop.addEventListener("click", (e) => {
	// 		if (this.isOpen) {
	// 			this.close();
	// 		}
	// 	});
	// }

	// open() {
	// 	if (this.isOpen) { return; }
	// 	this.isOpen = true;
	// 	this.timeline.clear();

	// 	if (!this.linksPrefetched) {
	// 		if ('requestIdleCallback' in window) {
	// 			window.requestIdleCallback(() => { new Prefetch(this.prefetchArr) }, { timeout: 1000 });
	// 		} else {
	// 			new Prefetch(this.prefetchArr)
	// 		}
	// 		this.linksPrefetched = true
	// 	}

	// 	this.timeline
	// 		.set(this.megaNav, { pointerEvents: "all" })

	// 		.to(this.megaNavOuter, { duration: 1, ease: 'expo.out', yPercent: 0, force3D: true }, 0)
	// 		.to(this.megaNavInner, { duration: 1, ease: 'expo.out', yPercent: 0, force3D: true }, 0)
	// 		.to(this.fadeElsOne, { duration: 0.8, ease: 'expo.out', stagger: 0.045, y: 0, force3D: true }, 0)
	// 		.to(this.fadeElsOne, { autoAlpha: 1, duration: 0.15, ease: 'sine.inOut', stagger: 0.045 }, 0.02)
	// 		.to(this.fadeElsTwo, { duration: 0.8, ease: 'expo.out', stagger: 0.045, y: 0, force3D: true }, 0.045)
	// 		.to(this.fadeElsTwo, { autoAlpha: 1, duration: 0.15, ease: 'sine.inOut', stagger: 0.045 }, 0.047)
	// 		.to(this.fadeElsThree, { duration: 0.8, ease: 'expo.out', stagger: 0.045, y: 0, force3D: true }, 0.09)
	// 		.to(this.fadeElsThree, { autoAlpha: 1, duration: 0.15, ease: 'sine.inOut', stagger: 0.045 }, 0.092)
	// 		.to(this.fadeElsFour, { duration: 0.8, ease: 'expo.out', stagger: 0.045, y: 0, force3D: true }, 0.135)
	// 		.to(this.fadeElsFour, { autoAlpha: 1, duration: 0.15, ease: 'sine.inOut', stagger: 0.045 }, 0.137)
	// 		.to(this.backdrop, { duration: 0.22, autoAlpha: 1, force3D: true, ease: "sine.out" }, 0)
	// 		.to(this.imageWrapper, { duration: 1, ease: 'expo.out', scale: 1, force3D: true }, 0)
	// 		.to(this.plusCross, { duration: 0.8, ease: 'expo.out', rotation: 225, force3D: true }, 0) 

	// }

	// close(instant = false) {
	// 	if (!this.isOpen) { return; }
	// 	this.trigger.classList.remove("is-active");
	// 	this.isOpen = false;
	// 	this.timeline.clear();

	// 	this.timeline
	// 		.set(this.megaNav, { pointerEvents: "none" })
	// 		.to([this.fadeElsOne, this.fadeElsTwo, this.fadeElsThree, this.fadeElsFour], { autoAlpha: 0, duration: 0.5, ease: 'power3.out', y: 10, onComplete: () => {
	// 			gsap.set([this.fadeElsOne, this.fadeElsTwo, this.fadeElsThree, this.fadeElsFour], { y: 30 })
	// 			} })
	// 		.to(this.megaNavInner, { duration: 0.7, ease: 'expo.out', yPercent: 100.5, force3D: true }, 0)
	// 		.to(this.megaNavOuter, { duration: 0.7, ease: 'expo.out', yPercent: -100.5, force3D: true }, 0)
	// 		.to(this.imageWrapper, { duration: 0.7, ease: 'expo.out', scale: 1.15, force3D: true }, 0)
	// 		.to(this.backdrop, { duration: 0.25, autoAlpha: 0, force3D: true, ease: "sine.out" }, 0)
	// 		.to(this.plusCross, { duration: 0.8, ease: 'expo.out', rotation: 0, force3D: true }, 0)
	// }

	// resize() {
	// 	//
	// }
}
