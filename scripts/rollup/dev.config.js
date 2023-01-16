import reactDomConfig from './react-dom.config';
import reactConfis from './react.config';

export default () => {
	return [...reactConfis, ...reactDomConfig];
};
