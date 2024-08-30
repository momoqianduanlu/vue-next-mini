import { isArray, isFunction, isObject, isString } from '@vue/shared'
import { ShapeFlags } from 'packages/shared/src/shapeFlags'

export interface VNode {
  __v_isVNode: true;
  key: any
	type: any
	props: any
	children: any
	shapeFlag: number
}

export function isVNode(value: any): value is VNode {
	return value ? value.__v_isVNode === true : false
}

export function createVNode (type, props, children?): VNode {
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0;

  return createBaseVNode(type, props, children, shapeFlag)
}

function createBaseVNode (type, props, children, shapeFlag) {
  const vnode = {
		__v_isVNode: true,
		type,
		props,
		shapeFlag,
		key: props?.key || null
	} as VNode

  normalizeChildren(vnode, children)

  return vnode
}

export function normalizeChildren(vnode: VNode, children: unknown) {
	let type = 0
  if (children == null) {
    children = null
  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN
  } else if (typeof children === 'object') {
		// TODO: object
	} else if (isFunction(children)) {
		// TODO: function
  } else {
		// children 为 string
		children = String(children)
		// 为 type 指定 Flags
		type = ShapeFlags.TEXT_CHILDREN
	}
  // 修改 vnode 的 chidlren
	vnode.children = children
	// 按位或赋值
	vnode.shapeFlag |= type
}