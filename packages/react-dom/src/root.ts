import { Container } from './hostConfig';
import { createContainer } from 'react-reconciler/src/fiberReconciler';
import { ReactElementType } from 'shared/ReactTypes';
import { updateContainer } from 'react-reconciler/src/fiberReconciler';
import { initEvent } from './SyntheticEvent';
export function createRoot(container: Container) {
	// 创建fiberRootNode(fiberRoot)，整个应用的根节点
	const root = createContainer(container);

	return {
		render(element: ReactElementType) {
			initEvent(container, 'click');
			updateContainer(element, root);
		}
	};
}
