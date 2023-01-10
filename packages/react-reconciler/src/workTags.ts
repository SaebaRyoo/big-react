export type WorkTag =
	| typeof FunctionComponent
	| typeof HostRoot
	| typeof HostComponent
	| typeof HostText;

export const FunctionComponent = 0; // 函数组件节点类型
export const HostRoot = 3; // 根节点类型
export const HostComponent = 5; // 宿主元素节点类型,如<div>就是浏览器这个宿主的元素
export const HostText = 6; // <div>123</div> 中的123就属于文本节点
