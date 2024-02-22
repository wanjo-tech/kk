var {o2s,s2o,tryx,myfetch,fs,date,now,md5,md5_ascii,urlModule} = require('./myes')
var init_time = now()

var User_Agent = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.20 Safari/537.36'
var api_entry = 'https://www.invest'+'ing.com'

///instruments/HistoricalDataAjax
//{
//    action: 'historical_data',
//    curr_id: id,
//    st_date: start, //'07/19/2015',
//    end_date: stop, //'08/19/2016',
//    interval_sec: 'Daily'
//}
//'currencies/xau-usd': {
//    pairId: '68',
//    title: 'XAU/USD - Gold Spot US Dollar',
//    name: 'XAU/USD - Gold Spot US Dollar',
//  },

var agent
argo = {proxy:'http://127.0.0.1:7777'} //TODO get from parent config..?
if (argo.proxy) agent = new (require('https-proxy-agent').HttpsProxyAgent)(urlModule.parse(argo.proxy))

var history_s = async(body)=>{
    var {data,headers} = await require('./myes').myfetch(`${api_entry}/instruments/HistoricalDataAjax`,{
      method:'POST',
      body,
      agent,
      headers:{'User-Agent':User_Agent}
    })
    return [data.toString(),headers]
}
var news_headlines_s = async()=>{
    var {data,headers} = await require('./myes').myfetch(`${api_entry}/news/headlines`,{headers:{'User-Agent':User_Agent},agent})
    return [data.toString(),headers]
}
var ywcq_news_headlines_a = async()=>{
    var [data_s] = await news_headlines_s()
    var $ = require('cheerio').load(data_s)
    var rt = []
    //for (var div of $('article')){ rt.push( $(div).text() ) }	
    $('article').each(function() {
            // For each article, find the `a.title` element to get the title and link
            var titleElement = $(this).find('a.title');

            // Extract the `href` attribute for the link and the text content for the title
            var link = titleElement.attr('href');
            var title = titleElement.attr('title'); // or titleElement.text() for the visible text

            // Add an object containing both title and link to the results array
            rt.push({ link, title });
    });
    return rt
}
// e.g. curl -X POST http://127.0.0.1 -d "news.ywcq_news_headlines_a()"

module.exports = {
    init_time,

    ywcq_news_headlines_a,
}
