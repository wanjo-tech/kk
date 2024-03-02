var {o2s,s2o,tryx,myfetch,fs,date,now,md5,md5_ascii,urlModule,argv2o} = require('./myes')
var init_time = now()
const argo = argv2o();

var User_Agent = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.20 Safari/537.36'
var web_entry = 'https://cn.invest'+'ing.com'
var api_entry = 'https://api.invest'+'ing.com'

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

// 945629 BTC/USD

var agent
if (argo.proxy) agent = new (require('https-proxy-agent').HttpsProxyAgent)(urlModule.parse(argo.proxy))

//https://github.com/alvarobartt/investpy/issues/591 instruments/HistoricalDataAjax discontinued

var history_s = async(id,interval='PT15M',pointscount=160)=>{
    var u = `${api_entry}/api/financialdata/${id}/historical/chart/?interval=${interval}&pointscount=${pointscount}`
    console.log('history_s',u)
    var {data,headers} = await myfetch(u,{
      method:'GET',
      agent,
      headers:{'User-Agent':User_Agent,'Referer':api_entry}
    })
    cookieString = [(headers['set-cookie'] || []).join('; ')]
    console.log('cookieString',cookieString)
    return [data.toString(),headers]
}
var history_o = async(id,interval,pointscount)=>{
  var [data] = await history_s(id,interval,pointscount)
  return data
}

var headlines_s = async()=>{
    var {data,headers} = await myfetch(`${web_entry}/news/headlines`,{headers:{'User-Agent':User_Agent},agent})
    return [data.toString(),headers]
}
var latest_s = async()=>{
    var {data,headers} = await myfetch(`${web_entry}/news/latest-news`,{headers:{'User-Agent':User_Agent},agent})
    return [data.toString(),headers]
}
var headline_a = async()=>{
    var [data_s] = await headlines_s()
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
var latest_a = async()=>{
    var [data_s] = await latest_s()
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

// e.g.
//curl -X POST http://127.0.0.1 -d "news.headline_a()"

module.exports = {
    init_time,

    headline_a,
    latest_a,

    history_o,
}
