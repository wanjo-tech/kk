var {o2s,s2o,tryx,myfetch,fs,date,now,md5,md5_ascii,tryRequire} = require('./myes')
var init_time = now()
module.exports = async (opts)=>{
  var {req,res,url,body,argo,app_id}=opts;

  //if (!body) body = url // let url became body,e.g. https://localhost:50080/2**3
  if (!body){
    //console.log('nobody',url)
    //res.writeHead(404, {});
    res.end(o2s({code:404,msg:url}))
    return
  }
  console.log('body=>',body)
  if ('favicon.ico'==body) throw 'favicon'
	//////////////////////////
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

	var history_s = async(body)=>{
		var {data,headers} = await require('./myes').myfetch(`${api_entry}/instruments/HistoricalDataAjax`,{
                  method:'POST',
                  body,
                  headers:{'User-Agent':User_Agent}
                })
		return [data.toString(),headers]
	}
	var news_headlines_s = async()=>{
		var {data,headers} = await require('./myes').myfetch(`${api_entry}/news/headlines`,{headers:{'User-Agent':User_Agent}})
		return [data.toString(),headers]
	}
	var news_headlines_a = async()=>{
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
	// e.g. curl -X POST http://127.0.0.1 -d "news_headlines_a()"
	var ctx = {
          history_s,
          news_headlines_a,
          o2s,
	}
	//////////////////////////
	return res.end(o2s(await require('./myevalp')(body,ctx)))
}


