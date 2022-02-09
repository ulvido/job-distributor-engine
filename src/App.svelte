<script lang="ts">
	// STORE
	import { metaller } from "./store";
	// COMPONENTS
	import Clients from "./components/Clients.svelte";
</script>

<div class="wrapper">
	<div class="title">JOB DISTRIBUTOR ENGINE DEMO</div>
	<div class="parite">
		<div class="parts-title">PARITE</div>
		<div class="metal-wrapper">
			{#each $metaller as metal (metal.name)}
				<div class="element">
					<div>{metal.name}:</div>
					<div>{metal.price}</div>
				</div>
			{/each}
		</div>
	</div>
	<div class="clients">
		<div class="parts-title">CLIENTS</div>
		<Clients />
	</div>
	<div class="servers">
		<div class="parts-title">SERVERS</div>
	</div>
	<div class="workers">
		<div class="parts-title">WORKERS</div>
	</div>
</div>

<style>
	.wrapper {
		display: grid;
		grid-template-areas:
			"title title title"
			"parite parite parite"
			"clients servers workers";
		gap: 10px;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		padding: 0 20px;
	}

	.title {
		grid-area: title;
		width: 100%;
		font-size: 22px;
		font-weight: 300;
		text-align: center;
		color: white;
		background-color: crimson;
		padding: 20px 0;
		border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
	}

	.parite {
		grid-area: parite;
		display: flex;
		align-items: center;
		font-family: monospace;
		font-size: 16px;
		padding: 10px;
	}

	.metal-wrapper {
		display: flex;
		align-items: center;
		padding-left: 10px;
	}

	.element {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 10px;
		padding: 0 10px;
	}

	.parts-title {
		font-size: 12px;
		letter-spacing: 2px;
		color: white;
		background: crimson;
		border-radius: 2px;
		padding: 4px 10px;
	}

	.clients {
		grid-area: clients;
		width: 100%;
	}

	.servers {
		grid-area: servers;
		width: 100%;
	}

	.workers {
		grid-area: workers;
		width: 100%;
	}
</style>
