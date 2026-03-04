import {$miniCart} from "../../_global/_renderer";
import {domStorage, globalStorage} from "../../_global/storage";
import { gsap } from "gsap";
import {$closeQuickAdd} from "../../_global/helpers";

export class AddToCart {

	constructor(){
		this.pdp = document.querySelectorAll(".pdp-hero") && document.querySelectorAll(".product-card");
		this.forms = document.querySelectorAll(".atc-form:not(.bound)");
		this.clickedBtn = false
		this.addingToCart = false
		this.bindATCEvents();
		this.getCurrentCart(true);
	}

	bindATCEvents(){
		for (let i = 0; i < this.forms.length; i++) {
			let form = this.forms[i];
			form.classList.add("bound");
			const variantBtns = form.querySelectorAll(".option");
			if (variantBtns.length > 0) {
				/* --- Bind variant change (reflect active choice in UI, change var id on atc button) --- */
				this.bindOptions(form);
			}

			/* --- Setup our form listener --- */
			form.addEventListener("submit", (event)=>{
				event.preventDefault();
				this.addToCart(form);
			});
		}

	}

	bindOptions(form) {

		// break apart and store variants
		let addToCartBtn = form.querySelector(".add-to-cart");
		let variants = addToCartBtn.dataset.variants;
		if (variants) { variants = variants.split("|||"); } else { return; }
		if (variants[0].length < 2) { return; }
		const varData = [];
		for (let i = 0; i < variants.length; i++) {
			let data = variants[i].split("||"),
				id = data[0],
				title = data[1],
				price = data[2],
				comparePrice = data[3],
				available = data[4];

			varData.push({id: id, title: title, price: price, comparePrice: comparePrice, available: available});
		}

		const hero = form.closest('.pdp-hero')
		let options = form.querySelectorAll(".option");
		const priceEls = hero ? hero.querySelectorAll(".price") : form.querySelectorAll(".price");
		const comparePriceEl = hero ? hero.querySelector(".compare-at-price") : form.querySelector(".compare-at-price");
		const allOptionsArr = [];

		for (let i = 0; i < options.length; i++) {
			let option = options[i];
			option.addEventListener("click", () => {
				if (option.classList.contains("active")) { return; }
				let optionsString = "";

				option.parentElement.querySelector(".active").classList.remove("active");
				option.classList.add("active");

				const activeOptions = form.querySelectorAll(".option.active");

				for (let j = 0; j < activeOptions.length; j++) {
					optionsString = optionsString + activeOptions[j].dataset.value + (j !== activeOptions.length - 1 ? ' / ' : '');
				}
				console.log(optionsString)
				let currentVariant = false;
				for (let j = 0; j < varData.length; j++) {
					console.log(optionsString, varData[j].title)
					if (optionsString === varData[j].title) {
						currentVariant = varData[j];
						break
					}
				}

				if (currentVariant) {
					priceEls.forEach((priceEl, i) => {
						priceEl.textContent = parseFloat(currentVariant.price.toString().slice(0, -2)).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
					});

					if (comparePriceEl && currentVariant.comparePrice !== "false") {
						comparePriceEl.textContent = parseFloat(currentVariant.comparePrice.toString().slice(0, -2)).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
					} else if (comparePriceEl) {
						comparePriceEl.textContent = "";
					}

					if (currentVariant.available !== "false") {
						addToCartBtn.dataset.id = currentVariant.id;
						addToCartBtn.classList.remove("disabled");
					} else {
						addToCartBtn.classList.add("disabled");
					}
				}

			});
			allOptionsArr.push(options[i].dataset.value);
		}
		if (varData[0].available === "false") {
			addToCartBtn.classList.add('disabled')
			addToCartBtn.disabled = true
		}
		const incrementWrapper = form.querySelector('.increment-wrapper')
		if (incrementWrapper) {
			let countEl = incrementWrapper.querySelector(".count"),
				decrease = incrementWrapper.querySelector(".decrease"),
				increase = incrementWrapper.querySelector(".increase"),
				count = parseInt(countEl.textContent);

			decrease.addEventListener("click", () => {
				if (count === 1) {
					return;
				}
				count = count - 1;
				countEl.textContent = count;
			});
			increase.addEventListener("click", () => {
				count = count + 1;
				countEl.textContent = count;
			});
		}
	}

