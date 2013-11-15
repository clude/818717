
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
    return result ? parseInt(result[0]) : 0;
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
    });
    return matchList;
  }
}

function group (item) {
  var
    spec = utils.analyzeSpec(item.spec),
    tags = utils.analyzeTags(item.model+item.trademark+item.producer);

  item.extended = tags.join(' ');
  item.width = spec.width;
  item.thick = spec.thick;
  item.group_hash = 'group_'+sha1(item.extended + spec.width + spec.height);
  //item.json = JSON.stringify(item);
  item.json = JSON.stringify(item).replace(/(\r\n|\n|\r)/gm," "); // replace line break for safety purpose
}

function process(item)  {
  var
    s1 = item.model+item.trademark+item.spec+item.producer+item.warehouse+item.store_raw,
    h1 = 'id_'+sha1(s1),
    s2 = s1+item.source_raw+item.price_raw+item.weight_raw+item.cell_raw,
    h2 = 'full_'+sha1(s2);

  item.time = new Date().getTime();
  item.price_float = utils.numberOnly(item.price_raw, true);
  item.weight_float = utils.numberOnly(item.weight_raw);
  item.cell_uint = utils.cellOnly(item.cell_raw);
  item.id_hash = h1;
  item.full_hash = h2;
  group(item);
  return item
}
