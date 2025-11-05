const crypto = require('crypto');
// 获取 uni-im 配置
const createConfig = require("uni-config-center");
const uniImConfig = createConfig({pluginId: 'uni-im'})
/**
 * 对称加密
 * @param {String} password 密码
 * @param {String} algorithm 算法
 * @param {String} key 密钥
 * @param {String} iv 向量
 * @return {Object} encrypt 加密
 * @return {
   *  {String} encrypt(message) 加密
   *  {String} decrypt(encryptedMessage) 解密
   * }
 */
class SymmetricEncryption {
    constructor(password) {
        this.password = password || uniImConfig.config('aes_key');
        if (!this.password) {
          return // 未在 uni-im 插件管理后台配置 aes_key
        }
        this.algorithm = 'aes-256-cbc';
        this.key = crypto.createHash('sha256').update(this.password).digest();
        const fixedIV = crypto.createHash('md5').update(this.password).digest('hex');
        this.iv = Buffer.from(fixedIV, 'utf8').slice(0, 16);
    }
    // 加密
    encrypt(message) {
        const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
        let encrypted = cipher.update(message, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        encrypted = "uni-im-encrypt:" + encrypted;
        return  encrypted;
    }
    // 解密
    decrypt(encryptedMessage) {
        // 判断是否有前缀，有就去掉。没有则返回原字符串
        if (encryptedMessage.indexOf("uni-im-encrypt:") === -1) {
            return encryptedMessage;
        }else{
          encryptedMessage = encryptedMessage.slice(15);
        }
        // console.error('解密----encryptedMessage',encryptedMessage)
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
        let decrypted = decipher.update(encryptedMessage, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}
module.exports = SymmetricEncryption;