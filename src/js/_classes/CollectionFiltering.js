import { gsap } from "gsap";
import {H} from "../routing";
import {$scroll} from "../_global/_renderer";

export class CollectionFiltering {
    constructor() {
        const filtersWrapper = document.getElementById('filterWrapper')
        if (!filtersWrapper) return;
        ["clickFilter"].forEach(fn => this[fn] = this[fn].bind(this));
        this.rangeLowerBound = filtersWrapper.querySelector('.range-group input:first-child');
        this.rangeHigherBound = filtersWrapper.querySelector('.range-group input:last-child');
        this.textInputLowerBound = filtersWrapper.querySelector('.text-range-wrapper .input-wrapper:first-child input');
        this.textInputHigherBound = filtersWrapper.querySelector('.text-range-wrapper .input-wrapper:last-child input');
        this.filterEls = filtersWrapper.querySelectorAll('.filter-label input')
        this.gridWrapper = document.getElementById('collection-grid')
        this.sortTriggers = this.gridWrapper.querySelectorAll('.sort-trigger')
        this.appliedFiltersEls = document.querySelectorAll('.applied-filters')
        this.productCountEls = document.querySelectorAll('.product-count')
        this.grid = this.gridWrapper.querySelector('.product-grid')
        const collectionGrid = document.getElementById('collection-grid')
        this.allProductCards = collectionGrid.querySelectorAll('.product-card:not(.dummy)')
        this.productDataString = collectionGrid.dataset.productData
        collectionGrid.removeAttribute('data-product-data')
        this.appliedFilters = []
        this.productData = []
        this.activeProductCards = []
        this.getCache();
        this.addEvents();
    }

    getCache() {
        const productDataStrings = this.productDataString.split('|||')
        this.priceFilter = { low: 0, high: Number(this.rangeHigherBound.max) }
        for (let i = 0; i < productDataStrings.length; i++) {
            const str = productDataStrings[i].split('||')
            this.productData.push({
                index: i,
                el: this.allProductCards[i],
                available: str[0] === 'true',
                price: Number(str[1].replaceAll(',', '')),
                emittingOptions: !str[2] ? false : str[2]
            })
        }
    }

    updateAppliedFilters() {
        this.activeProductCards = []
        if (this.appliedFilters.length) {
            const theseFilteredProductIndices = []
            for (let i = 0; i < this.appliedFilters.length; i++) {
                const filter = this.appliedFilters[i]
                if (filter["Availability"]) {
                    const value = filter["Availability"]
                    for (let j = 0; j < this.productData.length; j++) {
                        const data = this.productData[j]
                        if (value === "In stock" && data.available) {
                            if (data.price >= this.priceFilter.low && data.price <= this.priceFilter.high) {
                                if (!theseFilteredProductIndices.includes(data.index)) {
                                    theseFilteredProductIndices.push(data.index)
                                }
                            }
                        } else if (value === "Out of stock" && !data.available) {
                            if (data.price >= this.priceFilter.low && data.price <= this.priceFilter.high) {
                                if (!theseFilteredProductIndices.includes(data.index)) {
                                    theseFilteredProductIndices.push(data.index)
                                }
                            }
                        }
                    }
                } else if (filter["Emitting Color"]) {
                    const value = filter["Emitting Color"]
                    for (let j = 0; j < this.productData.length; j++) {
                        const data = this.productData[j]
                        if (data.emittingOptions && data.emittingOptions.includes(value)) {
                            if (data.price >= this.priceFilter.low && data.price <= this.priceFilter.high) {
                                if (!theseFilteredProductIndices.includes(data.index)) {
                                    theseFilteredProductIndices.push(data.index)
                                }
                            }
                        }
                    }
                }
            }
            for (let j = 0; j < theseFilteredProductIndices.length; j++) {
                const idx = theseFilteredProductIndices[j]
                this.activeProductCards.push(this.productData[idx].el)
            }
        } else {
            for (let i = 0; i < this.productData.length; i++) {
                const data = this.productData[i]
                if (data.price >= this.priceFilter.low && data.price <= this.priceFilter.high) {
                    this.activeProductCards.push(data.el)
                }
            }
        }
        if (this.appliedFilters.length || this.activeProductCards.length !== this.allProductCards.length) {
            this.gridWrapper.classList.add('filtered')
            if (this.activeProductCards.length === 0) {
                this.gridWrapper.classList.add('show-no-results')
            } else {
                this.gridWrapper.classList.remove('show-no-results')
            }
            this.productCountEls.forEach((el) => {
                el.textContent = this.activeProductCards.length.toString()
            })
        } else {
            this.gridWrapper.classList.remove('filtered')
            this.gridWrapper.classList.remove('show-no-results')
            this.productCountEls.forEach((el) => {
                el.textContent = this.allProductCards.length.toString()
            })
        }
        this.updateClearFilterButtons()
        gsap.set(this.allProductCards, { display: 'none' })
        gsap.set(this.activeProductCards, { display: 'flex' })
        $scroll.getCache()
        $scroll.checkScrolledMedia(true)
    }

