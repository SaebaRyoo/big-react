import {
	appendInitialChild,
	Container,
	createInstance,
	createTextInstance
} from 'hostConfig';
import { FiberNode } from './fiber';
import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './workTags';
import { NoFlags, Update } from './fiberFlags';
import { updateFiberProps } from 'react-dom/src/SyntheticEvent';
import { Fragment } from './workTags';

// 标记更新
function markUpdate(fiber: FiberNode) {
	fiber.flags |= Update;
}

// completeWork就是递归过程中的归阶段
export const completeWork = (wip: FiberNode) => {
	// 根据比较结果添加副作用， 返回父FiberNode

	const newProps = wip.pendingProps;
	const current = wip.alternate;
	switch (wip.tag) {
		case HostComponent:
			if (current !== null && wip.stateNode) {
				// TODO: 判断属性是否修改 事件、className、style
				// 1. props是否变化{onClick: xx} -> {onClick: xxx}
				// 2. 打一个Update flag
				updateFiberProps(wip.stateNode, newProps);
			} else {
				// mount
				// 1. 构建DOM
				// const instance = createInstance(wip.type, newProps);
				const instance = createInstance(wip.type, newProps);
				// 2. 将DOM插入到DOM树中
				appendAllChildren(instance, wip);
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case HostText:
			if (current !== null) {
				// TODO: update
				const oldText = current.memoizedProps.content;
				const newText = newProps.content;
				if (oldText !== newText) {
					markUpdate(wip);
				}
			} else {
				// mount
				// 1. 构建DOM
				const instance = createTextInstance(newProps.content);
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;

		// 下面几种tag类型都只需要处理bubble
		case HostRoot:
		case FunctionComponent:
		case Fragment:
			bubbleProperties(wip);
			return null;
		default:
			if (__DEV__) {
				console.warn('未处理的completeWork情况', wip);
			}
			break;
	}
};

function appendAllChildren(parent: Container, wip: FiberNode) {
	let node = wip.child;
	// wip可能不是一个宿主元素类型，所以需要递归向下查找第一个HostComponent类型的节点。比如下面这个例子
	/**
	 * const B = () => {
	 *    return <span></span>
	 * }
	 * 要渲染<h1><B/></h1>
	 */
	while (node !== null) {
		if (node.tag === HostComponent || node.tag === HostText) {
			appendInitialChild(parent, node?.stateNode);
		} else if (node.child !== null) {
			node.child.return = node;
			node = node.child;
			continue;
		}

		if (node === wip) {
			return;
		}

		// 向上查找
		while (node.sibling === null) {
			if (node.return == null || node.return === wip) {
				return;
			}
			node = node?.return;
		}
		node.sibling.return = node.return;
		node = node.sibling;
	}
}

// 通过冒泡子节点flags到父节点的subtreeFlags，来判断这棵子树是否有副作用
function bubbleProperties(wip: FiberNode) {
	let subtreeFlags = NoFlags;
	let child = wip.child;
	while (child !== null) {
		subtreeFlags |= child.subtreeFlags;
		subtreeFlags |= child.flags;

		child.return = wip;
		child = child.sibling;
	}
	wip.subtreeFlags |= subtreeFlags;
}
