ajaxfields = {
  mods : {},

  input : {
    onkeyup : function(o, ns) {
      if(typeof ajaxfields.mods[ns] === undefined)
        return

      ajaxfields.mods[ns].icnt = 1
      if(ajaxfields.mods[ns].i == -1) {
        ajaxfields.mods[ns].i = window.setInterval(ajaxfields.input.intervalCallback, 250, o, ns)
      }
    },

    intervalCallback : function(o, ns) {
      if(ajaxfields.mods[ns].icnt++ < 3)
        return;

      window.clearInterval(ajaxfields.mods[ns].i)
      ajaxfields.mods[ns].i = -1

      if(o.value.length > 0 && o.value != ajaxfields.mods[ns].cache) {
        ajaxfields.mods[ns].cache = o.value
        ajaxfields.ajax.request(ns, o.value)
      }
    }
  },

  ajax : {
    request : function(ns, s) {
      var $container = $('#' + ns)
      $container.children('.ajaxfields-list').addClass('ajaxfields-list-bussy')
      $container.children('.ajaxfields-state').text('loading..')

      var provider = ajaxfields.mods[ns].provider;
      var limit = typeof ajaxfields.mods[ns].limit === undefined
        ? 1000
        : ajaxfields.mods[ns].limit

      $.ajax({
          'url'       : ajaxfields.mods[ns].url,
          'method'    : ajaxfields.ajax.providers[provider].method,
          'data'      : ajaxfields.ajax.providers[provider].preData(s, limit),
          'dataType'  : 'json',
          //'cache'     : false,
          'success'   : function(d){ajaxfields.ajax.response('success', ns, d)},
          'error'     : function(d){ajaxfields.ajax.response('error', ns, d)}
      })
    },

    response : function(type, ns, d) {
      var $container = $('#' + ns)
      var $list = $container.children('.ajaxfields-list')
      var $state = $container.children('.ajaxfields-state')

      $list.removeClass('ajaxfields-list-bussy')

      if(type == 'success') {
        d = ajaxfields.ajax.providers[ajaxfields.mods[ns].provider].postData(d)

        if(!d.error) {
          $list.html('')
          $.each(d.data, function(){
              ajaxfields.listItemInsert($list, this.id, this.name)
          })
          $state.text(
            (d.total == d.dataSize
              ? 'found ' + d.dataSize
              : 'first ' + d.dataSize + ' of ' + d.total + ' (results trimed)'
            )
            + ', time ' + d.time)
          return
        }
      }

      $list.text('Sorry, something goes wrong..')
      $state.text('')
    },

    providers : {
      simple : {
        method : 'POST',

        preData : function(s, limit) {
          return {
            s : s,
            limit : limit
          }
        },

        postData : function(d) {
          return {
            error : d.status != 'ok',
            total : d.total,
            data : d.data,
            dataSize : d.dataSize,
            time : d.time
          }
        }
      },

      es : {
        method : 'GET',

        preData : function(s, limit) {
          return {
            'q' : 'name:*' + s + '*',
            'size' : limit
          }
        },

        postData : function(d) {
          r = {
            error : false,
            total : d.hits.total.value,
            data : [],
            dataSize : d.hits.hits.length,
            time : d.took + 'ms'
          }

          $.each(d.hits.hits, function(){
            r.data.push({id : this._source.id, name : this._source.name})
          })

          return r;
        }
      }
    }
  },


  listItemInsert : function($list, id, name) {
    $list.append(
      $(document.createElement('DIV'))
        .addClass('ajaxfields-list-item')
        .attr('onclick', "ajaxfields.listItemClick(this)")
        .attr('data-id', id)
        .attr('data-name', name)
        .append([
          $(document.createElement('I'))
            .addClass('glyphicon glyphicon-unchecked'),
          $(document.createElement('I'))
            .addClass('glyphicon glyphicon-check'),
          $(document.createElement('SPAN'))
            .addClass('ajaxfields-list-item-id')
            .text(id),
          $(document.createElement('SPAN'))
            .addClass('ajaxfields-list-item-name')
            .text(name)
        ])
    )
  },

  listItemClick : function(o) {
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
  ajaxfields.mods[conf.ns] = {
    'i' : -1,
    'icnt' : 1,
    'cache' : '',
    'provider' : conf.engine,
    'url' : conf.url,
    'limit' : conf.limit
  }
});
