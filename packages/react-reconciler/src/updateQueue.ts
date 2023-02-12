import { Action } from 'shared/ReactTypes';
import { Dispatch } from 'react/src/currentDispatcher';

// 代表更新的数据结构 (this.setState())
export interface Update<State> {
	action: Action<State>;
}

// 消费Update的数据结构
export interface UpdateQueue<State> {
	// 为什么使用这种结构？
	// 因为这种结构可以在wip Fiber和current Fiber中共用同一个updateQueue
	shared: {
		pending: Update<State> | null;
	};
	dispatch: Dispatch<State> | null;
}

export const createUpdate = <State>(action: Action<State>): Update<State> => {
	return {
		action
	};
};

// 初始化UpdateQueue实例的方法
export const createUpdateQueue = <State>() => {
	return {
		shared: {
			pending: null
		},
		dispatch: null
	} as UpdateQueue<State>;
};

// 往UpdateQueue中增加Update
export const enqueueUpdate = <State>(
	updateQueue: UpdateQueue<State>,
	update: Update<State>
) => {
	updateQueue.shared.pending = update;
};

// UpdateQueue消费Update的方法
export const processUpdateQueue = <State>(
	baseState: State,
	pendingUpdate: Update<State> | null
): { memoizedState: State } => {
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memoizedState: baseState
	};
	if (pendingUpdate !== null) {
		const action = pendingUpdate.action;
		if (action instanceof Function) {
			// baseState: 1 update (x) => 4x -> memoizedState 4
			result.memoizedState = action(baseState);
		} else {
			// baseState: 1 update 2 -> memoizedState 2
			result.memoizedState = action;
		}
	}
	return result;
};
