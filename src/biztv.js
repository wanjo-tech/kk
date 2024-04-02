//tv ws client tool

var web_entry = ['https://www.trading',/*${process.exit}*/,'view.com'].join('');
var ws_entry = ['wss://data.trading'+'view.com/socket.io/websocket'].join('');
var ws_headers={"Origin": web_entry, 'Referer': web_entry};

//TODO 'https://symbol-search.${SITE}/symbol_search/?text={}&hl=1&exchange={}&lang=en&type=&domain=production'

async function module_exports(){
  return {web_entry}
}
export default module_exports

/**



	if tv.IsConnected {
		tv.Send("quote_add_symbols", []interface{}{
			tv.SessionID,
			symbol,
			map[string][]string{
				"flags": []string{
					"force_permission",
				},
			},
		})
		tv.Send("quote_fast_symbols", []interface{}{
			tv.SessionID,
			symbol,
		})
	}

tv.SessionID = CreateSessionID("qs_")

	tv.Send("set_data_quality", []interface{}{"low"})
	tv.Send("set_auth_token", []interface{}{"unauthorized_user_token"})
	tv.Send("quote_create_session", []interface{}{tv.SessionID})
	tv.Send("quote_set_fields", []interface{}{tv.SessionID, "listed_exchange",
		"ch", "chp", "rtc", "rch", "rchp", "lp", "is_tradable",
		"short_name", "description", "currency_code", "current_session",
		"status", "type", "update_mode", "fundamentals",
	})


sendMessage(ws,"quote_set_fields", [session,"ch","chp","current_session","description","local_description","language","exchange","fractional","is_tradable","lp","lp_time","minmov","minmove2","original_name","pricescale","pro_name","short_name","type","update_mode","volume","currency_code","rchp","rtc"])
sendMessage(ws, "quote_add_symbols",[session, "NASDAQ:AAPL", {"flags":['force_permission']}])
sendMessage(ws, "quote_fast_symbols", [session,"NASDAQ:AAPL"])
sendMessage(ws, "resolve_symbol", [chart_session,"symbol_1","={\"symbol\":\"NASDAQ:AAPL\",\"adjustment\":\"splits\",\"session\":\"extended\"}"])
sendMessage(ws, "create_series", [chart_session, "s1", "s1", "symbol_1", "1", 5000])

HIST:
  conn = CONNECT()
  full_symbol = FORMAT_SYMBOL( symbol, exchange, is_fut ) // TODO ${exchange}:${symbol}{is_fut}
  set_auth_token(token)
  chart_create_session(chart_session,'')
  quote_create_session(session)

  quote_set_fields(session, ch, chp, current_session, description, local_description,
    language, exchange, fractional, is_tradable, lp, lp_time, minmov, minmove2, 
    original_name, pricescale, pro_name, short_name, type, update_mode, volume, currency_code, rchp, rtc)

  quote_add_symbols(session, symbol, {flags:'force_permission'})
  resolve_symbol(chart_session,`symbol_1=${o2s(symbol,adjustment:"splits",session:extended_session?"regular":"extended"})}`)
  create_series(chart_session, "s1","s1","symbol_1", interval, n_bars)

  switch_timezone(chart_session, "exchange")

  data_a = await LOOPDATA(conn,timeout=15) //timeout or "series_completed" met
  return data


FUTURE

convert pine scripts to js/py script
vectoring!


*/
