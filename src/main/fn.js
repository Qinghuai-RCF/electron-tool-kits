import { initFnMain } from './fn_main'
import { initFn1 } from './fn_1'
import { initFn2 } from './fn_2'
import { initAudioExtraction } from './fn_audioExtraction'
import { initMobileComputerFileSync } from './fn_mobileComputerFileSync'

// import { initFnTest } from './fn_test'

export const initFn = async(win) => {
  console.log('开始 初始化功能')
  await initFnMain(win)
  initFn1(win)
  initFn2(win)
  initAudioExtraction(win)
  initMobileComputerFileSync(win)

  // initFnTest(win)
  console.log('结束 初始化功能')
}
