import { gsap } from "gsap";
import { globalStorage, domStorage } from "../_global/storage";
import {$megaNav, ImageLoad, $searchModal, prefetchedArr} from "../_global/_renderer";
import {Prefetch} from "../_global/helpers";
import { SplitText } from "../_extensions/splitText";
gsap.registerPlugin(SplitText);

export class ScrollBasedAnims {
	constructor(options = {}) {

		this.bindMethods();
		this.el = document.documentElement;

		this.thisPagesTLs = [];
		this.offsetVal = 0;
		this.body = document.body;
		this.direction = 'untouched';
		this.transitioning = false;
		this.headerScrolled = false;
		this.headerHidden = false;


		const {
			dataFromElems = document.querySelectorAll('[data-from]'),
			dataHeroFromElems = document.querySelectorAll('[data-h-from]'),
			heroMeasureEl = document.getElementById('hero-measure-el'),
			scrollBasedElems = document.querySelectorAll('[data-entrance]'),
			threshold = 0.01,
			footerMeasureEl = document.getElementById('footer-measure-el'),
		} = options;

		this.dom = {
			el: this.el,
			dataFromElems: dataFromElems,
			dataHeroFromElems: dataHeroFromElems,
			scrollBasedElems: scrollBasedElems,
			heroMeasureEl: heroMeasureEl,
			footerMeasureEl: footerMeasureEl
		};

		this.dataFromElems = null;
		this.dataHeroFromElems = null;
		this.scrollBasedElems = null;

		this.raf = null;

		this.state = {
			resizing: false
		};

		let startingScrollTop = this.el.scrollTop;
		this.data = {
			threshold: threshold,
			current: startingScrollTop,
			target: 0,
			last: startingScrollTop,
			ease: 0.12,
			height: 0,
			max: 0,
			scrollY: startingScrollTop,
			window2x: globalStorage.windowHeight * 2
		};

		let length = this.dom.scrollBasedElems.length;
		for (let i = 0; i < length; i++) {
			const entranceEl = this.dom.scrollBasedElems[i];
			const entranceType = entranceEl.dataset.entrance;
			const entranceTL = new gsap.timeline({ paused: true });
			let staggerEls;
			switch (entranceType) {
				case "split-copy":
					this.thisPagesTLs.push("split-copy");
					break;

				case "stagger-fade":
					staggerEls = entranceEl.querySelectorAll('.s-el');
					let delay = 0;

					entranceTL
						.fromTo(staggerEls, 0.5, { y: 40 }, { stagger: 0.07, y: 0, ease: "sine.out", force3D: true })
						.fromTo(staggerEls, 0.48, { opacity: 0 }, { stagger: 0.07, clearProps: "transform", opacity: 1, ease: "sine.out", force3D: true }, 0.02);

					this.thisPagesTLs.push(entranceTL);
					break;

				case "slide-enter":
					const slideEls = entranceEl.querySelectorAll('.swiper-slide');
					const slideEnterFadeEls = entranceEl.querySelectorAll('.fade-el');
					entranceTL
						.fromTo(slideEls, { x: 150 }, { duration: 1.6, ease: 'expo.out', stagger: 0.08, x: 0 })
						.fromTo(slideEls, { opacity: 0 }, { duration: .25, stagger: 0.08, opacity: 1, ease: "sine.out", force3D: true }, 0.1);

					if (slideEnterFadeEls.length > 0) {
						entranceTL
							.fromTo(slideEnterFadeEls, 0.5, { y: 22 }, { y: 0, ease: "sine.out", force3D: true }, 0.35)
							.fromTo(slideEnterFadeEls, 0.48, { opacity: 0 }, { opacity: 1, clearProps: "transform", ease: "sine.out", force3D: true }, 0.37);
					}

					this.thisPagesTLs.push(entranceTL);
					break;

				case "basic-fade":
					entranceTL
						.fromTo(entranceEl, 0.5, { y: 22 }, { y: 0, ease: "sine.out", force3D: true })
						.fromTo(entranceEl, 0.48, { opacity: 0 }, { opacity: 1, clearProps: "transform", ease: "sine.out", force3D: true }, 0.02);

					this.thisPagesTLs.push(entranceTL);
					break;

				case "image-clip":
					const clipOuter = entranceEl.querySelectorAll(".clip-outer");
					const clipInner = entranceEl.querySelectorAll(".clip-inner");
					const image = entranceEl.querySelectorAll("img");
					entranceTL
						.fromTo(clipOuter, { yPercent: 100 }, { yPercent: 0, duration: 1.2, ease: "expo.out", force3D: true })
						.fromTo(clipInner, { yPercent: -100 }, { yPercent: 0, duration: 1.2, ease: "expo.out", force3D: true }, 0)
						.fromTo(image, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: "sine.inOut", force3D: true }, 0)
						.fromTo(image, { scale: 1.3 }, { transformOrigin: "50% 70%", scale: 1, duration: 1.2, ease: "expo.out", force3D: true }, 0.05)
					gsap.set(clipOuter, { opacity: 1 })
					entranceEl.addEventListener('click', () => {
						entranceTL.progress(0)
					})
					this.thisPagesTLs.push(entranceTL);
					break;

				case "product-card":
					const cardClipOuter = entranceEl.querySelectorAll(".clip-outer");
					const cardClipInner = entranceEl.querySelectorAll(".clip-inner");
					const cardImage = entranceEl.querySelectorAll("img");
					const cardText = entranceEl.querySelectorAll(".bottom");
					entranceTL
						.fromTo(cardClipOuter, { yPercent: 100 }, { yPercent: 0, duration: 1.2, ease: "expo.out", force3D: true })
						.fromTo(cardClipInner, { yPercent: -100 }, { yPercent: 0, duration: 1.2, ease: "expo.out", force3D: true }, 0)
						.fromTo(cardImage, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: "sine.inOut", force3D: true }, 0)
						.fromTo(cardImage, { scale: 1.3 }, { transformOrigin: "50% 70%", scale: 1, duration: 1.2, ease: "expo.out", force3D: true }, 0.05)
						.fromTo(cardText, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "sine.inOut", force3D: true }, 0.3)

