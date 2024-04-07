import { initFnMain } from './fn_main'
import { initFn1 } from './fn_1'
import { initFn2 } from './fn_2'

export const initFn = (mainWindow) => {
  console.log('开始初始化功能')
  initFnMain(mainWindow)
  initFn1(mainWindow)
  initFn2(mainWindow)
}
