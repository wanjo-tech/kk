module.exports = async (opts)=>{

	var {o2s,s2o,tryx,myfetch,fs,date,now} = require('./myes')
	var {req,res,url,body}=opts;

	if (!body) body = decodeURI(url)
	if (!body){
		console.log('nobody',url)
		res.writeHead(404, {});
		res.end(o2s({code:404,msg:url}))
		return
	}
	console.log('body=>',body)
	//////////////////////////
	var User_Agent = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.20 Safari/537.36'
	var api_entry = 'https://www.invest'+'ing.com'
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
		news_headlines_a,
	}
	//////////////////////////
	return res.end(o2s(await require('./myevalp')(body,ctx)))
}


