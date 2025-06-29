// from https://github.com/fraudiay79/strm/blob/main/sites/antiktv.sk/antiktv.sk.config.js
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const customParseFormat = require('dayjs/plugin/customParseFormat')
const axios = require('axios')

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

module.exports = {
  site: 'antiktv.sk',
  days: 2,
  request: {
    cache: {
      ttl: 60 * 60 * 1000 // 1 hour
    }
  },
  url({ channel, date }) {
    return `https://antiktv.sk/en/epg/epg/?action=getEpgList&options[day]=${dayjs().format('YYYY-MM-DD')}&options[filters][channels][]=${channel.site_id}&isAjax=true`
  },
  parser: function ({ content }) {
    let programs = []
    const data = JSON.parse(content)

    for (const date in data.data) {
      if (Array.isArray(data.data[date])) {
        data.data[date].forEach(channelData => {
          channelData.epg.forEach(item => {
            const start = dayjs(item.Start).utc().toISOString()
            const stop = dayjs(item.Stop).utc().toISOString()
            programs.push({
              title: item.Title,
              description: item.Description || 'No description available',
              category: item.Genres?.join(', ') || null,
              icon: item.Icon,
              start,
              stop
            })
          })
        })
      }
    }

    return programs
  },
  async channels() {
    let channels = []
    const data = await axios
      .get(`https://antiktv.sk/en/epg/epg/?action=getEpgList&options[day]=${dayjs().format('YYYY-MM-DD')}&isAjax=true`)
      .then(r => r.data)
      .catch(console.log)

    const channelsArray = Object.values(data?.data?.filters?.initArray?.channels || {})

    return channelsArray.map(item => {
      return {
        lang: 'sk',
        site_id: item.id_content,
        name: item.name
      }
    })
  }
}
