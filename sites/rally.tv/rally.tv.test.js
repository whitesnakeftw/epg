const { parser, url } = require('./rally.tv.config.js')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)
dayjs.extend(utc)

const date = dayjs.utc('2024-09-06', 'YYYY-MM-DD').startOf('d')
const channel = {
  site_id: 'rallytv',
  xmltv_id: 'RallyTV.us'
}
const content =
  '{"middlewareRequestCid":"e23d83bb-dd9d-4866-a09c-76d3e68049b6","$xmlns":{"wrc":"http://cts.comcast.com/fields/tvp/wrc"},"startIndex":1,"itemsPerPage":2,"entryCount":1,"title":"ERA:All Channel Schedules","entries":[{"guid":"wrc-channel-rally-tv","title":"Rally.TV","callSign":"rallytv","listings":[{"id":"Mid-Season Review | WRC 2024","startTime":1725579000000,"endTime":1725582000000,"program":{"title":"Mid-Season Review | WRC 2024","guid":"WRC_2024_00_Editorial_WRC24_MID_SEASON_REVIEW","description":"The first half of the 2024 World Rally Championship season has been nothing short of spectacular! From dominant victories to incredible comebacks, the rally stages have been packed with action and drama. Relive the best highlights and see how your favourite drivers have battled the variety of terrains throughout the first six rallies of 2024.","tvSeasonEpisodeNumber":1718289272,"tvSeasonId":null,"tvSeasonNumber":null,"year":2024},"images":[{"url":"https://wrc-vod-prod.akamaized.net/prod/image/WRC_Production_-_Main/279/488/WRC2024_MidSeasonReview.jpg","width":1920,"height":1080,"type":"landscape"},{"url":"https://wrc-vod-prod.akamaized.net/prod/image/WRC_Production_-_Main/279/488/WRC2024_MidSeasonReview_420x1080_1807573573396.jpg","width":420,"height":236,"type":"landscape"},{"url":"https://wrc-vod-prod.akamaized.net/prod/image/WRC_Production_-_Main/279/488/WRC2024_MidSeasonReview_720x1080_1807573573402.jpg","width":720,"height":405,"type":"landscape"}]}]}]}';

it('can generate valid url', () => {
  expect(url({ channel, date })).toBe(
    'https://api.rally.tv/content/channels?byListingTime=1725580800000~1725667199999&byCallSign=rallytv&range=-1'
  )
})

it('can parse response', () => {
  const result = parser({ content, channel, date })

  expect(result).toMatchObject([
    {
      title: 'Mid-Season Review | WRC 2024',
      episode: 1718289272,
      image: 'https://wrc-vod-prod.akamaized.net/prod/image/WRC_Production_-_Main/279/488/WRC2024_MidSeasonReview_720x1080_1807573573402.jpg',
      start: 1725579000000,
      stop: 1725582000000
    }
  ])
})

it('can handle empty guide', () => {
  const result = parser({
    date,
    channel,
    content: '{}'
  })
  expect(result).toMatchObject([])
})
