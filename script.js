const colors = [
	'maroon',
	'red',
	'purple',
	'fuchsia',
	'lime',
	'olive',
	'yellow',
	'navy',
	'blue',
	'teal',
	'aqua',
	'aliceblue',
	'aqua',
	'aquamarine',
	'azure',
	'beige',
	'bisque',
	'black',
	'blanchedalmond',
	'blue',
	'blueviolet',
	'brown',
	'burlywood',
	'cadetblue',
	'chartreuse',
	'chocolate',
	'coral',
	'cornflowerblue',
	'cornsilk',
	'crimson',
	'cyan',
	'darkblue',
	'darkcyan',
	'darkgoldenrod',
	'darkgray',
	'darkgrey',
	'darkkhaki',
	'darkmagenta',
	'darkorange',
	'darkorchid',
	'darkred',
	'darksalmon',
	'darkslateblue',
	'darkslategray',
	'darkslategrey',
	'darkturquoise',
	'darkviolet',
	'deeppink',
	'deepskyblue',
	'dimgray',
	'dimgrey',
	'dodgerblue',
	'firebrick',
	'fuchsia',
	'gainsboro',
	'gold',
	'goldenrod',
	'gray',
	'grey',
	'honeydew',
	'hotpink',
	'indianred',
	'indigo',
	'ivory',
	'khaki',
	'lavender',
	'lavenderblush',
	'lemonchiffon',
	'lightblue',
	'lightcoral',
	'lightcyan',
	'lightgoldenrodyellow',
	'lightgray',
	'lightgrey',
	'lightpink',
	'lightsalmon',
	'lightskyblue',
	'lightslategray',
	'lightslategrey',
	'lightsteelblue',
	'lightyellow',
	'lime',
	'linen',
	'magenta',
	'maroon',
	'mediumaquamarine',
	'mediumblue',
	'mediumorchid',
	'mediumpurple',
	'mediumslateblue',
	'mediumturquoise',
	'mediumvioletred',
	'midnightblue',
	'mintcream',
	'mistyrose',
	'moccasin',
	'navy',
	'oldlace',
	'olive',
	'olivedrab',
	'orange',
	'orangered',
	'orchid',
	'palegoldenrod',
	'paleturquoise',
	'palevioletred',
	'papayawhip',
	'peachpuff',
	'peru',
	'pink',
	'plum',
	'powderblue',
	'purple',
	'red',
	'rosybrown',
	'royalblue',
	'saddlebrown',
	'salmon',
	'sandybrown',
	'seashell',
	'sienna',
	'silver',
	'skyblue',
	'slateblue',
	'slategray',
	'slategrey',
	'snow',
	'steelblue',
	'tan',
	'teal',
	'thistle',
	'tomato',
	'turquoise',
	'violet',
	'wheat',
	'yellow'
];

const defaultColor = 'green';