    updateClearFilterButtons() {
        let html = ``
        const clearFilterButtons = []
        if (this.appliedFilters.length) {
            for (let i = 0; i < this.appliedFilters.length; i++) {
                const filter = this.appliedFilters[i]
                let type
                if (filter["Availability"]) {
                    type = "Availability"
                } else if (filter["Emitting Color"]) {
                    type = "Emitting Color"
                }
                if (!clearFilterButtons.includes(type)) {
                    clearFilterButtons.push(type)
                }
            }
        }

        if (this.rangeLowerBound.value !== '0' || this.rangeHigherBound.value !== this.rangeHigherBound.max) {
            clearFilterButtons.push('Price')
        }

        if (clearFilterButtons.length) {
            for (let i = 0; i < clearFilterButtons.length; i++) {
                html += `<button class="btn clear-filter-trigger" data-type="${clearFilterButtons[i]}">${clearFilterButtons[i]}
                        <span>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.678 2.364 12.264.95 7.314 5.9 2.364.95.95 2.364l4.95 4.95-4.95 4.95 1.415 1.414 4.95-4.95 4.95 4.95 1.413-1.415-4.95-4.95 4.95-4.949Z" fill="#1A1A1A"/></svg>
                        </span>
                     </button>`
            }
            this.appliedFiltersEls[0].innerHTML = html
            this.appliedFiltersEls[1].innerHTML = html
        } else {
            this.appliedFiltersEls[0].innerHTML = `<p class="no-filters-applied">None</p>`
            if (this.appliedFiltersEls[1].dataset.name) {
                this.appliedFiltersEls[1].innerHTML = `<a class="btn" href="/collections/all">${this.appliedFiltersEls[1].dataset.name}<span><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.678 2.364 12.264.95 7.314 5.9 2.364.95.95 2.364l4.95 4.95-4.95 4.95 1.415 1.414 4.95-4.95 4.95 4.95 1.413-1.415-4.95-4.95 4.95-4.949Z" fill="#1A1A1A"></path></svg></span></a>`
                H.attach(this.appliedFiltersEls[1].querySelectorAll('a'))
            } else {
                this.appliedFiltersEls[1].innerHTML = ''
            }
        }
        const clearFilterBtns = document.querySelectorAll('.clear-filter-trigger')
        for (let i = 0; i < clearFilterBtns.length; i++) {
            const btn = clearFilterBtns[i]
            btn.addEventListener('click', () => {
                switch (btn.dataset.type) {
                    case "Availability":
                        const checkedFiltersA = document.querySelectorAll('input[data-type="Availability"]:checked')
                        for (let j = 0; j < checkedFiltersA.length; j++) {
                            checkedFiltersA[j].checked = false
                        }
                        break;
                    case "Emitting Color":
                        const checkedFiltersEC = document.querySelectorAll('input[data-type="Emitting Color"]:checked')
                        for (let j = 0; j < checkedFiltersEC.length; j++) {
                            checkedFiltersEC[j].checked = false
                        }
                        break;
                    case "Price":
                        this.rangeHigherBound.value = this.rangeHigherBound.max
                        this.textInputHigherBound.value = this.rangeHigherBound.max
                        this.rangeLowerBound.value = 0
                        this.textInputLowerBound.value = 0
                        this.rangeHigherBound.parentElement.style.setProperty('--range-max', "100%");
                        this.rangeLowerBound.parentElement.style.setProperty('--range-min', "0%");
                        this.priceFilter = { low: 0, high: Number(this.rangeHigherBound.max) }
                        break;
                }
                for (let j = 0; j < this.appliedFilters.length; j++) {
                    const filter = this.appliedFilters[j]
                    if (filter[btn.dataset.type]) {
                        this.appliedFilters[j] = false
                    }
                }
                this.appliedFilters = this.appliedFilters.filter((filter) => filter)
                this.updateAppliedFilters()
            })
        }
    }