	/*
	 * addToCart
	 *	- trigger our add to cart
	 */
	addToCart(form){
		this.clickedBtn = form.querySelector('.add-to-cart');
		console.log(this.clickedBtn, this.addingToCart)
		if (this.addingToCart) { return }
		this.addingToCart = true
		let varID = form.querySelector(".add-to-cart").dataset.id;
		const count = form.querySelector(".count");
		this.clickedBtn.querySelector('.in-stock').textContent = 'Adding to cart';

		let quantity;
		if (count) {
			quantity = Number(count.textContent);
		} else {
			quantity = 1;
		}

		let formData = {
			'items': [{
				'id': varID,
				'quantity': quantity
			}]
		};

		fetch(window.Shopify.routes.root + 'cart/add.js', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(formData)
		}).then(response => response.json()).then(data => {
			console.log(data)
			fetch(window.Shopify.routes.root + 'cart.js')
				.then(response => response.json())
				.then(data => {
					this.useCartData(data)
				});
		}).catch((error) => {
			console.error('Error:', error);
		});
	}
	getCurrentCart(firstBuild = false) {
		if (firstBuild) {
			gsap.set(domStorage.miniCartCover, { opacity: 0, pointerEvents: 'none' })
		}
		fetch(window.Shopify.routes.root + 'cart.js')
			.then(response => response.json())
			.then(data => {
				this.useCartData(data, true);
			});
	}

	useCartData(data, firstBuild = false) {
		if (!firstBuild) {
			gsap.to(domStorage.miniCartCover, { opacity: 0, pointerEvents: 'none', force3D: true, ease: 'sine.out', duration: .18 })
		}
		this.cartItems = data.items;
		gsap.delayedCall(.1, () => {
			$closeQuickAdd();
		})
		if (this.clickedBtn) {
			gsap.delayedCall(.25, () => {
				this.clickedBtn.querySelector('.in-stock').textContent = 'Add to cart';
				this.clickedBtn = false;
				this.addingToCart = false
			})
		}
		if (data.item_count > 0) {
			domStorage.miniCartTotal.textContent = "$" + ((data.total_price.toString()).slice(0, -2) + "." + (data.total_price.toString()).slice(-2));
			this.buildMiniCart(data);
			$miniCart.lineItems = domStorage.miniCart.querySelectorAll('.line-item')
			if (!$miniCart.isOpen) {
				gsap.set($miniCart.lineItems, { opacity: 0, y: 30 })
			}
			domStorage.miniCart.classList.remove('disabled')
			this.toggleEmptyCart(false);
			if (!firstBuild) {
				$miniCart.open()
			}
		} else {
			domStorage.miniCartProductsWrapper.innerHTML = ``;
			domStorage.miniCart.classList.add('disabled')
			domStorage.miniCartTotal.textContent = "$0.00"
			this.toggleEmptyCart(true, true);
			// domStorage.cartCountEl.textContent = "0";
			for (let i = 0; i < domStorage.cartCountEls.length; i++) {
				domStorage.cartCountEls[i].textContent = "0";
			}
		}
	}

	removeProduct(key, lineItem) {
		let formData = {
			'id': key,
			'quantity': 0
		};
		if (this.cartItems.length === 1) {
			this.toggleEmptyCart(true)
			gsap.delayedCall(.1, () => {
				domStorage.miniCartTotal.textContent = "$0.00"
				for (let i = 0; i < domStorage.cartCountEls.length; i++) {
					domStorage.cartCountEls[i].textContent = "0";
				}
			})
			domStorage.miniCart.classList.add('disabled')
		} else {
			gsap.to(domStorage.miniCartCover, { opacity: 1, pointerEvents: 'all', force3D: true, ease: 'sine.out', duration: .18 })
		}
		fetch(window.Shopify.routes.root + 'cart/change.js', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(formData)
		}).then(response => {
			fetch(window.Shopify.routes.root + 'cart.js')
				.then(response => response.json())
				.then(data => {
					this.useCartData(data);
				});
		}).catch((error) => {
			console.error('Error:', error);
		});
	}

	modifyLineItem(key, quantity) {
		gsap.to(domStorage.miniCartCover, { opacity: 1, pointerEvents: 'all', force3D: true, ease: 'sine.out', duration: .18 })
		let formData = {
			'id': key,
			'quantity': quantity
		};
		fetch(window.Shopify.routes.root + 'cart/change.js', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(formData)
		}).then(response => {
			fetch(window.Shopify.routes.root + 'cart.js')
				.then(response => response.json())
				.then(data => {
					this.useCartData(data);
					domStorage.miniCartTotal.textContent = "$" + ((data.total_price.toString()).slice(0, -2) + "." + (data.total_price.toString()).slice(-2));
				});
		}).catch((error) => {
			console.error('Error:', error);
		});
	}

	toggleEmptyCart(empty, instant = false) {
		if (empty) {
			if ($miniCart.isOpen) {
				gsap.to(domStorage.miniCartEmptyWrapper, { autoAlpha: 1, ease: "sine.inOut", duration: 0.25, delay: .22 });
			}
			gsap.to(domStorage.miniCartProductsWrapper, { autoAlpha: 0, ease: "sine.out", duration: 0.22 });
		} else {
			gsap.set(domStorage.miniCartEmptyWrapper, { autoAlpha: 0 });
			gsap.set(domStorage.miniCartProductsWrapper, { autoAlpha: 1 });
		}
	}

	buildMiniCart(data) {
		const items = data.items
		let html = ``;

		for (let i = 0; i < items.length; i++) {
			let item = items[i];
			let promoItem = false
			// if (item.id === 39652020912170) {
			// 	promoItem = true
			// 	document.body.classList.add("promo-item-added")
			// }
			/* --- Product --- */
			html += ` 
				<div class="line-item item one-time" data-id="${item.variant_id}" data-product-id="${item.product_id}" data-key="${item.key}" data-quantity="${item.quantity}">`
				html += `
					<div class="image-wrapper">
						<img class="image" src="${item.image}&width=${globalStorage.windowWidth > 767 ? "900" : "500"}" alt="${item.product_title} - ${item.variant_title}">
					</div>
					<div class="right">
						<div class="top">
							<div>
								<div class="name">${item.product_title}</div>`;
			if (item.variant_title) {
				html += `
								<div class="subtitle">${item.variant_title}`; html +=`</div>`;
			}
			html += `
							</div>
							<div class="price line-item-price" data-orig-price="${item.price.toString().slice(0, -2)}">`
							html += `$${parseFloat((item.price * item.quantity).toString().slice(0, -2)) + "." + ((item.price * item.quantity).toString().slice(-2))}
							</div>		
						</div>
						<div class="line-bottom">					
							<div class="increment-wrapper">
								<button aria-label="Decrease quantity" class="control increment decrease expand-hitbox" type="button" data-type="minus">
								<svg viewBox="0 0 17 13" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M11.9424 6.33591L4.96402 6.33591" stroke="#4E586B"/>
										<path d="M3.65972 12.3759H0.299719V0.335937H3.65972V1.31594H1.41972V11.3959H3.65972V12.3759Z" fill="#4E586B"/>
										<path d="M13.1358 12.3759V11.3959H15.3758V1.31594H13.1358V0.335937H16.4958V12.3759H13.1358Z" fill="#4E586B"/>
									</svg>
								</button>
								<span class="quantity count">${item.quantity}</span>
								<button aria-label="Increase quantity" class="control increment increase expand-hitbox" type="button" data-type="plus">
									<svg viewBox="0 0 17 13" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M8.45312 2.84674V9.8251" stroke="#4E586B"/>
										<path d="M11.9424 6.33591L4.96402 6.33591" stroke="#4E586B"/>
										<path d="M3.65972 12.3759H0.299719V0.335937H3.65972V1.31594H1.41972V11.3959H3.65972V12.3759Z" fill="#4E586B"/>
										<path d="M13.1358 12.3759V11.3959H15.3758V1.31594H13.1358V0.335937H16.4958V12.3759H13.1358Z" fill="#4E586B"/>
									</svg>
								</button>
							</div>
							<button class="remove" type="button">Remover</button>
						</div>
					</div>
				</div>
		
			`;
		}

		// if (promoUnlocked && this.multiAddress) {
		//   gsap.set(domStorage.checkoutBtn, { display: "none" })
		//   gsap.set(domStorage.gsCheckoutBtn, { display: "flex" })
		// } else {
		//   gsap.set(domStorage.checkoutBtn, { display: "flex" })
		//   gsap.set(domStorage.gsCheckoutBtn, { display: "none" })
		// }
		// if (!promoProductFound) {
		//   // document.body.classList.remove("promo-item-added")
		// }

		domStorage.miniCartProductsWrapper.innerHTML = html;

		this.bindMCevents();

		for (let i = 0; i < domStorage.cartCountEls.length; i++) {
			domStorage.cartCountEls[i].textContent = data.item_count;
		}

		// getRelatedProducts()
	}

	bindMCevents() {
		/* --- Bind increments  --- */
		// let plus = this.form.querySelector()

		let removes = domStorage.miniCart.querySelectorAll(".remove");
		for (let i = 0; i < removes.length; i++) {
			removes[i].addEventListener("click", () => {
				let lineItem = removes[i].closest(".line-item"),
					key = lineItem.dataset.key;
				this.removeProduct(key, lineItem);
			});
		}

		let miniCartIncrements = domStorage.miniCart.querySelectorAll(".increment-wrapper");
		for (let i = 0; i < miniCartIncrements.length; i++) {
			let el = miniCartIncrements[i],
				countEl = el.querySelector(".count"),
				decrease = el.querySelector(".decrease"),
				increase = el.querySelector(".increase"),
				parentLineItem = el.parentElement.parentElement.parentElement,
				count = parseInt(countEl.textContent);

			decrease.addEventListener("click", () => {
				if (count === 1) {
					this.removeProduct(parentLineItem.dataset.key, parentLineItem);
					return;
				}
				count = count - 1;
				countEl.textContent = count;
				parentLineItem.dataset.quantity = count;
				this.modifyLineItem(parentLineItem.dataset.key, count);
			});
			increase.addEventListener("click", () => {
				count = count + 1;
				countEl.textContent = count;
				parentLineItem.dataset.quantity = count;
				this.modifyLineItem(parentLineItem.dataset.key, count);
			});
		}
	}
}
