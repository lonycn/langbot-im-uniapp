import appEvent from '../utils/appEvent.js';
export default function(callback){
  let onAppActivateIndex = 0
  appEvent.onAppActivate(async () => {
    // console.log('onAppActivate')
    onAppActivateIndex++
    callback(true,onAppActivateIndex)
  })
  appEvent.onAppDeactivate(async () => {
    // console.log('onAppDeactivate')
    callback(false,onAppActivateIndex)
  })
}