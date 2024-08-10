import { isArray } from "@vue/shared"
import { Dep, createDep } from "./dep-me"
import { ComputedRefImpl } from "./computed-me"

export type EffectScheduler = (...args: any[]) => any

type KeyToDepMap = Map<any, Dep>
/**
 * 收集所有依赖的 WeakMap 实例：
 * 1. `key`：响应性对象
 * 2. `value`：`Map` 对象
 * 		1. `key`：响应性对象的指定属性
 * 		2. `value`：指定对象的指定属性的 执行函数
 */
const targetMap = new WeakMap<any, KeyToDepMap>()

/**
* effect 函数
* @param fn 执行方法
* @returns 以 ReactiveEffect 实例为 this 的执行函数
*/
export function effect<T = any>(fn: () => T) {
  // 生成 ReactiveEffect 实例
  const _effect = new ReactiveEffect(fn)
  // 执行 run 函数
  _effect.run()
}


/**
* 单例的，当前正在激活的 effect
*/
export let activeEffect: ReactiveEffect | any

/**
* 响应性触发依赖时的执行类
*/
export class ReactiveEffect<T = any> {
  computed?: ComputedRefImpl<T>
  constructor(public fn: () => T, public scheduler: EffectScheduler | null = null) {}

  run() {
    // 为 activeEffect 赋值
    activeEffect = this

    // 执行 fn 函数
    return this.fn()
  }
}


/**
* 用于收集依赖的方法
* @param target WeakMap 的 key
* @param key 代理对象的 key，当依赖被触发时，需要根据该 key 获取
*/
export function track(target: object, key: unknown) {
  console.log('track: 收集依赖')
  // 如果当前不存在执行函数，则直接 return
  if (!activeEffect) {
    return
  }
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  
  let dep = depsMap.get(key)
  if (!dep) {
    dep = createDep()
    depsMap.set(key, dep)
  }

  trackEffects(dep)
}

export function trackEffects (dep: Dep) {
  dep.add(activeEffect!)
}


/**
 * 派发更新的方法
 * @param target WeakMap 的 key
 * @param key 代理对象的 key，当依赖被触发时，需要根据该 key 获取
 * @param newValue 指定 key 的最新值
 * @param oldValue 指定 key 的旧值
 */
export function trigger(
  target: object,
  key?: unknown,
  newValue?: unknown
) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  const dep: Dep | undefined = depsMap.get(key)
  if (!dep) return
  triggerEffects(dep)
}

export function triggerEffects(dep: Dep) {
  const effects = isArray(dep) ? dep : [...dep]
  // for (const effect of effects) {
  //   triggerEffect(effect)
  // }
  // 不在依次触发，而是先触发所有的计算属性依赖，再触发所有的非计算属性依赖
	for (const effect of effects) {
		if (effect.computed) {
			triggerEffect(effect)
		}
	}
	for (const effect of effects) {
		if (!effect.computed) {
			triggerEffect(effect)
		}
	}
}

export function triggerEffect(effect: ReactiveEffect) {
  console.log('trigger: 触发依赖')
  if (effect.scheduler) {
    effect.scheduler()
  } else {
    effect.run()
  }
}
