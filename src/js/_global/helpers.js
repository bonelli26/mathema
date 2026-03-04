import {gsap} from "gsap";
import {StyleSlider, Marquees, slugTabs, prepModals, scrollImgs, prepButtonHovers} from "./anims"
import { FeatImgHover } from "../_classes/FeatImgHover";
import { H } from "../routing"
import {prepDrawers, prepSliders, prepTabs, popoutMenu, filtersMenu, bindFavHearts} from "./anims";
import {globalStorage} from "./storage";
import {$scroll, ImageLoad} from "./_renderer";
import {DragCursor} from "../_classes/DragCursor";
import {InfiniteSlider} from "../_classes/InfiniteSlider";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin"
gsap.registerPlugin(Draggable)
gsap.registerPlugin(InertiaPlugin)

/*
 	Get viewport
-------------------------------------------------- */
export const getViewport = function(){

	let e = window, a = "inner";

	if(!("innerWidth" in window)){
		a = "client";
		e = document.documentElement || document.body;
	}

	return { width: e[ a + "Width" ], height: e[ a + "Height" ] };
};

export const beforeScroll = () => {
	prepDrawers()
	prepSliders()
	prepStickyScrollTo()
	// playButtonFade()
	prepTabs()
	new Marquees()
	popoutMenu()
	if (globalStorage.namespace === 'collection') {
		filtersMenu();
		// new CollectionFiltering();
	}
	bindFavHearts()
	prepModals(document.querySelectorAll(".modal-trigger"));
};
export const afterScroll = () => {
	bindKlaviyoForms();
	bindQuickAdds();
	slugTabs();
	prepButtonHovers();
	const infiniteSliders = document.querySelectorAll('.infinite-slider .inner')
	for (let i = 0; i < infiniteSliders.length; i++) {
		new InfiniteSlider(infiniteSliders[i]);
	}
	if (!globalStorage.isMobile) {
		const dragCursorEls = document.querySelectorAll('.drag-cursor')
		for (let i = 0; i < dragCursorEls.length; i++) {
			new DragCursor(dragCursorEls[i])
		}
	}
	// bindColorOptions();
	new StyleSlider();
	const couponText = document.getElementById("coupon-text");

	if (couponText) {
		copyToClipboard(couponText)
	}
};
export const prepStickyScrollTo = () => {
	const triggers = document.querySelectorAll(".scroll-to-trigger")
	const targets = document.querySelectorAll(".scroll-to-target")

	for (let i = 0; i < triggers.length; i++) {
		triggers[i].addEventListener("click", () => {
			const sectionTop = targets[i].getBoundingClientRect().top
			const yPos = sectionTop + $scroll.data.scrollY - (sectionTop > $scroll.data.scrollY ? 80 : 160)
			$scroll.scrollTo(yPos)
		})
	}
}

export const copyToClipboard = (el) => {
	if (!el || (!globalStorage.isMobile && !navigator.clipboard)) return
	let ogText = el.textContent;

	// Accessibility stuff
	el.ariaLabel = `Copy this text to clipboard: ${ogText}`;
	el.ariaLive = "polite";

	el.addEventListener("click", (event) => {
		event.preventDefault();
		navigator.clipboard.writeText(ogText);

		el.textContent = "Copied!";

		gsap.delayedCall(2.5, () => {
			el.textContent = ogText;
		});
	});
}

