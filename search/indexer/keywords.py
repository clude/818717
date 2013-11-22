import re, xlrd

all_keywords = []
patterns = {}

def init_dict():
    book = xlrd.open_workbook('indexer/parse_dict.xls')
    sheet = book.sheet_by_index(0)
    for row in range(1, sheet.nrows):
        keywords = []
        for col in range(2, sheet.ncols-8):
            v = sheet.cell_value(row, col)
            v = ('%d' if isinstance(v, float) else '%s')%sheet.cell_value(row, col)
            v = v.lower().strip()
            for keyword in v.split(','):
                if keyword and keyword not in keywords:
                    keywords.append(keyword)
                    pattern = re.compile('.*(?<![a-zA-Z0-9-])%s(?![a-zA-Z0-9-]).*'%keyword.lower())
                    if not patterns.has_key(keyword):
                        patterns[keyword] = {
                            'keyword': keyword,
                            'pattern': pattern,
                            'rows': []
                        }
                    patterns[keyword]['rows'].append(row-1)
        all_keywords.append(keywords)

init_dict()

def get_keyword(trademark):
    keywords = []
    for _, item in patterns.iteritems():
        if item['pattern'].match(trademark.lower()):
            # print item['keyword'], item['rows']
            for row in item['rows']:
                for keyword in all_keywords[row]:
                    if keyword not in keywords:
                        # print row, keyword
                        keywords.append(keyword)

    return ' '.join(keywords)





