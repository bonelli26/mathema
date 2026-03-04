import Highway from "@dogstudio/highway";

/*
    View Events for Highway

	- Products Page
    - Events are listed in their execution order
-------------------------------------------------- */
class CollectionsRenderer extends Highway.Renderer{

	onEnter(){
		// console.log("onEnter");
	}

	onEnterCompleted(){
		// bindTileFilters(document.getElementById('collection-grid'))
	}

	onLeave(){
		// console.log("onLeave");
		const filterWrapper = document.getElementById('filterWrapper')
		if (filterWrapper) {
			filterWrapper.remove()
		}
	}

	onLeaveCompleted(){
		// console.log("onLeaveCompleted");
	}
}

export default CollectionsRenderer;