export let $closeQuickAdd;
export const bindQuickAdds = () => {
	const quickAdds = document.querySelectorAll(".quick-add")
	let openQuickAdd = false
	for (let i = 0; i < quickAdds.length; i++) {
		const el = quickAdds[i]
		const openButton = el.nextElementSibling
		const openEvent = globalStorage.isMobile ? "click" : "mouseenter";

		el.addEventListener("click", (e) => {
			if (e.target.closest(".add-to-cart")) {
				e.stopPropagation()
			} else {
				e.stopPropagation()
				e.preventDefault()
			}
		})
		openButton.addEventListener("click", (e) => {
			e.stopPropagation()
			e.preventDefault()
		})
		gsap.set(el, { yPercent: 102, autoAlpha: 1, pointerEvents: 'none' })

		openButton.addEventListener(openEvent, () => {
			gsap.set(openButton, { pointerEvents: 'none' })
			gsap.to(el, { yPercent: 0, ease: "expo.out", duration: 0.8 })
			gsap.set(el, { pointerEvents: "all" })
			if (openQuickAdd) {
				$closeQuickAdd();
			}
			openQuickAdd = {openButton, el, top};
		})
	}
	document.addEventListener("click", () => {
		$closeQuickAdd();
		openQuickAdd = false
	})

	$closeQuickAdd = () => {
		if (openQuickAdd) {
			gsap.set(openQuickAdd.openButton, { pointerEvents: 'all' })
			gsap.to(openQuickAdd.el, { yPercent: 102, pointerEvents: "none", ease: "expo.out", duration: 0.8 })
		}
	}
}

// export const bindFakeSelects = () => {
// 	const fakeSelects = document.querySelectorAll(".fake-select:not(.bound-to-select)")
// 	for (let i = 0; i < fakeSelects.length; i++) {
// 		const el = fakeSelects[i]
// 		const realSelect = el.nextElementSibling
// 		if (!realSelect || !realSelect.classList.contains('real-select')) {
// 			continue
// 		}
// 		const realOptions = realSelect.querySelectorAll('option')
// 		const fakeOptions = el.querySelectorAll('.radio-option')
// 		for (let j = 0; j < fakeOptions.length; j++) {
// 			fakeOptions[j].addEventListener('click', () => {
// 				realSelect.value = realOptions[j].value
// 				realSelect.dispatchEvent(new Event('change'));
// 			})
// 		}
// 		el.classList.add('bound-to-select')
// 	}
// }

const submitKlaviyoForm = (listID, email) => {
	const myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

	const urlencoded = new URLSearchParams();

	urlencoded.append("$fields", "email, $source, ");

	urlencoded.append("g", listID);
	urlencoded.append("email", email);

	const requestOptions = {
		method: 'POST',
		headers: myHeaders,
		body: urlencoded,
		redirect: 'follow'
	};

	fetch("https://manage.kmail-lists.com/ajax/subscriptions/subscribe", requestOptions)
		.then(response => response.text())
		.then(result => console.log(result))
		.catch(error => console.log('error', error));
}
export const bindKlaviyoForms = () => {
	const forms = document.querySelectorAll(".bind-klaviyo-form:not(.bound)");

	for (let i = 0; i < forms.length; i++) {
		let form = forms[i];
		let submitted = false
		form.classList.add("bound");
		const successMessage = form.nextElementSibling;
		form.addEventListener("submit", (event)=>{
			if (submitted) { return }
			event.preventDefault();
			const listId = form.dataset.id;
			const email = form.querySelector('input[name="Email"]').value;
			gsap.to(successMessage, { autoAlpha: 1, duration: 0.3, ease: "sine.inOut" });
			submitKlaviyoForm(listId, email)
		});
	}
};

export class Prefetch {
	constructor(arr) {
		this.fetch(arr)
	}
	async fetch(arr) {
		for (let i = 0; i < arr.length; i++) {
			await fetch(arr[i], {
				mode: 'same-origin',
				method: 'GET',
				credentials: 'same-origin'
			})
				.then(response => response.text())
				.then(data => {
					const properties = H.Helpers.getProperties(data);
					H.cache.set(arr[i], properties);
				})
		}
	}
}

export const lerp = function (v0, v1, t) {
	return v0 * (1 - t) + v1 * t
}

export const distance = (x1,y1,x2,y2) => Math.hypot(x2-x1, y2-y1);

export const getQueryVariable = (variable) => {
	const query = window.location.search.substring(1);
	const vars = query.split("&");
	for (let i = 0; i < vars.length; i++) {
		const pair = vars[i].split("=");
		if (pair[0] === variable) { return pair[1]; }
	}
	return false;
};