const app = Vue.createApp({
	el: '#app',

	data() {
		return {
			users: {},
			hexes: {},
			honeycombRadius: 0,
			cycles: 0,

			// UI
			hexWidth: 100, // constant
			activeHex: null,
			clickedHexKey: null,
		};
	},

	computed: {
		hexHeight() {
			return this.hexWidth * 1.16;
		},

		hexCount() {
			return Object.keys(this.hexes).length;
		},

		gridStyle() {
			return {
				marginTop: this.honeycombRadius * this.hexHeight + 'px',
				marginLeft: this.honeycombRadius * this.hexWidth + 'px',
			};
		},

		activeUser() {
			return this.getUser(this.activeHex);
		},
	},

	methods: {
		createRing() {
			if (this.honeycombRadius === 0) {
				this.createHex(0, 0, 0);
			} else {
				let q = 0;
				let r = this.honeycombRadius * -1;
				let s = this.honeycombRadius;

				do {this.createHex(q++, r, s--)} while (s > 0);
				do {this.createHex(q, r++, s--)} while (r < 0);
				do {this.createHex(q--, r++, s)} while (q > 0);
				do {this.createHex(q--, r, s++)} while (s < 0);
				do {this.createHex(q, r--, s++)} while (r > 0);
				do {this.createHex(q++, r--, s)} while (q < 0);
			}

			this.honeycombRadius++;
		},

		createHex(q, r, s) {
			const hex = {
				resources: 0,
				points: 0,
				troops: {
					warriors: 0,
					guards: 0,
				},
				user: null,
				q,
				r,
				s,
				radius: Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) + 1,
				style: this.getHexStyles(q, r, s),
			};

			const key = this.hashHex(hex);
			this.hexes[key] = hex;
		},

		hashHex(hex) {
			return `${hex.q},${hex.r},${hex.s}`;
		},

		hasUser(hex) {
			return !!hex.user;
		},

		isOuterRing(hex) {
			return hex.radius === this.honeycombRadius;
		},

		getHex(q, r, s) {
			return this.hexes[this.hashHex({ q, r, s })];
		},

		getNeighbourHashes(hex) {
			const { q, r, s } = hex;
			const neighbors = [];

			neighbors.push(this.hashHex({ q: q + 1, r: r - 1, s: s }));
			neighbors.push(this.hashHex({ q: q + 1, r: r, s: s - 1 }));
			neighbors.push(this.hashHex({ q: q - 1, r: r + 1, s: s }));
			neighbors.push(this.hashHex({ q: q, r: r + 1, s: s - 1 }));
			neighbors.push(this.hashHex({ q: q - 1, r: r, s: s + 1 }));
			neighbors.push(this.hashHex({ q: q, r: r - 1, s: s + 1 }));

			return neighbors.filter(hash => hash in this.hexes);
		},

		getNeighbourHexes(hex) {
			return this.getNeighbourHashes(hex).map(hash => this.hexes[hash]);
		},

		getHexStyles(q, r, s) {
			let x = q * this.hexWidth;
			let y = (r - s) / 1.732 * this.hexWidth;

			const style = {
				left: x + 'px',
				top: y + 'px',
				backgroundColor: defaultColor,
			};

			return style;
		},

		hoverHex(hex) {
			this.activeHex = hex;
		},

		unhoverHex() {
			this.activeHex = null;
			this.clickedHexKey = null;
		},

		clickHex(hex) {
			this.hoverHex(hex);
			this.clickedHexKey = this.hashHex(hex);
		},

		isClicked(hexKey) {
			return this.clickedHexKey === hexKey;
		},

		createUser(username) {
			let id;
			do {id = this.generateId()} while (id in this.users);

			const user = {
				id,
				username,
				hexes: [],
				points: 0,
				color: this.randomElement(colors),
				stats: {
					victories: 0,
					defeats: 0,
					eliminations: 0,
					weightedEliminations: 0,
					conquers: 0,
					timesConquered: 0,
					restarts: 0,
				},
			};

			this.users[id] = user;
			this.giveUserStarterHex(user);
		},

		getUser(hex) {
			return this.users[hex.user];
		},

		giveUserStarterHex(user) {
			const hexes = [];
			for (const hex of Object.values(this.hexes)) {
				// Checking isOuterRing in case an inner hex has been abandoned
				if (!this.hasUser(hex) && this.isOuterRing(hex)) {
					hexes.push(hex);
				}
			}

			if (hexes.length === 0) {
				this.createRing();
				return this.giveUserStarterHex(user);
			}

			const hex = this.randomElement(hexes);
			this.addResources(hex);
			this.giveUserHex(user, hex);
		},

		giveUserHex(user, hex) {
			user.hexes.push(this.hashHex(hex));
			hex.user = user.id;
			hex.style.backgroundColor = user.color;
		},

		generateId() {
			return Math.random().toString(16).slice(2);
		},

		randomNumber(min, max) {
			return Math.floor(Math.random() * (max - min) + min);
		},

		randomElement(arr) {
			return arr[this.randomNumber(0, arr.length)];
		},

		addResources(hex) {
			if (!this.hasUser(hex)) return;
			hex.resources += this.randomNumber(1, 7) + this.randomNumber(1, 7);
			// TODO: log this
		},

		computerSpendResources(hex) {
			if (!this.hasUser(hex)) return;

			// Points vs. troops distribution
			const points = this.randomNumber(0, hex.resources + 1);
			const troops = hex.resources - points;

			// Troop type distribution
			const warriors = this.randomNumber(0, troops + 1);
			const guards = troops - warriors;

			this.addPoints(hex, points);
			this.addTroops(hex, { warriors, guards });
		},

		addPoints(hex, count) {
			hex.resources -= count;
			hex.points += count;
			this.getUser(hex).points += count;
		},

		addTroops(hex, troops) {
			for (const [type, count] of Object.entries(troops)) {
				hex.troops[type] += count;
				hex.resources -= count;
			}
		},

		computerAttack(attackerHex) {
			if (!this.hasUser(attackerHex)) return;
			if (!attackerHex.troops.warriors) return;

			if (this.randomNumber(0, 10) === 0) {
				const neighbours = this.getNeighbourHexes(attackerHex);
				const enemyNeighbours =	neighbours.filter(h => this.hasUser(h) && h.user !== attackerHex.user); // TODO: should be a method, along with isAlly
				if (enemyNeighbours.length) {
					const defenderHex = this.randomElement(enemyNeighbours);
					this.attack(attackerHex, defenderHex, { warriors: attackerHex.troops.warriors });
				}
			}
		},

		// TODO: make attacker and defender an object instead of having 8 different variables
		attack(attHex, defHex, attTroops) {
			['warriors', 'guards'].forEach(type => attTroops[type] ??= 0); // TODO: don't hard-code
			const defTroops = defHex.troops; // TODO: probably bad that attTroops isn't by reference but this is

			// Calculate result
			const attPower = attTroops.warriors * 2 + attTroops.guards;
			const defPower = defTroops.guards * 2 + defTroops.warriors;
			
			let result = attPower - defPower;
			if (result === 0) result = Math.random() < 0.5 ? -1 : 1;
			const winner = result > 0 ? 'attacker' : 'defender';

			// Calculate surviving troops
			const attSurvivors = { warriors: 0, guards: 0 }; // TODO: don't hard-code, make method
			const defSurvivors = { warriors: 0, guards: 0 };

			if (result > 0) {
				attSurvivors.guards = Math.min(attTroops.guards, result);
				result -= attSurvivors.guards;

				if (result > 0) {
					attSurvivors.warriors = Math.ceil(result / 2);
				}
			}
			else if (result < 0) {
				result *= -1;
				defSurvivors.warriors = Math.min(defTroops.warriors, result);
				result -= defSurvivors.warriors;

				if (result > 0) {
					defSurvivors.guards = Math.ceil(result / 2);
				}
			}

			// Update data
			attHex.troops.warriors -= attTroops.warriors - attSurvivors.warriors;
			attHex.troops.guards -= attTroops.guards - attSurvivors.guards;
			defHex.troops.warriors -= defTroops.warriors - defSurvivors.warriors;
			defHex.troops.guards -= defTroops.guards - defSurvivors.guards;
			// TODO: steal resources/points

			// Log results
			const attacker = this.getUser(attHex);
			const defender = this.getUser(defHex);

			if (winner === 'attacker') {
				attacker.stats.victories++;
				defender.stats.defeats++;
			} else {
				attacker.stats.defeats++;
				defender.stats.victories++;
			}

			// TODO: do as defender/as attacker instead
			// TODO: beautify
			attacker.stats.eliminations += ['warriors', 'guards'].reduce((acc, type) => (
				acc + (defTroops[type] - defSurvivors[type])
			), 0);

			defender.stats.eliminations += ['warriors', 'guards'].reduce((acc, type) => (
				acc + (attTroops[type] - attSurvivors[type])
			), 0);
		},

		runCycle() {
			const hexes = Object.values(this.hexes);
			hexes.forEach(hex => this.computerSpendResources(hex));
			hexes.forEach(hex => this.computerAttack(hex));
			hexes.forEach(hex => this.addResources(hex));
			this.cycles++;
		},
	},

	mounted() {
		for (let i = 0; i < 4; i++) {
			this.createUser('John Doe' + i);
			this.createUser('Foo Bar' + i);
			this.createUser('Lorem' + i);
			this.createUser('Ipsum' + i);
		}
	},
});

app.mount('#app');