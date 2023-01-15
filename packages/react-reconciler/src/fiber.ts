import { Props, Key, Ref } from 'shared/ReactTypes';
import { WorkTag, FunctionComponent, HostComponent } from './workTags';
import { NoFlags, Flags } from './fiberFlags';
import { Container } from 'hostConfig';
import { ReactElementType } from '../../shared/ReactTypes';

export class FiberNode {
	type: any;
	tag: WorkTag;
	pendingProps: Props;
	key: Key;
	stateNode: any;
	ref: Ref;

	return: FiberNode | null;
	sibling: FiberNode | null;

	child: FiberNode | null;
	index: number;

	memoizedProps: Props | null;
	memoizedState: any;
	alternate: FiberNode | null;
	flags: Flags;
	subtreeFlags: Flags;
	updateQueue: unknown;

	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		// 实例
		this.tag = tag;
		this.key = key;
		// 比如对于 HostComponent 如果是个<div>，那么就保存这个div的DOM
		this.stateNode = null;

		// 比如对于 FunctionComponent，保存的就是它本身，如果是一个宿主元素<div>,那么这个type就是'div'
		this.type = null;

		// 指向父节点(因为FiberNode不仅是存储单元，还是工作单元，所以命名为return表示到下一个工作节点，而不是parent)
		// 构成树状结构
		this.return = null;
		this.sibling = null;
		this.child = null;
		this.index = 0;

		this.ref = null;

		// 作为工作单元
		this.pendingProps = pendingProps; // 当前工作单元刚开始准备工作时的props
		this.memoizedProps = null; // 当前工作单元工作完后的props
		this.memoizedState = null;
		this.updateQueue = null;

		// 用于current FiberNode和 wip FiberNode切换，如果当前的Fiber是current,
		// 那alternate指向wip,如果当前的FiberNode是wip，那alternate指向current(双缓存)
		this.alternate = null;
		// 副作用
		this.flags = NoFlags;
		this.subtreeFlags = NoFlags;
	}
}

export class FiberRootNode {
	container: Container;
	current: FiberNode;
	finishedWork: FiberNode | null;
	constructor(container: Container, hostRootFiber: FiberNode) {
		// 保存宿主环境的RootElement
		this.container = container;
		this.current = hostRootFiber;
		hostRootFiber.stateNode = this;
		this.finishedWork = null;
	}
}

export const createWorkInProgres = (
	current: FiberNode,
	pendingProps: Props
): FiberNode => {
	// 由于双缓存机制，这里每次都获取另外一个FiberNode
	let wip = current.alternate;
	if (wip === null) {
		// mount
		wip = new FiberNode(current.tag, pendingProps, current.key);
		wip.stateNode = current.stateNode;

		wip.alternate = current;
		current.alternate = wip;
	} else {
		// update
		wip.pendingProps = pendingProps;
		// 更新副作用
		wip.flags = NoFlags;
		wip.subtreeFlags = NoFlags;
	}
	wip.type = current.type;
	wip.updateQueue = current.updateQueue;
	wip.child = current.child;
	wip.memoizedProps = current.memoizedProps;
	wip.memoizedState = current.memoizedState;
	return wip;
};

export function createFiberFromElement(element: ReactElementType) {
	const { type, key, props } = element;

	let fiberTag: WorkTag = FunctionComponent;

	if (typeof type === 'string') {
		// 宿主元素的type为string
		fiberTag = HostComponent;
	} else if (typeof type !== 'function' && __DEV__) {
		console.warn('未定义的类型', element);
	}

	const fiber = new FiberNode(fiberTag, props, key);
	fiber.type = type;
	return fiber;
}
