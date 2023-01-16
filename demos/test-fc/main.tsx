import React from 'react';
import ReactDOM from 'react-dom';

const MyChildren = (props: any) => <span>{props.name}</span>;
// const jsx = (<div>Hello <MyChildren name="world"/><MyChildren name="pretty"/></div>)
// const jsx = (<div><span>hello</span></div>)

const App = () => (
	<div>
		<span>
			<MyChildren name="big-react" />
		</span>
	</div>
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<App />
);
