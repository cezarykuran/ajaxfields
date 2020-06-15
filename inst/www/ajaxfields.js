ajaxfields = {
  mods : {},

  onkeyup : function(o, ns) {
    if(typeof ajaxfields.mods[ns] === undefined) return;

    ajaxfields.mods[ns].icnt = 1
    if(ajaxfields.mods[ns].i == -1) {
      ajaxfields.mods[ns].i = window.setInterval(ajaxfields.intervalCallback, 500, o, ns)
    }
  },

  intervalCallback : function(o, ns) {
    if(ajaxfields.mods[ns].icnt++ < 3)
      return;

    window.clearInterval(ajaxfields.mods[ns].i)
    ajaxfields.mods[ns].i = -1

    if(o.value.length > 0 && o.value != ajaxfields.mods[ns].cache) {
      ajaxfields.mods[ns].cache = o.value

      $('#' + ns).children('.ajaxfields-list').addClass('ajaxfields-list-bussy')
      ajaxfields.ajax[ajaxfields.mods[ns].engine].request(ns, o.value)
    }
  },

  ajax : {
    simple : {
      request : function(ns, txt) {
        $.ajax({
            'method'    : 'POST',
            'url'       : ajaxfields.mods[ns].url,
            'data'      : {s : txt},
            'dataType'  : 'json',
            'cache'     : false,
            'success'   : function(d){ajaxfields.ajax.simple.success(ns, d)},
            'error'     : function(d){ajaxfields.ajax.simple.error(ns)}
        })
      },

      success : function(ns, d) {
        var $o = $('#' + ns).children('.ajaxfields-list')

        $o.removeClass('ajaxfields-list-bussy')

        if(d.status == 'error')
          $o.html(d.data)
        else {
          $o.html('')
          $.each(d.data, function(){
            $o.append(
              $(document.createElement('DIV'))
                .addClass('ajaxfields-list-item')
                .attr('onclick', "ajaxfields.onclick(this)")
                .attr('data-id', this.id)
                .attr('data-name', this.name)
                .append([
                  $(document.createElement('I'))
                    .addClass('glyphicon glyphicon-unchecked'),
                  $(document.createElement('I'))
                    .addClass('glyphicon glyphicon-check'),
                  $(document.createElement('SPAN'))
                    .addClass('ajaxfields-list-item-id')
                    .html(this.id),
                  $(document.createElement('SPAN'))
                    .addClass('ajaxfields-list-item-name')
                    .html(this.name)
              ])
            )
          })
        }
      },

      error : function(ns) {

      }
    },

    es : {
      request : function(ns, txt) {
        $.ajax({
            'method'    : 'GET',
            'url'       : ajaxfields.mods[ns].url + '/_search',
            'data'      : {
              'q' : 'name:*' + txt + '*',
              'size' : 1000
            },
            'dataType'  : 'json',
            //'cache'     : false,
            'success'   : function(d){ajaxfields.ajax.es.success(ns, d)},
            'error'     : function(d){ajaxfields.ajax.es.error(ns)}
        })
      },

      success : function(ns, d) {
        var $o = $('#' + ns).children('.ajaxfields-list')

        $o.removeClass('ajaxfields-list-bussy')

        if(d.status == 'error')
          $o.html(d.data)
        else {
          $o.html('')
          $.each(d.hits.hits, function(){
            $o.append(
              $(document.createElement('DIV'))
                .addClass('ajaxfields-list-item')
                .attr('onclick', "ajaxfields.onclick(this)")
                .attr('data-id', this._source.id)
                .attr('data-name', this._source.name)
                .append([
                  $(document.createElement('I'))
                    .addClass('glyphicon glyphicon-unchecked'),
                  $(document.createElement('I'))
                    .addClass('glyphicon glyphicon-check'),
                  $(document.createElement('SPAN'))
                    .addClass('ajaxfields-list-item-id')
                    .html(this._source.id),
                  $(document.createElement('SPAN'))
                    .addClass('ajaxfields-list-item-name')
                    .html(this._source.name)
              ])
            )
          })
        }

      },

      error : function() {

      }
    }
  },

  onclick : function(o) {
    var $o = $(o)

    if($o.hasClass('ajaxfields-list-item-checked')) {
      $o.removeClass('ajaxfields-list-item-checked')
    }
    else {
      $o.addClass('ajaxfields-list-item-checked')
    }

    var data = {}
    $.each($o.parent().children(), function(){
      var $i = $(this)
      if($i.hasClass('ajaxfields-list-item-checked')) data[parseInt($i.attr('data-id'))] = $i.attr('data-name')
    })
    Shiny.setInputValue($o.closest('.ajaxfields-container').attr('id'), data);
  }
}

Shiny.addCustomMessageHandler('ajaxfields', function(conf) {
  console.log(conf)
  ajaxfields.mods[conf.ns] = {
    'i' : -1,
    'icnt' : 1,
    'cache' : '',
    'engine' : conf.engine,
    'url' : conf.url
  }
});
