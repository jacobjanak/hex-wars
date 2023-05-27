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
			hexWidth: 100, // constant
			activeHex: null,
			isClickMenuOpen: false,
			clickMenuStyle: {},
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
				points: 0,
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
			this.clickMenuStyle.display = 'none';
		},

		clickHex(hex) {
			this.hoverHex(hex);
			this.isClickMenuOpen = true;
			this.clickMenuStyle = {
				top: this.activeHex.style.top,
				left: this.activeHex.style.left,
				display: 'block',
			};
		},

		createUser(username) {
			let id;
			do {id = this.generateId()} while (id in this.users);

			const user = {
				id,
				username,
				hexes: [],
				points: 0,
				color: this.generateRandomColor(),
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
				this.giveUserStarterHex(user);
				return;
			}

			const hex = hexes[Math.floor(Math.random() * hexes.length)];
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

		generateRandomColor() {
			return colors[Math.floor(Math.random() * colors.length)];
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