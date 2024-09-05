const dayjs = require('dayjs')

module.exports = {
  site: 'rally.tv',
  days: 2,
  url: function ({ date, channel }) {
    return `https://api.rally.tv/content/channels?byListingTime=${dayjs(date).startOf('d').valueOf()}~${dayjs(date).endOf('d').valueOf()}&byCallSign=${channel.site_id}&range=-1`
  },
  parser: function ({ content, channel }) {
    const data = JSON.parse(content);
    const programs = data?.entries?.find(x => x.callSign === channel.site_id)?.listings?.map(item => {
      return {
        title: item.program?.title || item.id,
        description: item.program?.description,
        // date: dayjs({year: item.program?.year}),
        season: item.program?.tvSeasonNumber,
        episode: item.program?.tvSeasonEpisodeNumber,
        image: item.images?.find(x => x.type === "landscape" && x.width > 700 && x.width < 800)?.url,
        start: dayjs.unix(item.startTime).unix(),
        stop: dayjs.unix(item.endTime).unix(),
        // categories: parseCategories(item),
        // actors: parseCast(info, 'Avec :'),
        // director: parseCast(info, 'De :'),
        // writer: parseCast(info, 'Scénario :'),
        // composer: parseCast(info, 'Musique :'),
        // presenter: parseCast(info, 'Présenté par :'),
        // rating: parseRating(info),
      };
    }) || []

    return programs
  },
  async channels() {
    const axios = require('axios')

    const data = await axios
      .get(`https://api.rally.tv/content/channels?byListingTime=${dayjs().startOf('d').valueOf()}~${dayjs().endOf('d').valueOf()}&range=-1`, {
        headers: {
          'Accept-Encoding': 'identity',
        },
        responseType: 'json',
      })
      .then(r => r.data)
      .catch(console.log)

    let channels = data && data.entries ? data.entries.map(item => {
      const title = item.title.replaceAll('.','') + '.us'
      console.log(title)
      return {
        lang: 'en',
        site_id: item.callSign,
        xmltv_id: title,
        name: item.title,
      }
    }) : []

    return channels
  }
}
