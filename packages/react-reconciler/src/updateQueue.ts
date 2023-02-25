import { Action } from 'shared/ReactTypes';
import { Dispatch } from 'react/src/currentDispatcher';
import { Lane } from './fiberLanes';

// 代表更新的数据结构 (this.setState())
export interface Update<State> {
	action: Action<State>;
	lane: Lane;
	next: Update<State> | null;
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

export const createUpdate = <State>(
	action: Action<State>,
	lane: Lane
): Update<State> => {
	return {
		action,
		lane,
		next: null
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
	const pending = updateQueue.shared.pending;
	if (pending === null) {
		// 假设传进来一个update a
		// 那么a.next -> a
		// 最终updateQueue.shared.pending = update;
		// 就相当于a与自己形成环装链表
		update.next = update;
	} else {
		// 每当插入一个新的update，这个update都会和之前的update形成一个环装链表
		// 这样的好处就是每次执行enqueueUpdate，就不会覆盖之前的update，而是形成环装链表
		// pending = b -> a -> b
		// pending = c -> a -> b -> c
		update.next = pending.next;
		pending.next = update;
	}
	// pending = b -> a -> b
	updateQueue.shared.pending = update;
};

// UpdateQueue消费Update的方法
export const processUpdateQueue = <State>(
	baseState: State,
	pendingUpdate: Update<State> | null,
	renderLane: Lane
): { memoizedState: State } => {
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memoizedState: baseState
	};
	if (pendingUpdate !== null) {
		// 第一个update
		const first = pendingUpdate.next;
		// 正在执行的update
		let pending = pendingUpdate.next as Update<any>;

		do {
			const updateLane = pending.lane;
			if (updateLane === renderLane) {
				const action = pendingUpdate.action;
				if (action instanceof Function) {
					// baseState: 1 update (x) => 4x -> memoizedState 4
					baseState = action(baseState);
				} else {
					// baseState: 1 update 2 -> memoizedState 2
					baseState = action;
				}
			} else {
				if (__DEV__) {
					console.error('不应该进入 updateLane !== renderLane 逻辑');
				}
			}
			pending = pending.next as Update<any>;
		} while (pending !== first);
	}
	result.memoizedState = baseState;
	return result;
};
