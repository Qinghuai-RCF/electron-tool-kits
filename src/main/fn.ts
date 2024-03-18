import { initFnMain } from './fn_main'
import { initFn1 } from './fn_1'

export const initFn = (mainWindow) => {
  initFnMain()
  initFn1(mainWindow)
}
