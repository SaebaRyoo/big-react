import React, { useState } from 'react';
import ReactDOM from 'react-dom';

const MyChildren = (props: any) => <span>big-react</span>;
// const jsx = (<div>Hello <MyChildren name="world"/><MyChildren name="pretty"/></div>)
// const jsx = (<div><span>hello</span></div>)

const App = () => {
	const [num, setNum] = useState(100);
	window.setNum = setNum;
	return num === 3 ? (
		<div>
			<span>
				<MyChildren name={num} />
			</span>
		</div>
	) : (
		<div>{num}</div>
	);
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<App />
);
