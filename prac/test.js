function formatName(usr) {
	return usr.firstName + ' ' + usr.lastName;
}

const usr = {
	firstName: 'Larry', lastName: 'Lafair'
};

const root = ReactDOM.createRoot(document.getElementById('root'));
const elm =<h1>Bonjour, {formatName(usr)} !</h1>;
root.render(elm)