
var sha1 = require('sha1')
  , max = 9999999.0;

var utils = {
  numberOnly: function(originString, price)  {
    if (!originString) return 0;
    var result = originString.replace(/[^0-9.]+/g, '');
    if (!result) return max;
    result = parseFloat(result);
    return price && result < 2000 ? max : result;
  },
  cellOnly: function(originString) {
    if (!originString) return '';
    var result = originString.match(/1[3-9][0-9]{9}/);
    return result ? result[0] : '';
  },
  analyzeSpec: function(spec) {
    if (!spec)  {
      return { width: 0, thick: 0 }
    }
    var result = spec.replace(/[^0-9.]+/g, ' ')
      , parts = result.trim().split(' ')
    ;

    return {
      width: parts.length > 0 && parseFloat(parts[0]) ? parseFloat(parts[0]) : 0,
      thick: parts.length > 1 && parseFloat(parts[1]) ? parseFloat(parts[1]) : 0
    };
  },
  analyzeTags: function(tagString)  {
    var matchList = [];
    TAGS.forEach(function(tagGroup){
      var hit = false;
      tagGroup.forEach(function(tag){
        if (tagString.match(tag))
          hit = true;
      })
      if (hit)  {
        matchList = matchList.concat(tagGroup);
      }
    })
    return matchList;
  }
}

function group (item) {
  var spec = utils.analyzeSpec(item.spec)
    , tags = utils.analyzeTags(item.model+item.trademark+item.producer)
  ;

  item.group = sha1(tags.join(' ') + spec.width + spec.height);
  item.json = JSON.stringify(item);
  item._meta = {
    tags: tags.join(' '),
    width: spec.width,
    thick: spec.thick,
    hash: item.group
  };
}

function process(item)  {
  var s1 = item.model+item.trademark+item.spec+item.url+item.producer+item.stock_location+item.store_name+item.spider
    , h1 = sha1(s1)
  ;
  item.time = new Date().getTime();
  item.price_float = utils.numberOnly(item.price, true);
  item.weight_float = utils.numberOnly(item.weight);
  item.phone_cell = utils.cellOnly(item.phone_number);
  item.hash = h1;
  group(item);
  return item
}