export const bind = (_this, fn) => {
	let fnL = fn.length
	for (let i = 0; i < fnL; i++) {
		_this[fn[i]] = _this[fn[i]].bind(_this)
	}
}

export class HorizontalLoop {
	constructor(items, config) {
		this.bindMethods();
		this.items = items;
		this.config = config || {};
		this.proxy = document.createElement("div");
		this.xPercents = [];
		this.onChange = config.onChange;
		this.tl = gsap.timeline({repeat: config.repeat, paused: config.paused, defaults: {ease: "none"}, onReverseComplete: () => {
				this.tl.totalTime(this.tl.rawTime() + this.tl.duration() * 100)
			}});
		this.lastTime = 0;
		this.maxJump = 10;
		this.itemLength = items.length;
		this.startX = items[0].offsetLeft;
		this.times = [];
		this.centerTimes = [];
		this.spaceBefore = [];
		this.xPercents = [];
		this.curIndex = 0;
		this.direction = false;
		this.center = config.center;
		this.pixelsPerSecond = (config.speed || 1) * 100;
		this.snap = config.snap === false ? v => v : gsap.utils.snap(config.snap || 1); // some browsers shift by a pixel to accommodate flex layouts, so for example if width is 20% the first element's width might be 242px, and the next 243px, alternating back and forth. So we snap to 5 percentage points to make things look more natural
		this.timeOffset = 0;
		this.container = items[0].parentNode;
		this.productCards = this.container.querySelectorAll('.product-card')
		this.textSpans = this.container.querySelectorAll('.text-wrapper p span')
		this.productCardBottoms = this.container.querySelectorAll('.text-wrapper')
		this.closestIndex();
		this.lastIndex = this.curIndex;
		this.onChange && this.onChange(this.items[this.curIndex], this.curIndex);
		this.getCache();
	}

	bindMethods() {
		['closestIndex', 'checkProgress']
			.forEach(fn => this[fn] = this[fn].bind(this));
	}

	getCache() {
		this.containerRect = this.container.getBoundingClientRect()
		this.scale = globalStorage.windowWidth > 767 ? 1.96 : 1.41;
		let b1 = this.containerRect, b2;
		this.itemWidth = parseFloat(gsap.getProperty(this.items[0], "width", "px"));
		this.productCardBounds = this.productCards[0].getBoundingClientRect();
		this.productCardWidth = this.productCardBounds.width
		this.productCardHeight = this.productCardBounds.height
		this.visibleDuration = (this.itemWidth * 2) / this.pixelsPerSecond
		this.items.forEach((el, i) => {
			this.xPercents[i] = this.snap(parseFloat(gsap.getProperty(el, "x", "px")) / this.itemWidth * 100 + gsap.getProperty(el, "xPercent"));
			b2 = el.getBoundingClientRect();
			if (i === 1) {
				this.padding = Number(getComputedStyle(el.closest('.c-20')).paddingLeft.replace('px', ''))
				this.cardPadding = Number(getComputedStyle(el).paddingLeft.replace('px', ''))
				this.xDistLeft = Math.ceil(b2.left + this.cardPadding - this.padding);

			}
			if (i === 5) {
				this.xDistRight = Math.ceil((globalStorage.windowWidth - this.padding) - b2.right - this.cardPadding);
			}
			this.spaceBefore[i] = b2.left - (i ? b1.right : b1.left);
			b1 = b2;
		});

		gsap.set(this.items, { // convert "x" to "xPercent" to make things responsive, and populate the widths/xPercents Arrays to make lookups faster.
			xPercent: i => this.xPercents[i]
		});
		this.totalWidth = this.items[this.itemLength-1].offsetLeft + this.xPercents[this.itemLength-1] / 100 * this.itemWidth - this.startX + this.spaceBefore[0] + this.itemWidth + (parseFloat(this.config.paddingRight) || 0);

		this.getOffsets()
		this.populateTimeline()

		gsap.set(this.items, {x: 0});

		this.tl.progress(1, true).progress(0, true); // pre-render for performance

		this.initDraggable()

		this.tlDuration = this.tl.totalDuration()
		this.time = Number(this.tl.time().toFixed(4));
		this.shiftX = ((this.scale * this.productCardWidth) - this.productCardWidth) / 2;
		gsap.set(this.container, { height: this.productCardHeight * this.scale })
		this.checkProgress(true)
	}

