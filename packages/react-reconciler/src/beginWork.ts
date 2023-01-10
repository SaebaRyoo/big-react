import { FiberNode } from './fiber';

// beginWork就是递归过程中的递阶段
export const beginWork = (fiber: FiberNode): FiberNode => {
	// 比较， 然后返回子FiberNode
	return fiber;
};
