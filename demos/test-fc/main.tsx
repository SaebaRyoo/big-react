import React, { useState } from 'react';
import ReactDOM from 'react-dom';

const MyChildren = (props: any) => <span>{props.name}</span>;
// const jsx = (<div>Hello <MyChildren name="world"/><MyChildren name="pretty"/></div>)
// const jsx = (<div><span>hello</span></div>)

const App = () => {
	const [num, setNum] = useState(100);
	const [flag, setFlag] = useState(true);
	let num1;
	if (flag) {
		const [num2, setNum1] = useState(1001);
		num1 = num2;
	}
	window.setNum = setNum;
	console.log('num: ', num);
	console.log('num1: ', num1);
	return (
		<div
			onClickCapture={() => {
				setFlag(false);
				setNum(num + 1);
			}}
		>
			<span>
				<MyChildren name={num} />
			</span>
		</div>
	);
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<App />
);