	getOffsets() {
		this.timeOffset = this.center ? this.tl.duration() * (this.container.offsetWidth / 2) / this.totalWidth : 0;
		this.center && this.times.forEach((t, i) => {
			this.times[i] = this.timeWrap(this.tl.labels["label" + i] + this.tl.duration() * this.itemWidth / 2 / this.totalWidth - this.timeOffset);
		});
	}

	getClosest(values, value, wrap) {
		let i = values.length,
			closest = 1e10,
			index = 0, d;
		while (i--) {
			d = Math.abs(values[i] - value);
			if (d > wrap / 2) {
				d = wrap - d;
			}
			if (d < closest) {
				closest = d;
				index = i;
			}
		}
		return index;
	}

	handleLoop(card) {
		const x = gsap.getProperty(card, "x") * -1
		gsap.set(card, { x: x })
	}

	populateTimeline() {
		this.tl.clear();
		let distanceToLoops = []
		for (let i = 0; i < this.itemLength; i++) {
			const item = this.items[i];
			const curX = this.xPercents[i] / 100 * this.itemWidth;
			const distanceToStart = item.offsetLeft + curX - this.startX + this.spaceBefore[0];
			const distanceToLoop = distanceToStart + this.itemWidth;
			distanceToLoops.push(distanceToLoop)
			this.tl
				.to(item, {xPercent: this.snap((curX - distanceToLoop) / this.itemWidth * 100), duration: distanceToLoop / this.pixelsPerSecond, force3D: true}, 0)
				.fromTo(item, {xPercent: this.snap((curX - distanceToLoop + this.totalWidth) / this.itemWidth * 100)}, {xPercent: this.xPercents[i], duration: (curX - distanceToLoop + this.totalWidth - curX) / this.pixelsPerSecond, immediateRender: false, force3D: true}, distanceToLoop / this.pixelsPerSecond)
				.add("label" + i, distanceToStart / this.pixelsPerSecond)

			this.times[i] = Number((distanceToStart / this.pixelsPerSecond).toFixed(4));
		}
		const lastLoopTime = distanceToLoops[this.times.length - 1] / this.pixelsPerSecond
		this.tl.eventCallback("onUpdate", () => {
			const currentTime = this.time;
			const delta = Math.abs(currentTime - this.lastTime);
			const direction = currentTime > this.lastTime ? "forward" : "backward";

			if (delta > this.maxJump) {
				console.log(this.lastTime, lastLoopTime, currentTime, delta)
				if (direction === "forward") {
					if (this.lastTime < lastLoopTime && currentTime >= lastLoopTime - 1) {
						this.handleLoop(this.productCards[this.times.length - 1]);
					}
				} else {
					console.log(currentTime, this.lastTime, delta, lastLoopTime)
					if (this.lastTime < lastLoopTime && currentTime >= 0) {
						this.handleLoop(this.productCards[this.times.length - 1]);
					}
				}

				this.lastTime = currentTime;
				return;
			}


			for (let i = 0; i < this.items.length; i++) {
				const loopTime = distanceToLoops[i] / this.pixelsPerSecond; // typically distanceToLoop / pixelsPerSecond

				const crossedForward = direction === "forward" &&
					this.lastTime < loopTime && currentTime >= loopTime;

				const crossedBackward = direction === "backward" &&
					this.lastTime > loopTime && currentTime <= loopTime;

				if (crossedForward || crossedBackward) {
					this.handleLoop(this.productCards[i]);
				}
			}

			this.lastTime = currentTime;
		})
		this.anchorTime = globalStorage.windowWidth > 767 ? this.times[3] : this.times[1];
		let multiplier = 2
		this.times.forEach((time, i) => {
			if (globalStorage.windowWidth > 767) {
				if (i < 3) {
					this.centerTimes[i] = Number((this.times[this.itemLength - 1] - (this.times[1] * (multiplier))).toFixed(4))
					multiplier--;
				} else if (i === 3) {
					this.centerTimes[i] = 0;
				} else {
					this.centerTimes[i] = Number((this.times[i] - this.anchorTime).toFixed(4))
				}
			} else {
				if (i === 0) {
					this.centerTimes[i] = Number((this.times[this.itemLength - 1] - (this.times[1])).toFixed(4))
				} else if (i === 1) {
					this.centerTimes[i] = 0;
				} else {
					this.centerTimes[i] = Number((this.times[i] - this.anchorTime).toFixed(4))
				}
			}
		})
		this.timeWrap = gsap.utils.wrap(0, this.tl.duration());
	}

