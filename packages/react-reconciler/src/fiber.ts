import { Props, Key, Ref } from 'shared/ReactTypes';
import { WorkTag } from './workTags';
import { NoFlags, Flags } from './fiberFlags';

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
	alternate: FiberNode | null;
	flags: Flags;

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

		this.alternate = null;
		// 副作用
		this.flags = NoFlags;
	}
}