					gsap.set(cardClipOuter, { opacity: 1 })
					entranceEl.addEventListener('click', () => {
						entranceTL.progress(0)
					})
					this.thisPagesTLs.push(entranceTL);
					break;
				case "image-clip-stagger":
					const bars = entranceEl.querySelectorAll(".bar");
					entranceTL
						.fromTo(bars, { xPercent: -100 }, { xPercent: 0, duration: 0.7, clearProps: "transform", stagger: 0.07, ease: "expo.inOut", force3D: true });

					this.thisPagesTLs.push(entranceTL);
					break;
				default:


			}
		}

		this.init();
	}

	bindMethods() {
		['run', 'event', 'resize']
			.forEach(fn => this[fn] = this[fn].bind(this));
	}

	init() {
		this.on();
	}

	on() {
		this.getBounding();
		this.getCache();
		this.requestAnimationFrame();
	}

	event() {
		this.data.scrolling = true
		clearTimeout(this.scrollTimeout)
		this.scrollTimeout = setTimeout(() => {
			this.data.scrolling = false;
		}, 300)
	}

	run() {
		if (this.state.resizing || this.transitioning) return;
		this.data.scrollY = this.el.scrollTop;

		if (globalStorage.isMobile) {
			this.data.current = this.data.scrollY;
		} else {
			this.data.current += Math.round((this.data.scrollY - this.data.current) * this.data.ease);
		}
		this.getDirection();
		if (globalStorage.namespace !== '404') {
			this.hideShowHeader()
		}
		this.data.last = this.data.current;
		this.checkScrollBasedLoadins();
		this.animateDataHeroFromElems();
		this.animateFooterReveal();
		this.animateDataFromElems();
		this.playPauseMarquees();
		this.checkScrolledMedia();
		this.checkPrefetchLinks();
		this.playPauseVideos();

		this.requestAnimationFrame();
	}

	animateFooterReveal() {
		if (this.direction === "untouched" || !this.footerMeasureData) return;
		const { isVisible, start, end } = ( this.isVisible(this.footerMeasureData, 0.01) );
		if (!isVisible && !this.footerMeasureData.reversed) {
			this.footerRevealTL.progress(0);
			this.footerMeasureData.reversed = true
			return;
		}
		let percentageThrough = ((((start).toFixed(2) / this.data.height).toFixed(3) - 1) * -1) * this.footerMeasureData.duration;
		if (percentageThrough <= 0) {
			percentageThrough = 0;
		} else if (percentageThrough >= .98) {
			percentageThrough = 1;
		}

		this.footerRevealTL.progress(percentageThrough);
	}


	hideShowHeader(force = false) {
		if ((this.direction === "untouched" && !force)) { return }
		if (force) { this.direction = 'down'; }
		if (this.direction === "down" && !this.headerScrolled && this.data.scrollY >= 80) {
			this.headerScrolled = true;
			if (globalStorage.pencilMarquee) {
				globalStorage.pencilMarquee.tween.pause();
			}
			gsap.to(domStorage.header, { y: globalStorage.windowWidth > 767 ? -40 : -26, opacity: 0, ease: 'sine.out', duration: 0.2, force3D: true });
		} else if (this.direction === "up" && this.headerScrolled) {
			this.headerScrolled = false;
			if (globalStorage.pencilMarquee) {
				globalStorage.pencilMarquee.tween.play();
			}
			gsap.to(domStorage.header, { y: 0, opacity: 1, duration: 0.2, force3D: true, ease: "sine.out" });
		}

		// if (this.direction === "down" && !this.headerHidden && this.data.scrollY >= this.footerTop) {
		// 	this.headerHidden = true
		// 	gsap.to(domStorage.header, { y: globalStorage.windowWidth > 767 ? -80 : -52, opacity: 0, pointerEvents: 'none', ease: 'sine.out', duration: 0.25, force3D: true });
		// } else if (this.direction === "up" && this.headerHidden && this.data.scrollY < this.footerTop) {
		// 	this.headerHidden = false
		// 	gsap.to(domStorage.header, { y: globalStorage.windowWidth > 767 ? -40 : -26, opacity: 1, pointerEvents: 'all', ease: 'sine.out', duration: 0.25, force3D: true });
		// }

	}

	getMarqueeData() {
		if (globalStorage.marqueeData.length < 1) { return }

		this.marqueeBounds = [];

		for (let i = 0; i < globalStorage.marqueeData.length; i++) {
			let data = globalStorage.marqueeData[i];
			let bounds = data.el.getBoundingClientRect();

			this.marqueeBounds.push({
				top: (bounds.top + this.data.scrollY),
				bottom: (bounds.bottom + this.data.scrollY),
				height: (bounds.bottom - bounds.top)
			});

		}

	}

	playPauseMarquees(force = false) {

		if ((this.direction === "untouched" && force === false) || !this.marqueeBounds) return;
		for (let i = 0; i < this.marqueeBounds.length; i++) {
			let marqueeBounds = this.marqueeBounds[i],
				marqueeData = globalStorage.marqueeData[i];
			let check = (i === 0);
			let { isVisible } = this.isVisible(marqueeBounds, 200, check);

			if (isVisible && this.data.current >= 0) {
				if (!marqueeData.playing) {
					marqueeData.tween.play();
					marqueeData.playing = true;
				}
			} else if ((!isVisible || this.data.current === 0) && marqueeData.playing) {
				marqueeData.tween.pause();
				marqueeData.playing = false;
			}
		}
	}

	getDirection() {
		if (this.data.last - this.data.scrollY < 0) {

			// DOWN
			if (this.direction === 'down' || this.data.scrollY <= 0) { return }
			this.direction = 'down';

		} else if (this.data.last - this.data.scrollY > 0) {

			// UP
			if (this.direction === 'up') { return }
			this.direction = 'up';

		}
	}

	getScrolledMedia() {
		this.data.scrolledMediaCount = 0;
		this.data.scrolledMediaFired = 0;
		this.dom.scrolledMedia = document.querySelectorAll('.mw');

		if (!this.dom.scrolledMedia) return;
		this.scrolledMediaData = [];
		for (let i = 0; i < this.dom.scrolledMedia.length; i++) {
			const el = this.dom.scrolledMedia[i];

			const bounds = el.getBoundingClientRect();

			this.data.scrolledMediaCount++;
			this.scrolledMediaData.push({
				el: el,
				mediaEls: el.querySelectorAll('.preload'),
				loaded: false,
				top: (bounds.top + this.data.scrollY),
				bottom: (bounds.bottom + this.data.scrollY),
				height: (bounds.bottom - bounds.top)
			});

		}
	}

	checkScrolledMedia(force = false) {
		if ((this.direction === "untouched" && !force) || !this.scrolledMediaData || this.data.scrolledMediaFired === this.data.scrolledMediaCount) { return; }
		let ii = 0
		for (let i = 0; i < this.scrolledMediaData.length; i++) {
			let data = this.scrolledMediaData[i];

			if (data.loaded) { continue; }

			if ((this.data.scrollY + this.data.window2x) > data.top) {
				data.el.classList.remove('mw');
				ImageLoad.loadImages(data.mediaEls, "nodeList", () => {
					//
				});
				this.data.scrolledMediaFired++;
				data.loaded = true;
			}
		}
	}

	playPauseVideos(force = false) {
		if ((this.direction === "untouched" && !force) || this.videosDataLength === 0) return;
		for (let i = 0; i < this.videosDataLength; i++) {
			let data = this.videosData[i];
			let { isVisible } = this.isVisible(data, 50)
			if (isVisible) {
				if (!data.playing) {
					data.el.play();
					data.playing = true;
				}
			} else if (!isVisible && data.playing) {
				data.el.pause();
				data.el.currentTime = 0;
				data.playing = false;
			}
		}
	}

	getVideos() {
		let playPauseVideos = document.querySelectorAll('video.auto');
		this.videosData = [];

		for (let i = 0; i < playPauseVideos.length; i++) {
			let bounds = playPauseVideos[i].getBoundingClientRect()
			this.videosData.push({
				el: playPauseVideos[i],
				playing: false,
				top: (bounds.top + this.data.scrollY),
				bottom: (bounds.bottom + this.data.scrollY),
			});
		}
		this.videosDataLength = this.videosData.length;
	}

	getScrollBasedSections() {
		if (!this.dom.scrollBasedElems) return;
		this.scrollBasedElems = []
		let length = this.dom.scrollBasedElems.length;

		for (let i = 0; i < length; i++) {
			if (i < this.offsetVal) { continue; }
			let el = this.dom.scrollBasedElems[i];
			const bounds = el.getBoundingClientRect();
			this.scrollBasedElems.push({
				el: el,
				played: false,
				top: (bounds.top + this.data.scrollY),
				bottom: (bounds.bottom + this.data.scrollY),
				height: (bounds.bottom - bounds.top),
				offset: globalStorage.windowWidth < 768 ? (el.dataset.offsetMobile * globalStorage.windowHeight) : (el.dataset.offset * globalStorage.windowHeight),
				splits: [],
				splitPrepped: false,
				splitReset: false
			});
		}

	}

	getDataFromElems() {
		if (!this.dom.dataFromElems) return;

		this.dataFromElems = [];

		let useMobile = globalStorage.windowWidth < 768;

		let length = this.dom.dataFromElems.length
		for (let i = 0; i < length; i++) {
			let el = this.dom.dataFromElems[i]

			let from, to, dur;
			const bounds = el.getBoundingClientRect()
			const tl = new gsap.timeline({ paused: true })

			if (useMobile) {
				from = el.dataset.mobileFrom ? JSON.parse(el.dataset.mobileFrom) : JSON.parse(el.dataset.from);
				to = el.dataset.mobileTo ? JSON.parse(el.dataset.mobileTo) : JSON.parse(el.dataset.to);
				if (el.dataset.mobileDur) {
					dur = el.dataset.mobileDur;
				} else {
					dur = el.dataset.dur ? el.dataset.dur : 1;
				}
			} else {
				from = JSON.parse(el.dataset.from);
				to = JSON.parse(el.dataset.to);
				dur = el.dataset.dur ? el.dataset.dur : 1;
			}

			to.force3D = true;

			tl.fromTo(el, 1, from, to)

			this.dataFromElems.push({
				el: el,
				tl: tl,
				top: bounds.top + this.data.scrollY + (el.dataset.delay ? globalStorage.windowHeight * parseFloat(el.dataset.delay) : 0),
				bottom: (bounds.bottom + this.data.scrollY) + (el.dataset.delay ? globalStorage.windowHeight * parseFloat(el.dataset.delay) : 0),
				height: bounds.bottom - bounds.top,
				from: from,
				duration: dur,
				progress: {
					current: 0
				}
			});
		}

	}

	getHeroMeasureEl() {
		if (!this.dom.heroMeasureEl) return;
		const el = this.dom.heroMeasureEl;
		const bounds = el.getBoundingClientRect();

		let heroMedia = document.querySelectorAll("#hero-scene img");

		const timeline = new gsap.timeline({ paused: true });
		timeline
			.fromTo(heroMedia[0], { y: 0 }, { y: 50, ease: "none" })
			.fromTo(heroMedia[1], { y: 0, scale: 1, z: 0 }, { transformOrigin: "50% 20%", z: 80, y: -35, scale: 1.03, ease: "none" }, 0)
			.fromTo(heroMedia[2], { scale: 1, z: 0 }, { transformOrigin: "50% 80%", z: 81, scale: 1.05, ease: "none" }, 0)

		this.heroMeasureData = {
			tl: timeline,
			top: (bounds.top + this.data.scrollY),
			bottom: (bounds.bottom + this.data.scrollY),
			height: bounds.bottom - bounds.top,
			progress: {
				current: 0
			}
		};
	}

	getDataHeroFromElems() {
		if (!this.dom.dataHeroFromElems) return;

		this.dataHeroFromElems = [];
		const useMobile = globalStorage.windowWidth < 768;
		for (let i = 0; i < this.dom.dataHeroFromElems.length; i++) {
			let el = this.dom.dataHeroFromElems[i]
			let from, to;
			const tl = new gsap.timeline({ paused: true });

			if (useMobile) {
				from = el.dataset.hMobileFrom ? JSON.parse(el.dataset.hMobileFrom) : JSON.parse(el.dataset.hFrom);
				to = el.dataset.mobileTo ? JSON.parse(el.dataset.mobileTo) : JSON.parse(el.dataset.to);
			} else {
				from = JSON.parse(el.dataset.hFrom);
				to = JSON.parse(el.dataset.to);
			}

			tl.fromTo(el, 1, from, to);

			this.dataHeroFromElems.push({
				el: el,
				tl: tl,
				progress: {
					current: 0
				}
			})
		}
	}

	animateDataHeroFromElems() {
		if (this.direction === "untouched" || !this.heroMeasureData) return;
		const { isVisible } = this.isVisible(this.heroMeasureData, 100);
		if (!isVisible) return;
		let percentageThrough = parseFloat((this.data.current / this.heroMeasureData.height).toFixed(3));

		if (percentageThrough <= .007) {
			percentageThrough = 0;
		} else if (percentageThrough >= 1) {
			percentageThrough = 1;
		}

		this.heroMeasureData.tl.progress(percentageThrough);
	}

	animateDataFromElems() {
		if (this.direction === "untouched" || !this.dataFromElems) return

		let length = this.dataFromElems.length;
		for (let i = 0; i < length; i++) {
			let data = this.dataFromElems[i]

			const { isVisible, start, end } = this.isVisible(data, 100);

			if (isVisible) {

				this.intersectRatio(data, start, end)

				data.tl.progress(data.progress.current)
			}
		}
	}

	checkScrollBasedLoadins(force = false) {
		if ((this.direction === "untouched" && !force) || !this.scrollBasedElems) { return }
		if (this.thisPagesTLs.length !== this.offsetVal) {
			let length = this.scrollBasedElems.length;
			for (let i = 0; i < length; i++) {
				let data = this.scrollBasedElems[i];
				if (data.splitPrepped) {
					if ((this.data.scrollY > (data.bottom + 50)) && data.played && !data.splitReset) {
						data.splitReset = true;
						data.splits[0][0].revert();
						data.splits[0][1].revert();
					}
				}

				if (this.thisPagesTLs.length !== this.offsetVal) {
					if (data.played) { continue; }
					if ((this.thisPagesTLs[i] === "split-copy" || this.thisPagesTLs[i] === "split-copy-two") && !data.splitPrepped) {
						if ((this.data.scrollY + data.offset + globalStorage.windowHeight) > data.top) {
							data.splitPrepped = true;
							let splitEls = this.thisPagesTLs[i] === "split-copy-two" ? this.dom.scrollBasedElems[i].querySelectorAll(".split-el-two") : this.dom.scrollBasedElems[i].querySelectorAll(".split-el");
							let staggerEls = this.thisPagesTLs[i] === "split-copy-two" ? this.dom.scrollBasedElems[i].querySelectorAll(".sse-two") : this.dom.scrollBasedElems[i].querySelectorAll(".sse");
							let splitLinesArr = [];

							for (let j = 0; j < splitEls.length; j++) {
								const el = splitEls[j];
								const splitLines = new SplitText(el, { type: "lines" });
								const splitLinesTwo = new SplitText(splitLines.lines, { type: "lines" });

								splitLinesArr.push(splitLinesTwo.lines);
								data.splits.push([splitLines, splitLinesTwo]);
							}

							let entranceTL = new gsap.timeline({ paused: true });

							gsap.set(this.dom.scrollBasedElems[i], { opacity: 1 });
							entranceTL.fromTo(splitLinesArr, { yPercent: 103 }, { yPercent: 0, stagger: .1, force3D: true, duration: .55, ease: "Power3.out" })
								.add("stagger", "-=.9")
								.add("staggerOpacity", "-=0.88")
								.fromTo(staggerEls, { y: 22 }, { duration: 0.5, stagger: 0.04, y: 0, ease: "sine.out", force3D: true }, "stagger")
								.fromTo(staggerEls, { opacity: 0 }, { duration: 0.48, stagger: 0.04, clearProps: "transform", opacity: 1, ease: "sine.out", force3D: true }, "staggerOpacity");
							this.thisPagesTLs[i] = entranceTL;
						}
					}
					if ((this.data.scrollY + data.offset) > data.top) {
						this.thisPagesTLs[i].play();
						this.offsetVal++;
						data.played = true;
					}
				} else { // footer idx
					let data = this.scrollBasedElems[this.scrollBasedElems.length - 1];
					if ((this.data.current + data.offset) > data.top) {
						if (!data.played) {
							this.thisPagesTLs[this.offsetVal - 1].play();
							data.played = true;
						}

					} else {
						if (data.played) {
							this.thisPagesTLs[this.offsetVal - 1].progress(0).pause();
							data.played = false;
						}
					}
				}
			}
		}
	}

	intersectRatio(data, top, bottom) {
		const start = top - this.data.height;

		if (start > 0) { return; }
		const end = (this.data.height + bottom + data.height) * data.duration;
		data.progress.current = Math.abs(start / end);
		data.progress.current = Math.max(0, Math.min(1, data.progress.current));
	}

	isVisible(bounds, offset) {
		const threshold = !offset ? this.data.threshold : offset;
		const startStrict = bounds.top - this.data.current;
		const start = bounds.top - this.data.current;
		const endStrict = bounds.bottom - this.data.current;
		const end = bounds.bottom - this.data.current;
		const isVisible = startStrict < (threshold + this.data.height) && endStrict > -threshold;
		return {
			isVisible,
			start,
			end
		};
	}


	requestAnimationFrame() {
		this.raf = requestAnimationFrame(this.run);
	}

	cancelAnimationFrame() {
		cancelAnimationFrame(this.raf);
	}

	getCache() {
		this.data.scrollY = this.el.scrollTop;
		this.footerTop = (domStorage.footer.getBoundingClientRect().top + this.data.scrollY) - (globalStorage.windowHeight * (globalStorage.windowWidth > 767 ? 0.75 : 0.5))
		this.getMarqueeData();
		this.getFooterMeasureEl();
		this.getVideos();
		this.getScrollBasedSections();
		this.getDataFromElems();
		this.getScrolledMedia();
		this.getPrefetchLinks()
		// this.getHeroMeasureEl();
		this.playPauseVideos(true);
		this.checkScrollBasedLoadins(true);
		this.checkScrolledMedia(true);
		let marqueeInt = setInterval(() => {
			if (this.marqueeBounds) {
				clearInterval(marqueeInt);
				this.playPauseMarquees(true);
			}
		}, 30);
		if (this.data.scrollY === 0) {
			if (globalStorage.pencilMarquee) {
				globalStorage.pencilMarquee.tween.play();
			}
		}
	}

	getPrefetchLinks() {
		this.prefetchLinks = document.querySelectorAll('.prefetch-inview:not(.fetched)');

		if (!this.prefetchLinks.length) return;
		this.prefetchLinksData = [];
		for (let i = 0; i < this.prefetchLinks.length; i++) {
			const el = this.prefetchLinks[i];
			el.classList.add('fetched')
			const bounds = el.getBoundingClientRect();
			this.prefetchLinksData.push({
				el: el,
				top: (bounds.top + this.data.scrollY),
				bottom: (bounds.bottom + this.data.scrollY),
				height: (bounds.bottom - bounds.top),
				href: el.href,
				fetched: false
			});
		}
	}

	checkPrefetchLinks(force = false) {
		if ((this.direction === "untouched" && !force) || !this.prefetchLinksData) { return; }

		for (let i = 0; i < this.prefetchLinksData.length; i++) {
			let data = this.prefetchLinksData[i];

			if (data.fetched) { continue; }
			if ((this.data.scrollY + this.data.window2x) > data.top) {
				const prefetchArr = [];
				if (!prefetchedArr.includes(data.href)) {
					prefetchedArr.push(data.href);
					prefetchArr.push(data.href);
				}
				if (prefetchArr.length > 0) {
					if ('requestIdleCallback' in window) {
						window.requestIdleCallback(() => { new Prefetch(prefetchArr); }, { timeout: 2000 });
					} else {
						new Prefetch(prefetchArr)
					}
				}
				data.fetched = true;
			}
		}
	}

	getFooterMeasureEl() {
		if (!this.dom.footerMeasureEl) return;
		const el = this.dom.footerMeasureEl;
		const bounds = el.getBoundingClientRect();
		const lastSection = document.querySelector(".faq-section")
		const footerImg = document.querySelector(".instagram-section .inner")
		this.footerRevealTL = new gsap.timeline({ paused: true })
		this.footerRevealTL
			.fromTo(lastSection, { scale: 1, borderBottomLeftRadius: 4, transformOrigin: "50% 0%", borderBottomRightRadius: 4 }, { scale: 0.95, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, ease: "none", force3D: true, duration: 1 })
			.fromTo(footerImg, { opacity: 0, blur: 4, scale: 1.01, transformOrigin: "50% 100%" }, { opacity: 1, blur: 0, scale: 1, ease: "none", force3D: true, duration: 0.9 }, 0.1);

		this.footerMeasureData = {
			top: bounds.top + this.data.scrollY,
			bottom: (bounds.bottom + this.data.scrollY),
			height: bounds.bottom - bounds.top,
			reversed: true,
			duration: (this.data.height / (bounds.bottom - bounds.top)).toFixed(2)
		};
	}

	getBounding() {
		this.data.height = globalStorage.windowHeight;
		this.data.max = Math.floor((this.dom.el.querySelector("[data-router-view]").getBoundingClientRect().height - this.data.height) + this.data.scrollY);
	}

	resize(omnibar = false) {
		if (this.state.resizing) { return; }
		this.state.resizing = true;
		if (!omnibar) {
			this.getCache();
			this.getBounding();
		}
		this.checkScrolledMedia(true);
		this.state.resizing = false;
	}

	scrollTo(val, dur = 1, ease = "expo.inOut", fn = false) {
		this.state.scrollingTo = true;
		gsap.to(this.el, dur, { scrollTop: val, ease: ease, onComplete: () => {
				this.state.scrollingTo = false;
				if(fn) fn();
			}
		});
	}

	destroy() {
		this.transitioning = true;

		this.state.rafCancelled = true;

		this.cancelAnimationFrame();

		this.resize = null;
		this.direction = 'untouched'
		this.dom = null;
		this.data = null;
		this.raf = null;
	}
}
