const dayjs = require('dayjs')

module.exports = {
  site: 'guidatv.sky.it',
  days: 2,
  url: function ({ date, channel }) {
    const [env, id] = channel.site_id.split('#')
    return `https://atlantis.epgsky.com/as/schedule/${date.format('YYYYMMDD')}/${id}`
  },
  request: {
    headers: function(context) {
      return {
        'x-skyott-proposition': 'SKYQ',
        'x-skyott-provider': 'SKY',
        'x-skyott-territory': 'IT',
        'x-skyott-platform': 'PC',
        'x-skyott-device': 'COMPUTER',
        'x-skyott-agent': 'skyq.computer.pc',
        'User-Agent': 'Mozilla/5.0 (SKYQPC:24.1:IT)',
        'Accept-Encoding': 'deflate',
      }
    },
    responseType: 'arraybuffer',
    decompress: true,
  },
  parser: function (context) {
    // console.log(context.content)
    let chunkedData = context.content
      .replaceAll(/\r\n0.*\r\n/g, "")
      .split("\r\n")
      .filter(x => x.startsWith("{"))
    // console.log(chunkedData)
    const programs = []
    const data = JSON.parse(chunkedData.slice(-1).pop())
    // console.log(data)
    const items = data.schedule[0].events
    if (!items.length) return programs
    items.forEach(item => {
      programs.push({
        title: item.t,
        description: item.sy,
        // category: parseCategory(item),
        season: parseSeason(item),
        episode: parseEpisode(item),
        start: parseStart(item),
        stop: parseStop(item),
        // url: parseURL(item),
        // icon: parseImage(item)
      })
    })

    return programs
  },
  async channels() {
    const axios = require('axios')
    // const cheerio = require('cheerio')

    const data = await axios
      .get(`https://atlantis.epgsky.com/as/services/65523/0`, {
        headers: {
          'x-skyott-proposition': 'SKYQ',
          'x-skyott-provider': 'SKY',
          'x-skyott-territory': 'IT',
          'x-skyott-platform': 'PC',
          'x-skyott-device': 'COMPUTER',
          'x-skyott-agent': 'skyq.computer.pc',
          'User-Agent': 'Mozilla/5.0 (SKYQPC:24.1:IT)',
          'Accept-Encoding': 'deflate',
        },
        responseType: 'json',
      })
      .then(response => {
        // console.log(response.data);
        return response.data;
      })
      .catch(console.log);

    // console.log("data:", data)
    // const $ = cheerio.load(data)

    let channels = []
    if (data && data["services"]) {
      channels = data["services"].map(x => {
        let channelNumber = Number(x["c"])
        let channelName = x["t"].replaceAll('HD', '').trim()
        if (channelNumber > 250 && channelNumber < 260) {
          channelName = channelName + " " + channelNumber
        }
        let channelId = channelName.replaceAll(' ', '') + ".it"
        console.log("channelId:", channelId)
        return {
          'lang': 'it',
          'site_id': `DTH#${x["sid"]}`,
          'name': channelName,
          'xmltv_id': channelId,
        }
      })
    }
    // $('.c-channelsCard__container').each((i, el) => {
    //   const name = $(el).find('.c-channelsCard__title').text()
    //   const url = $(el).find('.c-channelsCard__link').attr('href')
    //   const [, channelId] = url.match(/\/(\d+)$/)

    //   channels.push({
    //     lang: 'it',
    //     site_id: `DTH#${channelId}`,
    //     name
    //   })
    // })

    return channels
  }
}

function parseCategory(item) {
  let category = item.content.genre.name || null
  const subcategory = item.content.subgenre.name || null
  if (category && subcategory) {
    category += `/${subcategory}`
  }
  return category
}

function parseStart(item) {
  return item.st ? dayjs.unix(item.st) : null
}

function parseStop(item) {
  return item.st && item.d ? dayjs.unix(item.st).add(item.d, 's') : null
}

function parseURL(item) {
  return item.content.url ? `https://guidatv.sky.it${item.content.url}` : null
}

function parseImage(item) {
  const cover = item.content.imagesMap ? item.content.imagesMap.find(i => i.key === 'cover') : null

  return cover && cover.img && cover.img.url ? `https://guidatv.sky.it${cover.img.url}` : null
}

function parseSeason(item) {
  if (!item.seasonnumber) return null
  if (String(item.seasonnumber).length > 2) return null
  return item.seasonnumber
}

function parseEpisode(item) {
  if (!item.episodenumber) return null
  if (String(item.episodenumber).length > 3) return null
  return item.episodenumber
}
