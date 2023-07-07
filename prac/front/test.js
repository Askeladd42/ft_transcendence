alert('test subject');

function formatName(usr) {
	return usr.firstName + ' ' + usr.lastName;
}

const usr = {
	firstName: 'Larry', lastName: 'Lafair'
};

//const elm =<h1>Bonjour, {formatName(usr)} !</h1>;

class	NameDisplay extends React.Component {
	render() {
		return React.createElement('div', {className: 'name-display'},
		React.createElement('h1', 'Bonjour, {formatName(usr)} !'),
		React.createElement('ul', formatName(usr))
		);
	}
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<NameDisplay />);