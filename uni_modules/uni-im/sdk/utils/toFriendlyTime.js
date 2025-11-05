// 以下代码来源openai创作后修改
export default function toFriendlyTime(timestamp, h12 = false) {
  const now = new Date()
  const date = new Date(timestamp)

  // 在未来（允许 30 秒的误差）
  if (date > now + 1000 * 30) {
    return '未来'
  }

  const todayBegin = new Date().setHours(0, 0, 0, 0)

  // 上午还是下午、中午
  const ampm = h12 ? (date.getHours() >= 12 ? '下午 ' : '上午 ') : ''
  const hour = h12 ? (date.getHours() % 12) : date.getHours()
  const minute = date.getMinutes().toString().padStart(2, '0')

  // 在今天
  if (timestamp >= todayBegin) {
    const secondsAgo = Math.floor((now - date) / 1000)

    // 小于1分钟，显示刚刚
    if (secondsAgo < 60) {
      return '刚刚'
    }

    // 小于60分钟，显示具体几分钟前
    if (secondsAgo < 60 * 60) {
      const minutes = Math.floor(secondsAgo / 60)
      return `${minutes}分钟前`
    }

    // 小于2小时，显示具体几小时+分钟前
    if (secondsAgo < 60 * 60 * 2) {
      const hours = Math.floor(secondsAgo / (60 * 60))
      const minutes = Math.floor((secondsAgo - hours * 60 * 60) / 60)
      if (minutes) {
        return `${hours}小时 ${minutes}分钟前`
      } else {
        return `${hours}小时前`
      }
    }

    return `${ampm}${hour}:${minute}`
  }

  // 在昨天
  if (timestamp >= todayBegin - 1000 * 60 * 60 * 24) {
    return `昨天 ${ampm}${hour}:${minute}`
  }

  // 在前天
  if (timestamp >= todayBegin - 1000 * 60 * 60 * 48) {
    return `前天 ${ampm}${hour}:${minute}`
  }

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const yearBegin = new Date().setMonth(0, 0) // 可能存在不超过一天的误差

  // 在同一年
  if (timestamp >= yearBegin) {
    // 在同一周
    const firstDayOfWeek = new Date()
    firstDayOfWeek.setDate(firstDayOfWeek.getDate() - firstDayOfWeek.getDay())
    const weekBegin = firstDayOfWeek.setHours(0, 0, 0, 0)
    if (timestamp >= weekBegin) {
      const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      return `${days[date.getDay()]} ${ampm}${hour}:${minute}`
    }

    return `${month}/${day} ${ampm}${hour}:${minute}`
  }

  // 不在同一年
  return `${year}/${month}/${day} ${ampm}${hour}:${minute}`
}

// let now = Date.now()
// let times = [
//   now,
//   now - 1000 * 59,
//   now - 1000 * 60,
//   now - 1000 * 60 * 29,
//   now - 1000 * 60 * 59,
//   now - 1000 * 60 * 60,
//   now - 1000 * 60 * 60 * 3,
//   now - 1000 * 60 * 60 * 12,
//   now - 1000 * 60 * 60 * 23,
//   now - 1000 * 60 * 60 * 24,
//   now - 1000 * 60 * 60 * 30,
//   now - 1000 * 60 * 60 * 47,
//   now - 1000 * 60 * 60 * 48,
//   now - 1000 * 60 * 60 * 24 * 3,
//   now - 1000 * 60 * 60 * 24 * 4,
//   now - 1000 * 60 * 60 * 24 * 5,
//   now - 1000 * 60 * 60 * 24 * 6,
//   now - 1000 * 60 * 60 * 24 * 7,
//   now - 1000 * 60 * 60 * 24 * 8,
//   now - 1000 * 60 * 60 * 24 * 12,
//   now - 1000 * 60 * 60 * 24 * 36,
//   now - 1000 * 60 * 60 * 24 * 48,
//   now - 1000 * 60 * 60 * 24 * 100,
//   now - 1000 * 60 * 60 * 24 * 400,
// ]
// times.forEach(ts => {
//   console.log(`${new Date(ts)} - ${toFriendlyTime(ts)}`)
// })
