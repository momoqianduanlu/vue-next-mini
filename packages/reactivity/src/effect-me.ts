type KeyToDepMap = Map<any, ReactiveEffect>
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
export let activeEffect: ReactiveEffect | undefined

/**
* 响应性触发依赖时的执行类
*/
export class ReactiveEffect<T = any> {
  constructor(public fn: () => T) {}

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
  // 为指定 map，指定key 设置回调函数
  depsMap.set(key, activeEffect)
  console.log('targetMap', targetMap);
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
  console.log('trigger: 触发依赖')
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  // 依据 key，从 depsMap 中取出 value，该 value 是一个 ReactiveEffect 类型的数据
	const effect = depsMap.get(key) as ReactiveEffect
  if (!effect) return
	// 执行 effect 中保存的 fn 函数
	effect.fn()
}
