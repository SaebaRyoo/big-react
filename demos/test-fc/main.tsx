import React, { useState } from 'react';
import ReactDOM from 'react-dom';

const MyChildren = (props: any) => <span>{props.name}</span>;
// const jsx = (<div>Hello <MyChildren name="world"/><MyChildren name="pretty"/></div>)
// const jsx = (<div><span>hello</span></div>)

const App = () => {
	const [num, setNum] = useState(100);

	const arr =
		num % 2 === 0
			? [<li key="1">1</li>, <li key="2">2</li>, <li key="3">3</li>]
			: [<li key="3">3</li>, <li key="2">2</li>, <li key="1">1</li>];

	return (
		<div>
			<button
				onClick={() => {
					setNum(num + 1);
				}}
			>
				点击
			</button>
			<span>
				{/* <MyChildren name={num} /> */}
				{arr}
			</span>
		</div>
	);
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<App />
);