    clickFilter(event) {
        const el = event.target
        const checked = el.checked
        const thisType = el.dataset.type;
        const value = el.value;
        if (checked) {
            const obj = {}
            obj[thisType] = value
            this.appliedFilters.push(obj)
        } else {
            for (let i = 0; i < this.appliedFilters.length; i++) {
                const filter = this.appliedFilters[i]
                const filterKeys = Object.keys(filter)
                const filterVals = Object.values(filter)
                if (filterKeys[0] === thisType && filterVals[0] === value) {
                    this.appliedFilters.splice(i, 1)
                }
            }
        }
        this.updateAppliedFilters()
    }

    changePriceFilter() {
        this.priceFilter.low = Number(this.rangeLowerBound.value)
        this.priceFilter.high = Number(this.rangeHigherBound.value)
        this.updateAppliedFilters()
    }

    addEvents() {
        for (let i = 0; i < this.filterEls.length; i++) {
            const el = this.filterEls[i]
            el.addEventListener('change', this.clickFilter)
        }
        for (let i = 0; i < this.sortTriggers.length; i++) {
            const el = this.sortTriggers[i]
            const thisClass = el.dataset.class
            el.addEventListener('click', (e) => {
                if (el.classList.contains('active')) { e.preventDefault(); e.stopPropagation(); return }
                this.gridWrapper.querySelector('.sort-trigger.active').classList.remove('active')
                el.classList.add('active')
                this.grid.dataset.order = thisClass
                if (thisClass === 'default') {
                    this.gridWrapper.classList.remove('sorted')
                } else {
                    this.gridWrapper.classList.add('sorted')
                }
            })
        }

        /**
         * PRICE RANGE EVENTS
         **/
        this.textInputLowerBound.addEventListener('focus', () => {
            this.textInputLowerBound.select();
        });
        this.textInputHigherBound.addEventListener('focus', () => {
            this.textInputHigherBound.select();
        });
        this.textInputLowerBound.addEventListener('change', (event) => {
            event.target.value = Math.max(Math.min(parseInt(event.target.value), parseInt(this.textInputHigherBound.value || event.target.max) - 1), event.target.min);
            this.rangeLowerBound.value = event.target.value;
            this.rangeLowerBound.parentElement.style.setProperty('--range-min', "".concat(parseInt(this.rangeLowerBound.value) / parseInt(this.rangeLowerBound.max) * 100, "%"));
            this.changePriceFilter()
        });
        this.textInputHigherBound.addEventListener('change', (event) => {
            event.target.value = Math.min(Math.max(parseInt(event.target.value), parseInt(this.textInputLowerBound.value || event.target.min) + 1), event.target.max);
            this.rangeHigherBound.value = event.target.value;
            this.rangeHigherBound.parentElement.style.setProperty('--range-max', "".concat(parseInt(this.rangeHigherBound.value) / parseInt(this.rangeHigherBound.max) * 100, "%"));
            this.changePriceFilter()
        });
        this.rangeLowerBound.addEventListener('change', (event) => {
            this.textInputLowerBound.value = event.target.value;

            this.textInputLowerBound.dispatchEvent(new Event('change', {
                bubbles: true
            }));
        });
        this.rangeHigherBound.addEventListener('change', (event) => {
            this.textInputHigherBound.value = event.target.value;

            this.textInputHigherBound.dispatchEvent(new Event('change', {
                bubbles: true
            }));
        }); // We also have to bound the two range sliders

        this.rangeLowerBound.addEventListener('input', (event) => {
            event.target.value = Math.min(parseInt(event.target.value), parseInt(this.textInputHigherBound.value || event.target.max) - 1); // Bound the value

            event.target.parentElement.style.setProperty('--range-min', "".concat(parseInt(event.target.value) / parseInt(event.target.max) * 100, "%"));
            this.textInputLowerBound.value = event.target.value;
        });
        this.rangeHigherBound.addEventListener('input', (event) => {
            event.target.value = Math.max(parseInt(event.target.value), parseInt(this.textInputLowerBound.value || event.target.min) + 1); // Bound the value

            event.target.parentElement.style.setProperty('--range-max', "".concat(parseInt(event.target.value) / parseInt(event.target.max) * 100, "%"));
            this.textInputHigherBound.value = event.target.value;
        });
    }
}
