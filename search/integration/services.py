__author__ = 'zhuclude'

from integration.models import Trace

def get_pv_rpt_by_day(conditions):
    #TODO: add search filters to pipline
    date_start = conditions.get('date_start')
    date_end = conditions.get('date_end')

    pipeline = [
        {"$project":
             {
                 "day":"$day",
                 "uid": "$uid",
                 "pc":{"$cond": [{"$eq": ["$type", "1"]}, 1, 0]},
                 "sc":{"$cond": [{"$eq": ["$type", "2"]}, 1, 0]}
             }
        },
        { "$group":
              {
                  "_id": { "day": "$day", "uid": "$uid" },
                  "pc": {"$sum": "$pc"},
                  "sc": {"$sum": "$sc"}
              }
        },
        { "$group":
              {
                  "_id": "$_id.day",
                  "pc": {"$sum": "$pc"},
                  "sc": {"$sum": "$sc"},
                  "uc": {"$sum": 1}
              }
        }
    ]

    rst = Trace._get_collection().aggregate(pipeline)
    return rst.get('result')
