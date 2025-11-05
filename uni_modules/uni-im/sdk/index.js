import init from './init/index.js';
import methods from './methods/index.js';
import state from './state/index.js';
import utils from './utils/index.js';
import ext from './ext/index.js';

const uniIm = utils.deepAssign(state,methods,{init,utils},ext,{
  mapState(keys = []) {
    let obj = {}
    keys.forEach((key) => {
      let keyName = key,
        keyCName = false
      if (key.includes(' as ')) {
        let _key = key.trim().split(' as ')
        keyName = _key[0]
        keyCName = _key[1]
      }
      obj[keyCName || keyName] = function () {
        return state[keyName]
      }
    })
    return obj
  }
})

export default uniIm