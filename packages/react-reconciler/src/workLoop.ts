import { beginWork } from './beginWork';
import { completeWork } from './completeWork';
import { createWorkInProgres, FiberNode, FiberRootNode } from './fiber';
import { HostRoot } from './workTags';

// 当前工作单元
let workInProgress: FiberNode | null = null;

function prepareFreshStack(root: FiberRootNode) {
	workInProgress = createWorkInProgres(root.current, {});
}

// 在合适的时机调用该函数，完成组件的mount和update
export function scheduleUpdateOnFiber(fiber: FiberNode) {
	// TODO: 调度功能
	const root = markUpdateFromFiberToRoot(fiber);
	renderRoot(root);
}

function markUpdateFromFiberToRoot(fiber: FiberNode) {
	let node = fiber;
	let parent = node.return;
	while (parent !== null) {
		// parent !== null 表示是update阶段，那么需要一直向上查找到root节点
		node = parent;
		parent = node.return;
	}

	if (node.tag === HostRoot) {
		// 已经到了根节点
		return node.stateNode;
	}
	return null;
}

function renderRoot(root: FiberRootNode) {
	// 初始化
	prepareFreshStack(root);

	// 递归流程
	do {
		try {
			workLoop();
			break;
		} catch (e) {
			if (__DEV__) {
				console.warn('workLoop发生错误', e);
			}
			// 重置
			workInProgress = null;
		}
	} while (true);

	const finishedWork = root.current.alternate;
	root.finishedWork = finishedWork;

	// 根据wip fiberNode树中的flags执行具体操作
	// commitRoot(root);
}

function workLoop() {
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress);
	}
}

function performUnitOfWork(fiber: FiberNode) {
	// 子fiber或者是null
	const next = beginWork(fiber);
	fiber.memoizedProps = fiber.pendingProps;

	if (next === null) {
		// 递归到最深层
		complteUnitOfWork(fiber);
	} else {
		workInProgress = next;
	}
}

function complteUnitOfWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber;
	do {
		completeWork(node);
		const sibling = node.sibling;

		// 是否有兄弟节点
		if (sibling !== null) {
			workInProgress = sibling;
			return;
		}
		// 不存在，则递归继续向上
		node = node.return;
		workInProgress = node;
	} while (node !== null);
}
