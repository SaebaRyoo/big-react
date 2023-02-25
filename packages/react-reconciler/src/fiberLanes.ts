import { FiberRootNode } from './fiber';

export type Lane = number;
export type Lanes = number; // 代表不同Lane的集合

// 使用二进制而不用1,2,3,4表示优先级是因为二进制更灵活。
// 为了兼容后面的并发更新，我们并不是选择一个优先级，而是要选择一批优先级，
// 如果用数字，那么需要定义Set或者数组，来存储优先级集合，这样会占用内存。
// 而使用二进制则只需要定义一个Lanes，通过 按位或 ” | “就可以取到优先级集合
export const SyncLane = 0b0001;
export const NoLane = 0b0000;
export const NoLanes = 0b0000;

export function mergeLanes(laneA: Lane, laneB: Lane): Lanes {
	return laneA | laneB;
}

export function requestUpdateLanes() {
	return SyncLane;
}

export function getHighestPriorityLane(lanes: Lanes): Lane {
	// 向右位移1位
	return lanes & -lanes;
}

export function markRootFinished(root: FiberRootNode, lane: Lane) {
	root.pendingLanes &= ~lane;
}
