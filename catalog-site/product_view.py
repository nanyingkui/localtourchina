from html import escape
from catalog_registry import records
CATALOG={k:None for k in ('34','45','45furong','56','56fh','trek34','trek45','trek56')}
def itinerary(product_id,lang='ko'):
    record=records()[product_id]
    return ''.join('<h3>'+escape(plan['title'][lang])+'</h3><ol>'+''.join('<li><strong>'+escape(day['title'][lang])+'</strong><p>'+escape(day['text'][lang])+'</p></li>' for day in plan['days'])+'</ol>' for plan in record.get('plans',[]))
