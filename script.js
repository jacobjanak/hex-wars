const app = Vue.createApp({
	el: '#app',

	data() {
		return {
			hexagons: {},
			radius: 0,
			hexagonSize: 100,
		};
	},

	computed: {
		hexagonCount() {
			return Object.keys(this.hexagons).length;
		},

		midpoint() {
			return this.radius * this.hexagonSize;
		},
	},

	methods: {
		initBoard() {
			for (let i = 0; i < 4; i++) {
				this.createRing();
			};
		},

		createRing() {
			let q = 0;
			let r = this.radius * -1;
			let s = this.radius;

			do {this.createHexagon(q++, r, s--)} while (s > 0);
			do {this.createHexagon(q, r++, s--)} while (r < 0);
			do {this.createHexagon(q--, r++, s)} while (q > 0);
			do {this.createHexagon(q--, r, s++)} while (s < 0);
			do {this.createHexagon(q, r--, s++)} while (r > 0);
			do {this.createHexagon(q++, r--, s)} while (q < 0);

			this.radius++;
		},

		createHexagon(q, r, s) {
			const hexagon = { q, r, s };
			const key = this.hashHexagon(hexagon);
			this.hexagons[key] = hexagon;
		},

		hashHexagon(hexagon) {
			return `${hexagon.q},${hexagon.r},${hexagon.s}`;
		},

		styleHexagon(hexagon) {
			const { q, r, s } = hexagon;

			let x = q * this.hexagonSize;
			let y = (r - s) / 1.732 * this.hexagonSize;

			const backgroundColor = `
				rgb(
					${Math.round(Math.random() * 255)},
					${Math.round(Math.random() * 255)},
					${Math.round(Math.random() * 255)}
				)
			`;

			return {
				left: (this.midpoint + x) + 'px',
				top: (this.midpoint + y) + 'px',
				backgroundColor,
			};
		},
	},

	mounted() {
		this.initBoard();
	},

});

app.mount('#app');