	onResize(deep) {
		let progress = this.tl.progress();
		this.tl.progress(0, true);
		this.getCache()
		deep && this.tl.draggable && this.tl.paused() ? this.tl.time(this.times[this.curIndex], true) : this.tl.progress(progress, true);
	}
	closestIndex() {
		this.curIndex = this.getClosest(this.times, this.tl.time(), this.tl.duration());
	}

	scaleFromRatio(ratio, min = 1, max = this.scale) {
		const t = Math.abs(ratio - 0.5) * 2; // t = 0 at center, 1 at edges
		const scale = max - (max - min) * t;
		return scale;
	}

	xFromRatio(ratio, maxShift = this.shiftX) {
		return (0.5 - ratio) * 2 * maxShift;
	}
	checkProgress(first = false) {

		for (let i = 0; i < this.itemLength; i++) {
			this.time = Number((this.tl.time()).toFixed(4))
			let startTime = this.centerTimes[i] - this.visibleDuration / 2;
			let endTime = this.centerTimes[i] + this.visibleDuration / 2;

			// Wrap times into timeline duration bounds
			startTime = Number(((startTime + this.tlDuration) % this.tlDuration).toFixed(4));
			endTime = Number(((endTime + this.tlDuration) % this.tlDuration).toFixed(4));
			if (i === 4) {
				// console.log(this.centerTimes[i])
			}
			let inWindow = false;
			let ratio = 0;

			// Check if window wraps around the end of the timeline
			if (startTime < endTime) {
				inWindow = this.time >= startTime && this.time <= endTime;
			} else {
				// Wrapped window: match if this.time is >= startTime or <= endTime
				inWindow = this.time >= startTime || this.time <= endTime;
			}
			if (inWindow) {
				let distanceFromStart = (this.time - startTime + this.tlDuration) % this.tlDuration;
				ratio = Number((distanceFromStart / this.visibleDuration).toFixed(4));

				if (ratio > 0) {
					const scale = this.scaleFromRatio(ratio)
					const counterScale = 1 / scale;
					const x = this.xFromRatio(ratio)
					gsap.set(this.productCards[i], { scale: scale, x: x, force3D: true })
					gsap.set(this.productCardBottoms[i], { scale: counterScale, rotation: 0.001, force3D: true })
				}
			} else {
				const x = gsap.getProperty(this.productCards[i], "x")
				const finishedX = x < 0 ? -this.shiftX : this.shiftX
				gsap.set([this.productCards[i], this.productCardBottoms[i]], { scale: 1, force3D: true })
				gsap.set(this.productCards[i], { x: finishedX, force3D: true })
			}
		}
		if (!first) {
			this.requestAnimationFrame()
		} else {
			const centerIdx = globalStorage.windowWidth > 767 ? 3 : 1
			for (let i = 0; i < this.productCards.length; i++) {
				if (i < centerIdx) {
					gsap.set(this.productCards[i], { x: -this.shiftX })
				} else if (i > centerIdx) {
					gsap.set(this.productCards[i], { x: this.shiftX })
				}
			}
		}
	}
	requestAnimationFrame() {
		this.rAF = requestAnimationFrame(() => {
			this.checkProgress()
		})
	}
	cancelAnimationFrame() {
		cancelAnimationFrame(this.rAF);
	}
	initDraggable() {
		let wrap = gsap.utils.wrap(0, 1),
			ratio, startProgress, draggable, dragSnap, lastSnap, initChangeX, wasPlaying,
			self = this,
			align = () => {
				const currProgress = Number(wrap(startProgress + (draggable.startX - draggable.x) * ratio).toFixed(4))
				this.tl.progress(currProgress)
			},
			syncIndex = () => this.closestIndex();

		typeof(InertiaPlugin) === "undefined" && console.warn("InertiaPlugin required for momentum-based scrolling and snapping. https://greensock.com/club");
		let lastX = 0;
		let isDragThrowing = false;
		let showingText = true;
		const showTexts = () => {
			gsap.to(self.textSpans, { yPercent: 0, ease: 'expo.out', duration: 0.8 })
		}
		draggable = Draggable.create(self.proxy, {
			trigger: self.items[0].parentNode.parentNode,
			type: "x",
			dragResistance: globalStorage.isMobile ? 0.7 : 0.4,
			onPressInit() {
				let x = this.x;
				gsap.killTweensOf(self.tl);
				wasPlaying = !self.tl.paused();
				self.tl.pause();
				startProgress = self.tl.progress();
				// self.refresh();
				ratio = 1 / self.totalWidth;
				initChangeX = (startProgress / -ratio) - x;
				gsap.set(self.proxy, {x: startProgress / -ratio});
				gsap.to(self.textSpans, { yPercent: 100, transformOrigin: "5% 100%", ease: 'expo.out', duration: 0.8 })
				showingText = false;
			},
			onDragStart: () => {
				isDragThrowing = true;
				self.direction = draggable.getDirection()
				self.requestAnimationFrame()
				$closeQuickAdd()
			},
			onThrowComplete: () => {
				isDragThrowing = false;
				self.cancelAnimationFrame()
				syncIndex();
				wasPlaying && self.tl.play();
				if (!showingText) {
					showingText = true;
					showTexts()
				}
			},
			onDrag: () => {
				const dx = draggable.x - lastX;
				self.direction = dx > 0 ? "right" : dx < 0 ? "left" : "none";

				lastX = draggable.x;
				align()
			},
			onThrowUpdate: () => {
				align()
				let velocityX = Math.abs(InertiaPlugin.getVelocity(draggable.target, "x"));
				if (!showingText && velocityX < 100) {
					showingText = true;
					showTexts()
				}
			},
			overshootTolerance: 0,
			inertia: true,
			snap(value) {
				//note: if the user presses and releases in the middle of a throw, due to the sudden correction of this.proxy.x in the onPressInit(), the velocity could be very large, throwing off the snap. So sense that condition and adjust for it. We also need to set overshootTolerance to 0 to prevent the inertia from causing it to shoot past and come back
				if (Math.abs(startProgress / -ratio - this.x) < 10) {
					return lastSnap + initChangeX
				}
				let time = -(value * ratio) * self.tl.duration(),
					wrappedTime = self.timeWrap(time),
					snapTime = self.times[self.getClosest(self.times, wrappedTime, self.tl.duration())],
					dif = snapTime - wrappedTime;
				Math.abs(dif) > self.tl.duration() / 2 && (dif += dif < 0 ? self.tl.duration() : -self.tl.duration());
				lastSnap = (time + dif) / self.tl.duration() / -ratio;
				return lastSnap;
			},
			onRelease() {
				if (!isDragThrowing && !showingText) {
					showTexts()
				}
				syncIndex();
			}
		})[0];
		this.tl.draggable = draggable;
	}
}


