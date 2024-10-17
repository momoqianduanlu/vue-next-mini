import { ShapeFlags } from 'packages/shared/src/shapeFlags'
import { Comment, Fragment, isSameVNodeType, Text } from './vnode'

export interface RendererOptions {
  /**
   * 为指定 element 的 prop 打补丁
   */
  patchProp(el: Element, key: string, prevValue: any, nextValue: any): void
  /**
   * 为指定的 Element 设置 text
   */
  setElementText(node: Element, text: string): void
  /**
   * 插入指定的 el 到 parent 中，anchor 表示插入的位置，即：锚点
   */
  insert(el, parent: Element, anchor?): void
  /**
   * 创建指定的 Element
   */
  createElement(type: string)
  /**
   * 卸载指定dom
   */
  remove(el): void
  /**
   * 创建 Text 节点
   */
  createText(text: string)
  /**
   * 设置 text
   */
  setText(node, text): void
  /**
   * 设置 text
   */
  createComment(text: string)
}

export function createRender(options: RendererOptions) {
  return baseCreateRenderer(options)
}

function baseCreateRenderer(options: RendererOptions): any {
  const patch = (oldVNode, newVNode, container, anchor = null) => {
    if (oldVNode === newVNode) {
      return
    }

    const { type, shapeFlag } = newVNode
    switch (type) {
      case Text:
        // Text
        break
      case Comment:
        // Comment
        break
      case Fragment:
        // Fragment
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          //
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          // 组件
        }

  }
  const render = (vnode, container) => {
    if (vnode === null) {
      // TODO: 卸载
    } else {
      patch(container._vnode, vnode, container)
    }
  }
  
  return {
    render
  }
}