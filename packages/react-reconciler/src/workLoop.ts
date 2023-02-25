import { beginWork } from './beginWork';
import {
	comitMutationEffects,
	commitHookEffectListCreate,
	commitHookEffectListUnMount
} from './commitWork';
import { completeWork } from './completeWork';
import {
	createWorkInProgres,
	FiberNode,
	FiberRootNode,
	PendingPassiveEffects
} from './fiber';
import { MutationMask, NoFlags, PassiveMask } from './fiberFlags';
import { HostRoot } from './workTags';
import { scheduleMicroTask } from '../../react-dom/src/hostConfig';
import {
	getHighestPriorityLane,
	Lane,
	markRootFinished,
	mergeLanes,
	NoLane,
	SyncLane
} from './fiberLanes';
import { scheduleSyncCallback, flushSyncCallbacks } from './syncTaskQueue';
import { Passive, HookHasEffect } from './hookEffectTags';
import { commitHookEffectListdestroy } from './commitWork';
import {
	unstable_scheduleCallback as scheduleCallback,
	unstable_NormalPriority as NormalPriority
} from 'scheduler';

// 当前工作单元
let workInProgress: FiberNode | null = null;
let workInProgeresLane: Lane = NoLane;
let rootDoesHasPassiveEffects = false;

function prepareFreshStack(root: FiberRootNode, lane: Lane) {
	workInProgress = createWorkInProgres(root.current, {});
	workInProgeresLane = lane;
}

// 在合适的时机调用该函数，完成组件的mount和update
export function scheduleUpdateOnFiber(fiber: FiberNode, lane: Lane) {
	// TODO: 调度功能
	const root = markUpdateFromFiberToRoot(fiber);
	markRootUpdated(root, lane);
	ensureRootIsScheduled(root);
}

function ensureRootIsScheduled(root: FiberRootNode) {
	const updateLane = getHighestPriorityLane(root.pendingLanes);

	if (updateLane === NoLane) {
		// 没有更新
		return;
	}

	if (updateLane === SyncLane) {
		// 同步优先级 用微任务调度
		if (__DEV__) {
			console.log('在微任务中调度，优先级: ', updateLane);
		}
		// 每触发一次更新，就会在全局变量syncQueue中添加一个performSyncWorkOnRoot
		// [performSyncWorkOnRoot,performSyncWorkOnRoot,performSyncWorkOnRoot]
		scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root, updateLane));
		// 然后使用微任务进行调度，并通过全局变量isFlushingSyncQueue 只执行一次performSyncWorkOnRoot
		// 通过这样来解决批量更新中只进行一次工作循环
		scheduleMicroTask(flushSyncCallbacks);
	} else {
		// 其他优先级 用宏任务调度
	}
}

function markRootUpdated(root: FiberRootNode, lane: Lane) {
	root.pendingLanes = mergeLanes(root.pendingLanes, lane);
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

function performSyncWorkOnRoot(root: FiberRootNode, lane: Lane) {
	const nextLane = getHighestPriorityLane(root.pendingLanes);
	if (nextLane !== SyncLane) {
		// 其他比SyncLane低的优先级
		// NoLane

		// 兜底
		ensureRootIsScheduled(root);
		return;
	}
	if (__DEV__) {
		console.warn('render阶段开始');
	}
	// 初始化
	prepareFreshStack(root, lane);

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
	root.finishedLane = lane;
	workInProgeresLane = NoLane;

	// 根据wip fiberNode树中的flags执行具体操作
	commitRoot(root);
}

function commitRoot(root: FiberRootNode) {
	const finishedWork = root.finishedWork;
	if (finishedWork === null) {
		return;
	}

	if (__DEV__) {
		console.warn('commit阶段开始', finishedWork);
	}

	const lane = root.finishedLane;
	if (lane === NoLane && __DEV__) {
		console.error('commit 阶段finishedLane不应该是NoLane');
	}
	// 重置操作
	root.finishedWork = null;
	root.finishedLane = NoLane;

	// 移除lane
	markRootFinished(root, lane);

	if (
		(finishedWork.flags & PassiveMask) !== NoFlags ||
		(finishedWork.subtreeFlags & PassiveMask) !== NoFlags
	) {
		if (!rootDoesHasPassiveEffects) {
			// 防止我们多次执行commitRoot时执行多次调度
			rootDoesHasPassiveEffects = true;

			// 调度副作用

			// 调度一个回调函数 NormalPriority, 在一个setTimeout中执行回调
			scheduleCallback(NormalPriority, () => {
				// 执行副作用
				flushPassiveEffects(root.pendingPassiveEffects);
				return;
			});
		}
	}

	// 判断是否存在3个子阶段需要执行的操作

	const subtreeHasEffect =
		(finishedWork.subtreeFlags & MutationMask) !== NoFlags;

	const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;

	if (subtreeHasEffect || rootHasEffect) {
		// beforeMutation
		// mutation Placement
		comitMutationEffects(finishedWork, root);
		root.current = finishedWork;
		// layout
	} else {
		root.current = finishedWork;
	}

	rootDoesHasPassiveEffects = false;
	ensureRootIsScheduled(root);
}

function flushPassiveEffects(pendingPassiveEffects: PendingPassiveEffects) {
	pendingPassiveEffects.unmount.forEach((effect) => {
		commitHookEffectListUnMount(Passive, effect);
	});
	// 置空
	pendingPassiveEffects.unmount = [];

	pendingPassiveEffects.update.forEach((effect) => {
		commitHookEffectListdestroy(Passive | HookHasEffect, effect);
	});

	pendingPassiveEffects.update.forEach((effect) => {
		commitHookEffectListCreate(Passive | HookHasEffect, effect);
	});
	pendingPassiveEffects.update = [];

	// 对于在回调过程中触发的更新，还需要继续的处理它的流程
	flushSyncCallbacks();
}

function workLoop() {
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress);
	}
}

function performUnitOfWork(fiber: FiberNode) {
	// 子fiber或者是null
	const next = beginWork(fiber, workInProgeresLane);
	// 记录执行beginWork前的props
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
