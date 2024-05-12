import { initFnMain } from './fn_main'
import { initFn1 } from './fn_1'
import { initFn2 } from './fn_2'
import { initAudioExtraction } from './fn_audioExtraction'

export const initFn = (win) => {
  console.log('开始 初始化功能')
  initFnMain(win)
  initFn1(win)
  initFn2(win)
  initAudioExtraction(win)
  console.log('结束 初始化功能')
}
