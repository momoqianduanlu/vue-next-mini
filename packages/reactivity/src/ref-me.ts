import { createDep, Dep } from './dep-me'
import { toReactive } from './reactive-me'
import { activeEffect, trackEffects, triggerEffects } from './effect-me'

export interface isRef<T = any> { value: T }

export function ref(value?: unknown) {
  return createRef(value, false)
}

function createRef(rawValue: unknown, shallow: boolean) {
  if (isRef(rawValue)) {
    return rawValue
  }
  return new RefImpl(rawValue, shallow)
}

class RefImpl<T> {
  private _value: T

  public dep?: Dep = undefined

  // 是否为 ref 类型数据的标记
	public readonly __v_isRef = true

  private _rawValue: T

  constructor(value: T, public readonly __v_isShallow: boolean) {
    // 如果 __v_isShallow 为 true，则 value 不会被转化为 reactive 数据，即如果当前 value 为复杂数据类型，则会失去响应性。对应官方文档 shallowRef ：https://cn.vuejs.org/api/reactivity-advanced.html#shallowref
		this._value = __v_isShallow ? value : toReactive(value)

    // 原始数据
		this._rawValue = value
  }

  get value() {
    trackRefValue(this)
    return this._value 
  }

  set value(newVal) {
    /**
		 * newVal 为新数据
		 * this._rawValue 为旧数据（原始数据）
		 * 对比两个数据是否发生了变化
		 */
		if (hasChanged(newVal, this._rawValue)) {
			// 更新原始数据
			this._rawValue = newVal
			// 更新 .value 的值
			this._value = toReactive(newVal)
			// 触发依赖
			triggerRefValue(this)
		}
  }
}

export function trackRefValue(ref) {
  if (activeEffect) {
    trackEffects(ref.dep || (ref.dep = createDep()))
  }
}

/**
 * 为 ref 的 value 进行触发依赖工作
 */
export function triggerRefValue(ref) {
	if (ref.dep) {
		triggerEffects(ref.dep)
	}
}

function isRef(r: any): r is isRef {
  return !!(r && r.__is_isRef === true)
}

/**
 * 对比两个数据是否发生了改变
 */
export const hasChanged = (value: any, oldValue: any): boolean =>
	!Object.is(value, oldValue)
