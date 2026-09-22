import MetaTrader5 as mt5
import os
import json
from datetime import datetime, timedelta

def get_trades():
    # Environment Variables
    login = int(os.getenv("MT5_LOGIN", 0))
    password = os.getenv("MT5_PASSWORD", "")
    server = os.getenv("MT5_SERVER", "")
    days_back = int(os.getenv("DAYS_BACK", 30))

    if not mt5.initialize():
        print(json.dumps({"error": "MT5 initialization failed"}))
        return []

    if not mt5.login(login=login, password=password, server=server):
        print(json.dumps({"error": f"Login failed: {mt5.last_error()}"}))
        mt5.shutdown()
        return []

    from_date = datetime.now() - timedelta(days=days_back)
    to_date = datetime.now()
    
    deals = mt5.history_deals_get(from_date, to_date)
    
    trade_list = []
    if deals:
        for deal in deals:
            trade_list.append({
                "ticket": deal.ticket,
                "symbol": deal.symbol,
                "profit": deal.profit,
                "volume": deal.volume,
                "time": deal.time_msc
            })
    
    mt5.shutdown()
    return trade_list

if __name__ == "__main__":
    print(json.dumps(get_trades()))
