export type Flags = number;

// 使用以下代码会打印4次Placement操作
// export const NoFlags = 0b0000001;
// export const Placement = 0b0000010; // 插入
// export const Update = 0b0000100; // 更新
// export const ChildDeletion = 0b0001000; // 删除子节点
export const NoFlags = 0b0000000;
export const Placement = 0b0000001; // 插入
export const Update = 0b0000010; // 更新
export const ChildDeletion = 0b0000100; // 删除子节点

// 副作用对应的flags
export const MutationMask = Placement | Update | ChildDeletion;
